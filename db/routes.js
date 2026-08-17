// db/routes.js
// All the data that used to live only in the browser's localStorage
// (announcements, events, prayers, contributions, RSVPs, amens, activity log)
// now lives here, backed by Postgres, so it's shared across every visitor
// and survives redeploys.
//
// NOTE ON AUTH: like the rest of this app, these routes trust the client —
// there's no server-side check that the caller is really an admin/treasurer.
// The passcodes only gate the UI. If you want real protection, that's a
// good next step (see the "Proper authentication" suggestion from before).

const express = require('express');
const pool = require('./pool');
const router = express.Router();

/* ── helpers ─────────────────────────────────────────── */
function rowToAnnouncement(r) {
  return { id: r.id, title: r.title, body: r.body, date: r.date };
}
function rowToEvent(r) {
  return {
    id: r.id,
    title: r.title,
    desc: r.desc_text,
    date: r.date,
    time: r.time_label,
    rsvpCount: r.rsvp_count
  };
}
function rowToPrayer(r) {
  return { id: r.id, type: r.type, author: r.author, body: r.body, date: r.date, amens: r.amens };
}
function rowToContribution(r) {
  return {
    id: r.id,
    member: r.member,
    type: r.type,
    amount: Number(r.amount),
    date: r.date,
    notes: r.notes,
    recordedAt: r.recorded_at
  };
}

/* ── ANNOUNCEMENTS ───────────────────────────────────── */

router.get('/announcements', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM announcements ORDER BY date DESC');
    res.json({ announcements: rows.map(rowToAnnouncement) });
  } catch (err) {
    console.error('[ANNOUNCEMENTS] list error:', err.message);
    res.status(500).json({ error: 'Could not load announcements.' });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !title.trim() || !body || !body.trim())
      return res.status(400).json({ error: 'Title and body are required.' });

    const ann = { id: 'ann' + Date.now(), title: title.trim(), body: body.trim(), date: new Date().toISOString() };
    await pool.query('INSERT INTO announcements (id, title, body, date) VALUES ($1,$2,$3,$4)',
      [ann.id, ann.title, ann.body, ann.date]);
    res.json({ ok: true, announcement: ann });
  } catch (err) {
    console.error('[ANNOUNCEMENTS] create error:', err.message);
    res.status(500).json({ error: 'Could not post announcement.' });
  }
});

router.post('/announcements/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Announcement ID required.' });
    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[ANNOUNCEMENTS] delete error:', err.message);
    res.status(500).json({ error: 'Could not delete announcement.' });
  }
});

/* ── EVENTS ──────────────────────────────────────────── */

router.get('/events', async (req, res) => {
  try {
    const { deviceId } = req.query;
    const { rows } = await pool.query('SELECT * FROM events ORDER BY date ASC');
    let attendingIds = new Set();
    if (deviceId) {
      const { rows: rsvpRows } = await pool.query('SELECT event_id FROM rsvps WHERE device_id = $1', [deviceId]);
      attendingIds = new Set(rsvpRows.map(r => r.event_id));
    }
    res.json({ events: rows.map(r => ({ ...rowToEvent(r), attending: attendingIds.has(r.id) })) });
  } catch (err) {
    console.error('[EVENTS] list error:', err.message);
    res.status(500).json({ error: 'Could not load events.' });
  }
});

router.post('/events', async (req, res) => {
  try {
    const { title, date, desc } = req.body;
    if (!title || !title.trim() || !date)
      return res.status(400).json({ error: 'Title and date are required.' });

    const d = new Date(date);
    const ev = {
      id: 'ev' + Date.now(),
      title: title.trim(),
      desc: (desc || '').trim(),
      date: d.toISOString(),
      time: d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      rsvpCount: 0
    };
    await pool.query(
      'INSERT INTO events (id, title, desc_text, date, time_label, rsvp_count) VALUES ($1,$2,$3,$4,$5,$6)',
      [ev.id, ev.title, ev.desc, ev.date, ev.time, 0]
    );
    res.json({ ok: true, event: ev });
  } catch (err) {
    console.error('[EVENTS] create error:', err.message);
    res.status(500).json({ error: 'Could not add event.' });
  }
});

router.post('/events/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Event ID required.' });
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[EVENTS] delete error:', err.message);
    res.status(500).json({ error: 'Could not delete event.' });
  }
});

// Toggle RSVP for one device. deviceId is a random ID the frontend keeps in
// localStorage (not a login) just so the same visitor can't inflate the count.
router.post('/events/:id/rsvp', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'deviceId is required.' });

    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT 1 FROM rsvps WHERE event_id = $1 AND device_id = $2', [id, deviceId]
    );
    let attending;
    if (rows.length > 0) {
      await client.query('DELETE FROM rsvps WHERE event_id = $1 AND device_id = $2', [id, deviceId]);
      await client.query('UPDATE events SET rsvp_count = GREATEST(0, rsvp_count - 1) WHERE id = $1', [id]);
      attending = false;
    } else {
      await client.query('INSERT INTO rsvps (event_id, device_id) VALUES ($1,$2)', [id, deviceId]);
      await client.query('UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = $1', [id]);
      attending = true;
    }
    const { rows: evRows } = await client.query('SELECT rsvp_count FROM events WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json({ ok: true, attending, rsvpCount: evRows[0]?.rsvp_count ?? 0 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[EVENTS] rsvp error:', err.message);
    res.status(500).json({ error: 'Could not update RSVP.' });
  } finally {
    client.release();
  }
});

/* ── PRAYER WALL ─────────────────────────────────────── */

