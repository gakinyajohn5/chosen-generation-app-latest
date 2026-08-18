/* ════════════════════════════════════════════════════════
   CHOSEN GENERATION APP — server.js
   Express backend: Gemini AI + yt-dlp + Mpesa STK Push

   INSTALL:
     npm install express dotenv @google/genai multer node-fetch

   CREATE .env:
     GEMINI_API_KEY=your_key_here
     PORT=3000
     MPESA_CONSUMER_KEY=rYv8YsRu4Id2hIiCTUuYX7OciewbKxU1tV2Wr7VltwzFzPZu
     MPESA_CONSUMER_SECRET=Pre1FBveekJQZGLGHm7alwba8sOW8ts3EFIWMu0Jpxo8jilUdZmAeMLyB8fh5IeI
     MPESA_SHORTCODE=174379
     MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
     MPESA_CALLBACK_URL=https://YOUR_PUBLIC_URL/api/mpesa/callback
     MPESA_AMOUNT=20

   NOTE: MPESA_SHORTCODE and MPESA_PASSKEY above are Safaricom sandbox defaults.
         Replace with your production values when going live.
         MPESA_CALLBACK_URL must be a public HTTPS URL (use ngrok for local dev).

   START:
     node server.js
════════════════════════════════════════════════════════ */

'use strict';

require('dotenv').config();

const express        = require('express');
const path           = require('path');
const os             = require('os');
const fs             = require('fs');
const { exec, spawn } = require('child_process');
const { GoogleGenAI } = require('@google/genai');
const pool           = require('./db/pool');
const communityRoutes = require('./db/routes');

const app           = express();
const PORT          = process.env.PORT || 3000;
const GEMINI_KEY    = process.env.GEMINI_API_KEY || 'PASTE_YOUR_KEY_HERE';
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

/* ────────────────────────────────────────────────────────
   MPESA CONFIGURATION
──────────────────────────────────────────────────────── */
const https = require('https');

const MPESA = {
  // No hardcoded secrets — these must be set as environment variables on Render.
  CONSUMER_KEY:    process.env.MPESA_CONSUMER_KEY    || '',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  // Safaricom's publicly published Daraja SANDBOX test values (safe defaults, only used when MPESA_ENV=sandbox)
  SHORTCODE:       process.env.MPESA_SHORTCODE       || '174379',
  PASSKEY:         process.env.MPESA_PASSKEY         || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  CALLBACK_URL:    process.env.MPESA_CALLBACK_URL    || 'https://YOUR_PUBLIC_URL/api/mpesa/callback',
  AMOUNT:          process.env.MPESA_AMOUNT          || '20',
  // Defaults to sandbox so you can't accidentally take live payments by forgetting to set this.
  ENV:             process.env.MPESA_ENV             || 'sandbox',
};

const MPESA_BASE = MPESA.ENV === 'sandbox'
  ? 'https://sandbox.safaricom.co.ke'
  : 'https://api.safaricom.co.ke';

// In-memory store for pending STK transactions
const stkPending = {};

/* ── Mpesa: Get OAuth Access Token ── */
// Uses Node's built-in https module to avoid any fetch/node-fetch issues
function getMpesaToken() {
  return new Promise((resolve, reject) => {
    const credentials = Buffer.from(`${MPESA.CONSUMER_KEY}:${MPESA.CONSUMER_SECRET}`).toString('base64');
    const host        = MPESA.ENV === 'sandbox' ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';

    const options = {
      hostname: host,
      path:     '/oauth/v1/generate?grant_type=client_credentials',
      method:   'GET',
      headers:  { Authorization: `Basic ${credentials}` }
    };

    console.log(`[MPESA] Token request → https://${host}/oauth/v1/generate`);

    const req = https.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        console.log(`[MPESA] Token response status: ${res.statusCode}`);
        console.log(`[MPESA] Token response body: ${raw}`);
        try {
          const data = JSON.parse(raw);
          if (data.access_token) {
            resolve(data.access_token);
          } else {
            reject(new Error(`No access_token. Response: ${raw}`));
          }
        } catch (e) {
          reject(new Error(`JSON parse error. Raw: ${raw}`));
        }
      });
    });

    req.on('error', err => {
      console.error('[MPESA] Token request error:', err.message);
      reject(err);
    });

    req.end();
  });
}

