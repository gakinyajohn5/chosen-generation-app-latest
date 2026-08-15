# Deploying Chosen Generation App to Render (Docker)

This project is Docker-ready so `yt-dlp` and `ffmpeg` (needed for the video
downloader) are installed alongside Node automatically.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

`.env`, `node_modules/`, `downloads/*`, and `members/_members.json` are
already excluded via `.gitignore` — never commit real secrets or member
data.

## 2. Create the Render service

**Option A — via render.yaml (recommended):**
1. Go to https://dashboard.render.com → **New** → **Blueprint**.
2. Connect the GitHub repo. Render reads `render.yaml` and creates the
   service automatically.
3. Render will prompt you to fill in the `sync: false` env vars
   (GEMINI_API_KEY, MPESA_*) since those aren't stored in the repo.

**Option B — manual:**
1. Go to https://dashboard.render.com → **New** → **Web Service**.
2. Connect the repo.
3. Environment: **Docker** (Render auto-detects the `Dockerfile`).
4. Add the environment variables listed in `.env.example` under the
   **Environment** tab.

## 3. Set environment variables

Use real values here, not the placeholders from `.env.example`:

| Variable | Notes |
|---|---|
| `GEMINI_API_KEY` | Get a fresh key from Google AI Studio — rotate immediately if you ever shared the old one |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` | From your Safaricom Daraja app |
| `MPESA_SHORTCODE` / `MPESA_PASSKEY` | Sandbox defaults are pre-filled in code; override for production |
| `MPESA_CALLBACK_URL` | `https://YOUR-APP.onrender.com/api/mpesa/callback` |
| `MPESA_ENV` | `sandbox` for testing, `production` only when ready to take live payments |

Render sets `PORT` automatically — no need to set it yourself.

## 4. Deploy

Render builds the Docker image and starts the service. First build takes
a few minutes (installing yt-dlp/ffmpeg). Your app will be live at
`https://YOUR-APP.onrender.com`.

## Notes

- **Ephemeral disk:** Render's filesystem resets on every redeploy/restart.
  `downloads/` and `members/_members.json` won't persist between deploys.
  If you need persistent storage, add a Render Disk (paid) or move that
  data to an external store (S3, a database).
- **M-Pesa callback** requires a public HTTPS URL — Render gives you one
  for free, so no ngrok needed once deployed.