router.get('/prayers', async (req, res) => {
  try {
    const { deviceId } = req.query;
    const { rows } = await pool.query('SELECT * FROM prayers ORDER BY date DESC');
    let amenedIds = new Set();
    if (deviceId) {
      const { rows: amenRows } = await pool.query('SELECT prayer_id FROM amens WHERE device_id = $1', [deviceId]);
      amenedIds = new Set(amenRows.map(r => r.prayer_id));
    }
    res.json({ prayers: rows.map(r => ({ ...rowToPrayer(r), amened: amenedIds.has(r.id) })) });
  } catch (err) {
    console.error('[PRAYERS] list error:', err.message);
    res.status(500).json({ error: 'Could not load prayer wall.' });
  }
});

router.post('/prayers', async (req, res) => {
  try {
    const { type, author, body } = req.body;
    if (!body || !body.trim())
      return res.status(400).json({ error: 'Please write something first.' });

    const post = {
      id: 'pr' + Date.now(),
      type: type === 'praise' ? 'praise' : 'prayer',
      author: (author || '').trim() || 'Anonymous',
      body: body.trim(),
      date: new Date().toISOString(),
      amens: 0
    };
    await pool.query(
      'INSERT INTO prayers (id, type, author, body, date, amens) VALUES ($1,$2,$3,$4,$5,$6)',
      [post.id, post.type, post.author, post.body, post.date, 0]
    );
    res.json({ ok: true, prayer: post });
  } catch (err) {
    console.error('[PRAYERS] create error:', err.message);
    res.status(500).json({ error: 'Could not post to prayer wall.' });
  }
});

router.post('/prayers/:id/amen', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'deviceId is required.' });

    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT 1 FROM amens WHERE prayer_id = $1 AND device_id = $2', [id, deviceId]
    );
    let amened;
    if (rows.length > 0) {
      await client.query('DELETE FROM amens WHERE prayer_id = $1 AND device_id = $2', [id, deviceId]);
      await client.query('UPDATE prayers SET amens = GREATEST(0, amens - 1) WHERE id = $1', [id]);
      amened = false;
    } else {
      await client.query('INSERT INTO amens (prayer_id, device_id) VALUES ($1,$2)', [id, deviceId]);
      await client.query('UPDATE prayers SET amens = amens + 1 WHERE id = $1', [id]);
      amened = true;
    }
    const { rows: prRows } = await client.query('SELECT amens FROM prayers WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json({ ok: true, amened, amens: prRows[0]?.amens ?? 0 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PRAYERS] amen error:', err.message);
    res.status(500).json({ error: 'Could not update amen.' });
  } finally {
    client.release();
  }
});

/* ── CONTRIBUTIONS (treasurer) ──────────────────────────
   Financial data — this previously lived ONLY in the treasurer's
   browser localStorage, which meant it wasn't backed up and wasn't
   visible to anyone else. Now it's shared and persisted properly. */

router.get('/contributions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contributions ORDER BY date DESC, recorded_at DESC');
    res.json({ contributions: rows.map(rowToContribution) });
  } catch (err) {
    console.error('[CONTRIBUTIONS] list error:', err.message);
    res.status(500).json({ error: 'Could not load contributions.' });
  }
});

router.post('/contributions', async (req, res) => {
  try {
    const { member, type, amount, date, notes } = req.body;
    if (!member || !member.trim()) return res.status(400).json({ error: 'Member name is required.' });
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return res.status(400).json({ error: 'A valid amount is required.' });
    if (!date) return res.status(400).json({ error: 'Date is required.' });

    const contrib = {
      id: 'ctr' + Date.now(),
      member: member.trim(),
      type: type || 'Other',
      amount: Number(amount),
      date,
      notes: (notes || '').trim(),
      recordedAt: new Date().toISOString()
    };
    await pool.query(
      'INSERT INTO contributions (id, member, type, amount, date, notes, recorded_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [contrib.id, contrib.member, contrib.type, contrib.amount, contrib.date, contrib.notes, contrib.recordedAt]
    );
    res.json({ ok: true, contribution: contrib });
  } catch (err) {
    console.error('[CONTRIBUTIONS] create error:', err.message);
    res.status(500).json({ error: 'Could not record contribution.' });
  }
});

router.post('/contributions/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Contribution ID required.' });
    await pool.query('DELETE FROM contributions WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[CONTRIBUTIONS] delete error:', err.message);
    res.status(500).json({ error: 'Could not delete contribution.' });
  }
});

/* ── ACTIVITY LOG ────────────────────────────────────── */

router.get('/activity-log', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT msg, created_at FROM activity_log ORDER BY created_at DESC LIMIT 50'
    );
    res.json({
      log: rows.map(r => ({
        msg: r.msg,
        time: new Date(r.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
      }))
    });
  } catch (err) {
    console.error('[ACTIVITY] list error:', err.message);
    res.status(500).json({ error: 'Could not load activity log.' });
  }
});

router.post('/activity-log', async (req, res) => {
  try {
    const { msg } = req.body;
    if (!msg) return res.status(400).json({ error: 'msg is required.' });
    await pool.query('INSERT INTO activity_log (msg) VALUES ($1)', [msg.slice(0, 300)]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[ACTIVITY] create error:', err.message);
    res.status(500).json({ error: 'Could not log activity.' });
  }
});

router.post('/activity-log/clear', async (req, res) => {
  try {
    await pool.query('DELETE FROM activity_log');
    res.json({ ok: true });
  } catch (err) {
    console.error('[ACTIVITY] clear error:', err.message);
    res.status(500).json({ error: 'Could not clear activity log.' });
  }
});

module.exports = router;