/* ── Mpesa: STK Push HTTP request ── */
function mpesaPost(path, token, body) {
  return new Promise((resolve, reject) => {
    const host    = MPESA.ENV === 'sandbox' ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';
    const payload = JSON.stringify(body);

    const options = {
      hostname: host,
      path,
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        console.log(`[MPESA] POST ${path} → ${res.statusCode}: ${raw}`);
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`JSON parse error: ${raw}`)); }
      });
    });

    req.on('error', err => {
      console.error(`[MPESA] POST ${path} error:`, err.message);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

/* ── Mpesa: Build timestamp and password ── */
function getMpesaTimestampAndPassword() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timestamp =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const password = Buffer.from(`${MPESA.SHORTCODE}${MPESA.PASSKEY}${timestamp}`).toString('base64');
  return { timestamp, password };
}

/* ── Mpesa: Normalise phone to 254XXXXXXXXX ── */
function normaliseMpesaPhone(raw) {
  let p = raw.replace(/\D/g, '');
  if (p.startsWith('0'))    p = '254' + p.slice(1);
  if (p.startsWith('+254')) p = p.slice(1);
  if (!p.startsWith('254')) p = '254' + p;
  if (!/^2547\d{8}$/.test(p) && !/^2541\d{8}$/.test(p))
    throw new Error('Phone must be a valid Kenyan Safaricom number (07xx or 01xx).');
  return p;
}

// Ensure downloads folder exists
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

/* ────────────────────────────────────────────────────────
   MIDDLEWARE
──────────────────────────────────────────────────────── */
// Gzip/Brotli-compress responses (bible-sw.json is ~3.7MB uncompressed;
// text like this typically compresses to ~1/4 of its size over the wire).
app.use(require('compression')());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '.')));

// Announcements, events, prayers, contributions, RSVPs, amens, activity log —
// all backed by Postgres now, see db/routes.js
app.use('/api', communityRoutes);

/* ────────────────────────────────────────────────────────
   SYSTEM PROMPT
──────────────────────────────────────────────────────── */
const SYSTEM_INSTRUCTION =
`You are the Chosen Generation App AI Faith Assistant, a dedicated spiritual companion \
for a small, tight-knit Christian fellowship community of 30 members. \
Your purpose is to provide biblically sound answers, help summarize sermon notes, \
give contextual insights into both the KJV and Swahili Bibles, draft uplifting prayers, \
and assist in theological studies. \
Your tone must always be deeply encouraging, respectful, wise, and grounded in mainstream Christian scripture. \
When asked about scripture, provide cross-references in both English and Kiswahili where appropriate. \
Keep responses concise, engaging, and readable on mobile. \
Use **bold** for key terms, *italics* for direct scripture quotes, and bullet lists where helpful. \
Never discuss topics outside Christian faith and community life.`;

/* ────────────────────────────────────────────────────────
   GEMINI CLIENT
──────────────────────────────────────────────────────── */
let genAI = null;
function getClient() {
  if (!genAI) genAI = new GoogleGenAI({ apiKey: GEMINI_KEY });
  return genAI;
}

/* ────────────────────────────────────────────────────────
   ① POST /api/chat
──────────────────────────────────────────────────────── */
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string' || !message.trim())
    return res.status(400).json({ error: 'Missing or empty message.' });

  const userMessage = message.trim().slice(0, 1000);
  let contents = [];
  if (Array.isArray(history)) {
    contents = history
      .filter(h => (h.role === 'user' || h.role === 'model') && Array.isArray(h.parts) && h.parts[0]?.text)
      .slice(-18)
      .map(h => ({ role: h.role, parts: h.parts }));
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    const result = await getClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION, maxOutputTokens: 800, temperature: 0.75, topP: 0.9 }
    });
    const text = result.text;
    if (!text) return res.status(500).json({ error: 'Empty response. Try again.' });
    return res.json({ response: text });
  } catch (err) {
    console.error('[AI] Error:', err.message || err);
    if (/API_KEY_INVALID|invalid.*key|401/i.test(err.message || ''))
      return res.status(500).json({ error: 'Invalid Gemini API key. Update GEMINI_API_KEY in .env' });
    if (/RESOURCE_EXHAUSTED|quota|429/i.test(err.message || ''))
      return res.status(429).json({ error: 'AI quota exceeded. Wait a moment and try again.' });
    if (/SAFETY/i.test(err.message || ''))
      return res.status(200).json({ response: 'Please ask a faith-related question.' });
    return res.status(500).json({ error: `AI error: ${err.message || 'Unknown error'}` });
  }
});

/* ────────────────────────────────────────────────────────
   yt-dlp helpers (from GrabSave)
──────────────────────────────────────────────────────── */
// Optional YouTube cookies file — if present, yt-dlp uses it to look like a
// real signed-in browser instead of an anonymous cloud server, which avoids
// YouTube's "Sign in to confirm you're not a bot" block. See DEPLOY.md.
//
// Render mounts Secret Files read-only at /etc/secrets/..., but yt-dlp tries
// to WRITE BACK an updated cookie jar after every run (it rotates cookies as
// it uses them). Writing to a read-only path crashes with
// "OSError: Read-only file system". So on startup we copy the secret file
// into a writable temp location and point yt-dlp at that copy instead —
// yt-dlp can freely read/update it there without touching the read-only original.
const SECRET_COOKIES_PATH = process.env.COOKIES_FILE || '/etc/secrets/cookies.txt';
const COOKIES_PATH = path.join(os.tmpdir(), 'yt-cookies.txt');

function refreshWritableCookies() {
  try {
    if (fs.existsSync(SECRET_COOKIES_PATH)) {
      fs.copyFileSync(SECRET_COOKIES_PATH, COOKIES_PATH);
      return true;
    }
  } catch (err) {
    console.warn('[COOKIES] Could not copy cookies file to writable location:', err.message);
  }
  return false;
}
const cookiesAvailable = refreshWritableCookies();

const hasCookies   = () => fs.existsSync(COOKIES_PATH);
const cookiesFlag  = () => hasCookies() ? `--cookies "${COOKIES_PATH}"` : '';

function ytdlp(args) {
  return new Promise((resolve, reject) => {
    exec(`yt-dlp ${cookiesFlag()} ${args}`, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}

function sanitize(str) {
  return str.replace(/[^\w\s\-.()\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
}

function formatBytes(bytes) {
  if (!bytes || bytes < 0) return null;
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(0) + ' MB';
  return (bytes / 1e3).toFixed(0) + ' KB';
}

function formatDuration(secs) {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

/* ────────────────────────────────────────────────────────
   ② GET /api/download/info?url=...
   (changed to GET with url param to match GrabSave style,
    but also supports POST with videoId for backward compat)
──────────────────────────────────────────────────────── */
async function fetchVideoInfo(url) {
  const raw  = await ytdlp(`--dump-json --no-playlist "${url}"`);
  const info = JSON.parse(raw);

  const formats   = (info.formats || []).filter(f => f.url);
  const combined  = [];
  const videoOnly = [];
  const audioOnly = [];
  const seen      = new Set();

  for (const f of formats) {
    const hasV  = f.vcodec && f.vcodec !== 'none';
    const hasA  = f.acodec && f.acodec !== 'none';
    const h     = f.height;
    const ext   = f.ext || 'mp4';

    if (hasV && hasA) {
      const key = `${h}p-${ext}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({ format_id: f.format_id, quality: h ? `${h}p` : 'SD', ext, filesize: formatBytes(f.filesize || f.filesize_approx), fps: f.fps, type: 'video' });
      }
    } else if (hasV && !hasA && h) {
      const key = `v-${h}p-${ext}`;
      if (!seen.has(key)) {
        seen.add(key);
        videoOnly.push({ format_id: f.format_id, quality: `${h}p`, ext, filesize: formatBytes(f.filesize || f.filesize_approx), fps: f.fps, type: 'video-only' });
      }
    } else if (hasA && !hasV) {
      const abr = f.abr ? Math.round(f.abr) : null;
      const key = `a-${abr}-${ext}`;
      if (!seen.has(key)) {
        seen.add(key);
        audioOnly.push({ format_id: f.format_id, quality: abr ? `${abr}kbps` : 'Audio', ext, filesize: formatBytes(f.filesize || f.filesize_approx), abr, type: 'audio' });
      }
    }
  }

  const sortByQ = arr => arr.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));
  sortByQ(combined); sortByQ(videoOnly); sortByQ(audioOnly);
  if (combined.length)  combined[0].badge  = 'best';
  if (videoOnly.length) videoOnly[0].badge = 'best';

  return {
    title:     info.title,
    channel:   info.uploader || info.channel,
    duration:  formatDuration(info.duration),
    thumbnail: info.thumbnail,
    videoId:   info.id,
    formats: { combined, videoOnly, audioOnly }
  };
}

// POST /api/download/info  (called by existing frontend with { videoId })
app.post('/api/download/info', async (req, res) => {
  const { videoId } = req.body;
  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId))
    return res.status(400).json({ error: 'Invalid YouTube video ID.' });

  try {
    const data = await fetchVideoInfo(`https://www.youtube.com/watch?v=${videoId}`);

    // Flatten formats for existing frontend (expects flat array)
    const flat = [
      ...data.formats.combined,
      ...data.formats.videoOnly,
      ...data.formats.audioOnly
    ].map(f => ({
      format_id: f.format_id,
      quality:   f.quality,
      ext:       f.ext,
      filesize:  f.filesize,
      type:      f.type === 'video' ? 'Video + Audio' : f.type === 'audio' ? 'Audio Only' : 'Video Only',
      badge:     f.badge
    }));

    return res.json({
      videoId,
      title:     data.title     || 'Unknown',
      channel:   data.channel   || '',
      duration:  data.duration  || '',
      thumbnail: data.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      formats:   flat
    });
  } catch (err) {
    console.error('[DL-INFO]', err);
    if (/private|unavailable/i.test(String(err)))
      return res.status(404).json({ error: 'Video is private or unavailable.' });
    if (/age/i.test(String(err)))
      return res.status(403).json({ error: 'Age-restricted video.' });
    return res.status(500).json({ error: `Could not fetch video info. Is yt-dlp installed? Error: ${String(err).slice(0,200)}` });
  }
});

/* ────────────────────────────────────────────────────────
   ③ POST /api/download/stream
   Saves to disk first (reliable), then streams to browser
──────────────────────────────────────────────────────── */
app.post('/api/download/stream', async (req, res) => {
  const { videoId, formatId, ext, title, merge } = req.body;

  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId))
    return res.status(400).json({ error: 'Invalid video ID.' });
  if (!formatId)
    return res.status(400).json({ error: 'Missing formatId.' });

  const url      = `https://www.youtube.com/watch?v=${videoId}`;
  const safeTitle = sanitize(title || `video_${videoId}`);
  const outExt   = ext || 'mp4';
  const filename = `${safeTitle}.${outExt}`;
  const outPath  = path.join(DOWNLOADS_DIR, `${Date.now()}_${filename}`);

  // If video-only, merge with best audio automatically
  let fmtArg = formatId;
  if (merge) fmtArg = `${formatId}+bestaudio`;

  const args = [
    '--no-playlist',
    '-f', fmtArg,
    '--merge-output-format', outExt,
    '-o', outPath,
    url
  ];
  if (hasCookies()) args.unshift('--cookies', COOKIES_PATH);

  console.log(`[DL] Starting: ${filename} fmt=${fmtArg}`);

  const proc = spawn('yt-dlp', args);
  let errBuf = '';

  proc.stderr.on('data', d => {
    errBuf += d.toString();
    process.stderr.write(d);
  });

  proc.on('close', code => {
    if (code !== 0) {
      console.error('[DL] yt-dlp failed:', errBuf);
      if (!res.headersSent)
        return res.status(500).json({ error: 'Download failed: ' + errBuf.slice(0, 200) });
      return;
    }

    // Find the actual output file (yt-dlp may change extension after merge)
    const base      = outPath.replace(/\.[^.]+$/, '');
    const possible  = [outPath, `${base}.mp4`, `${base}.mkv`, `${base}.webm`];
    const finalPath = possible.find(p => fs.existsSync(p));

    if (!finalPath) {
      return res.status(500).json({ error: 'Output file not found after download.' });
    }

    const stat = fs.statSync(finalPath);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);

    const stream = fs.createReadStream(finalPath);
    stream.pipe(res);
    stream.on('close', () => fs.unlink(finalPath, () => {}));
  });

  proc.on('error', err => {
    console.error('[DL] spawn error:', err.message);
    if (!res.headersSent)
      res.status(500).json({ error: 'yt-dlp not found. Run: winget install yt-dlp — then restart terminal and server.' });
  });
});

/* ────────────────────────────────────────────────────────
   DOCUMENT UPLOAD ROUTES
   Uses multer for multipart/form-data handling
──────────────────────────────────────────────────────── */
const multer  = require('multer');
const DOCS_DIR = path.join(__dirname, 'docs');
const META_FILE = path.join(DOCS_DIR, '_meta.json');

if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

// Load/save metadata (title, desc per file)
function loadMeta() {
  try { return JSON.parse(fs.readFileSync(META_FILE, 'utf8')); }
  catch { return []; }
}
function saveMeta(meta) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOCS_DIR),
  filename:    (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed.'));
  }
});

// POST /api/docs/upload
app.post('/api/docs/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const title = (req.body.title || req.file.originalname).slice(0, 120);
  const desc  = (req.body.desc  || '').slice(0, 200);

  const meta = loadMeta();
  meta.push({ filename: req.file.filename, title, desc, uploadedAt: new Date().toISOString() });
  saveMeta(meta);

  console.log(`[DOCS] Uploaded: ${req.file.filename} — "${title}"`);
  res.json({ ok: true, filename: req.file.filename, title, desc });
});

// GET /api/docs/list
app.get('/api/docs/list', (req, res) => {
  res.json({ docs: loadMeta() });
});

// GET /api/docs/file/:filename  — serve the PDF
app.get('/api/docs/file/:filename', (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filePath = path.join(DOCS_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found.' });
  res.sendFile(filePath);
});

// POST /api/docs/delete
app.post('/api/docs/delete', (req, res) => {
  const filename = path.basename(req.body.filename || '');
  if (!filename) return res.status(400).json({ error: 'Missing filename.' });

  const filePath = path.join(DOCS_DIR, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const meta = loadMeta().filter(d => d.filename !== filename);
  saveMeta(meta);

  console.log(`[DOCS] Deleted: ${filename}`);
  res.json({ ok: true });
});

/* ────────────────────────────────────────────────────────
   MEMBER REGISTRY ROUTES
   Stores member data in members/_members.json
──────────────────────────────────────────────────────── */
// Members now live in Postgres (Supabase) instead of members/_members.json,
// so data survives Render redeploys/restarts and is shared across devices.

function rowToMember(r) {
  return {
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    dob: r.dob,
    gender: r.gender,
    address: r.address,
    emergencyContact: r.emergency_contact,
    notes: r.notes,
    status: r.status,
    role: r.role,
    mpesaReceipt: r.mpesa_receipt || undefined,
    amountPaid: r.amount_paid || undefined,
    registeredAt: r.registered_at,
    updatedAt: r.updated_at || undefined
  };
}

async function loadMembers() {
  const { rows } = await pool.query('SELECT * FROM members ORDER BY registered_at DESC');
  return rows.map(rowToMember);
}

async function findMemberByPhone(phone) {
  const { rows } = await pool.query('SELECT * FROM members WHERE phone = $1', [phone]);
  return rows[0] ? rowToMember(rows[0]) : null;
}

async function insertMember(member) {
  await pool.query(
    `INSERT INTO members
      (id, full_name, phone, email, dob, gender, address, emergency_contact, notes, status, role, mpesa_receipt, amount_paid, registered_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      member.id, member.fullName, member.phone, member.email, member.dob, member.gender,
      member.address, member.emergencyContact, member.notes, member.status, member.role,
      member.mpesaReceipt || null, member.amountPaid || null, member.registeredAt
    ]
  );
}

// POST /api/members/register  — public, no auth needed
app.post('/api/members/register', async (req, res) => {
  try {
    const { fullName, phone, email, dob, gender, address, emergencyContact, notes } = req.body;
    if (!fullName || !fullName.trim())
      return res.status(400).json({ error: 'Full name is required.' });
    if (!phone || !phone.trim())
      return res.status(400).json({ error: 'Phone number is required.' });

    // Prevent duplicate phone registrations
    if (await findMemberByPhone(phone.trim()))
      return res.status(409).json({ error: 'A member with this phone number is already registered.' });

    const member = {
      id:               'mbr_' + Date.now(),
      fullName:         fullName.trim().slice(0, 100),
      phone:            phone.trim().slice(0, 20),
      email:            (email || '').trim().slice(0, 100),
      dob:              (dob   || '').trim(),
      gender:           (gender || '').trim(),
      address:          (address || '').trim().slice(0, 200),
      emergencyContact: (emergencyContact || '').trim().slice(0, 100),
      notes:            (notes || '').trim().slice(0, 300),
      status:           'pending',   // pending | active | inactive
      role:             'member',    // member | secretary | treasurer
      registeredAt:     new Date().toISOString()
    };

    await insertMember(member);
    console.log(`[MEMBERS] New registration: ${member.fullName}`);
    res.json({ ok: true, id: member.id, message: 'Registration successful! The secretary will confirm your membership shortly.' });
  } catch (err) {
    console.error('[MEMBERS] register error:', err.message);
    res.status(500).json({ error: 'Could not save registration. Please try again.' });
  }
});

// GET /api/members/list  — returns all members (secretary/treasurer use)
app.get('/api/members/list', async (req, res) => {
  try {
    res.json({ members: await loadMembers() });
  } catch (err) {
    console.error('[MEMBERS] list error:', err.message);
    res.status(500).json({ error: 'Could not load members.' });
  }
});

// POST /api/members/update  — update status or role
app.post('/api/members/update', async (req, res) => {
  try {
    const { id, status, role, notes } = req.body;
    if (!id) return res.status(400).json({ error: 'Member ID required.' });

    const { rows } = await pool.query('SELECT id FROM members WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Member not found.' });

    await pool.query(
      `UPDATE members SET
         status = COALESCE($2, status),
         role = COALESCE($3, role),
         notes = COALESCE($4, notes),
         updated_at = now()
       WHERE id = $1`,
      [id, status || null, role || null, notes !== undefined ? notes.slice(0, 300) : null]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[MEMBERS] update error:', err.message);
    res.status(500).json({ error: 'Could not update member.' });
  }
});

// POST /api/members/delete
app.post('/api/members/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Member ID required.' });
    await pool.query('DELETE FROM members WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[MEMBERS] delete error:', err.message);
    res.status(500).json({ error: 'Could not delete member.' });
  }
});

/* ────────────────────────────────────────────────────────
   MPESA STK PUSH ROUTES
──────────────────────────────────────────────────────── */

// POST /api/mpesa/stkpush
// Triggers STK push to member's phone. Does NOT save member yet —
// member is saved only after successful payment callback.
app.post('/api/mpesa/stkpush', async (req, res) => {
  const { fullName, phone, email, dob, gender, address, emergencyContact, notes } = req.body;

  if (!fullName || !fullName.trim())
    return res.status(400).json({ error: 'Full name is required.' });
  if (!phone || !phone.trim())
    return res.status(400).json({ error: 'Phone number is required.' });

  // Check for duplicate before charging
  if (await findMemberByPhone(phone.trim()))
    return res.status(409).json({ error: 'A member with this phone number is already registered.' });

  let mpesaPhone;
  try {
    mpesaPhone = normaliseMpesaPhone(phone.trim());
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const token = await getMpesaToken();
    const { timestamp, password } = getMpesaTimestampAndPassword();

    const stkBody = {
      BusinessShortCode: MPESA.SHORTCODE,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   'CustomerPayBillOnline',
      Amount:            MPESA.AMOUNT,
      PartyA:            mpesaPhone,
      PartyB:            MPESA.SHORTCODE,
      PhoneNumber:       mpesaPhone,
      CallBackURL:       MPESA.CALLBACK_URL,
      AccountReference:  'ChosenGenReg',
      TransactionDesc:   'Chosen Generation Fellowship – App Maintenance (KES 20)'
    };

    const stkData = await mpesaPost('/mpesa/stkpush/v1/processrequest', token, stkBody);

    if (stkData.ResponseCode !== '0')
      return res.status(502).json({ error: stkData.ResponseDescription || stkData.errorMessage || 'STK Push failed.' });

    // Store pending transaction with member data for later save
    const checkoutId = stkData.CheckoutRequestID;
    stkPending[checkoutId] = {
      status:     'pending',
      memberData: { fullName: fullName.trim(), phone: phone.trim(), email, dob, gender, address, emergencyContact, notes },
      createdAt:  Date.now()
    };

    // Auto-expire pending entries after 5 minutes
    setTimeout(() => {
      if (stkPending[checkoutId] && stkPending[checkoutId].status === 'pending') {
        stkPending[checkoutId].status = 'expired';
      }
    }, 5 * 60 * 1000);

    console.log(`[MPESA] STK Push sent → ${mpesaPhone} | CheckoutID: ${checkoutId}`);
    return res.json({
      ok:          true,
      checkoutId,
      message:     `A payment prompt of KES ${MPESA.AMOUNT} has been sent to ${mpesaPhone}. Please check your phone and enter your M-Pesa PIN.`
    });

  } catch (err) {
    console.error('[MPESA] STK Push error:', err.message || err);
    return res.status(500).json({ error: 'Could not initiate payment. ' + (err.message || 'Server error.') });
  }
});

// POST /api/mpesa/callback  — Safaricom calls this after payment attempt
app.post('/api/mpesa/callback', async (req, res) => {
  try {
    const body   = req.body?.Body?.stkCallback;
    if (!body)   return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const checkoutId  = body.CheckoutRequestID;
    const resultCode  = body.ResultCode;   // 0 = success
    const resultDesc  = body.ResultDesc;

    console.log(`[MPESA] Callback → CheckoutID: ${checkoutId} | Code: ${resultCode} | ${resultDesc}`);

    if (!stkPending[checkoutId]) {
      // Unknown / expired transaction — still acknowledge
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (resultCode === 0) {
      // ── Payment successful — save the member ──
      const { memberData } = stkPending[checkoutId];

      // Extract Mpesa receipt from callback metadata
      const items     = body.CallbackMetadata?.Item || [];
      const receipt   = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';
      const amountPaid= items.find(i => i.Name === 'Amount')?.Value || MPESA.AMOUNT;

      // Double-check for duplicate (race condition guard)
      if (!(await findMemberByPhone(memberData.phone.trim()))) {
        const member = {
          id:               'mbr_' + Date.now(),
          fullName:         memberData.fullName.slice(0, 100),
          phone:            memberData.phone.trim().slice(0, 20),
          email:            (memberData.email  || '').trim().slice(0, 100),
          dob:              (memberData.dob    || '').trim(),
          gender:           (memberData.gender || '').trim(),
          address:          (memberData.address || '').trim().slice(0, 200),
          emergencyContact: (memberData.emergencyContact || '').trim().slice(0, 100),
          notes:            (memberData.notes  || '').trim().slice(0, 300),
          status:           'pending',
          role:             'member',
          mpesaReceipt:     receipt,
          amountPaid:       amountPaid,
          registeredAt:     new Date().toISOString()
        };
        await insertMember(member);
        console.log(`[MPESA] ✅ Member saved: ${member.fullName} | Receipt: ${receipt}`);
      }

      stkPending[checkoutId].status     = 'paid';
      stkPending[checkoutId].receipt    = receipt;
      stkPending[checkoutId].amountPaid = amountPaid;

    } else {
      // Payment cancelled or failed
      stkPending[checkoutId].status     = 'failed';
      stkPending[checkoutId].resultDesc = resultDesc;
      console.log(`[MPESA] ❌ Payment failed for ${checkoutId}: ${resultDesc}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('[MPESA] Callback error:', err.message);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // Always ack to Safaricom
  }
});

// GET /api/mpesa/status/:checkoutId  — frontend polls this
app.get('/api/mpesa/status/:checkoutId', (req, res) => {
  const entry = stkPending[req.params.checkoutId];
  if (!entry) return res.json({ status: 'unknown' });
  res.json({
    status:     entry.status,
    receipt:    entry.receipt    || null,
    amountPaid: entry.amountPaid || null,
    resultDesc: entry.resultDesc || null
  });
});

/* ────────────────────────────────────────────────────────
   CATCH-ALL
──────────────────────────────────────────────────────── */
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

/* ────────────────────────────────────────────────────────
   START
──────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n✝  Chosen Generation App`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   AI  → gemini-2.5-flash  ✅`);
  console.log(`   SDK → @google/genai\n`);
  console.log(hasCookies()
    ? `   Cookies → found at ${COOKIES_PATH}  ✅ (YouTube downloads authenticated)`
    : `   Cookies → none found  ⚠️  (YouTube may block downloads as "not a bot" — see DEPLOY.md)`);

  // Check yt-dlp on startup
  exec('yt-dlp --version', (err, stdout) => {
    if (!err) console.log(`   yt-dlp ${stdout.trim()}  ✅\n`);
    else      console.log(`   ⚠️  yt-dlp NOT found! Open a NEW terminal and run: winget install yt-dlp\n`);
  });
});
