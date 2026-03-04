// Alimentos Biodinámicos — Server unificado
// Sirve: static files (dist/) + Auth API + proxy PostgREST
// Puerto: 3080

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || '60fbe00b1a938a795e143da6622ff24234275a2f2964d50f0ecda12cbe321a7f';
const PORT = process.env.PORT || 3080;
const POSTGREST_PORT = 3001;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'biodinamicos',
  user: 'bioapp',
  password: process.env.DB_PASSWORD || 'v7yTYdhwUObdPnsUoGt8W6NW5dy5rLlG',
});

// ==========================================
// Helpers
// ==========================================
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: 'authenticated', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch { return res.status(401).json({ error: 'Token inválido' }); }
}

// ==========================================
// API ROUTES (all under /api/)
// ==========================================
const api = express.Router();

api.post('/auth/signup', async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  if (password.length < 6) return res.status(400).json({ error: 'Contraseña mínimo 6 caracteres' });
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, display_name, email_confirmed) VALUES ($1, $2, $3, true) RETURNING id, email, display_name',
      [email.toLowerCase(), hash, display_name || null]
    );
    const user = result.rows[0];
    res.json({ user: { id: user.id, email: user.email, display_name: user.display_name }, access_token: generateToken(user), token_type: 'bearer' });
  } catch (e) { console.error('Signup error:', e); res.status(500).json({ error: 'Error interno' }); }
});

api.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const user = result.rows[0];
    if (!(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Credenciales incorrectas' });
    await pool.query('UPDATE users SET last_sign_in = now() WHERE id = $1', [user.id]);
    res.json({ user: { id: user.id, email: user.email, display_name: user.display_name }, access_token: generateToken(user), token_type: 'bearer' });
  } catch (e) { console.error('Signin error:', e); res.status(500).json({ error: 'Error interno' }); }
});

api.post('/auth/signout', (req, res) => res.json({ message: 'ok' }));

api.get('/auth/user', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, display_name, created_at FROM users WHERE id = $1', [req.user.sub]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ user: result.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Error interno' }); }
});

api.post('/auth/reset-password', requireAuth, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Contraseña mínimo 6 caracteres' });
  try {
    const hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [hash, req.user.sub]);
    res.json({ message: 'Contraseña actualizada' });
  } catch (e) { res.status(500).json({ error: 'Error interno' }); }
});

// Google Sign-Inapi.post("/auth/google", async (req, res) => {  const { credential } = req.body;  if (!credential) return res.status(400).json({ error: "Token requerido" });  if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: "Google Sign-In no configurado" });  try {    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });    const payload = ticket.getPayload();    if (!payload || !payload.email) return res.status(400).json({ error: "Token inválido" });    const email = payload.email.toLowerCase();    const displayName = payload.name || null;    // Check if user exists    let result = await pool.query("SELECT * FROM users WHERE email = ", [email]);    let user;    if (result.rows.length > 0) {      user = result.rows[0];      await pool.query("UPDATE users SET last_sign_in = now() WHERE id = ", [user.id]);    } else {      // Create new user (no password needed for Google users)      const randomHash = await require("bcryptjs").hash(require("crypto").randomBytes(32).toString("hex"), 12);      result = await pool.query(        "INSERT INTO users (email, password_hash, display_name, email_confirmed) VALUES (, , , true) RETURNING id, email, display_name",        [email, randomHash, displayName]      );      user = result.rows[0];    }    res.json({ user: { id: user.id, email: user.email, display_name: user.display_name }, access_token: generateToken(user), token_type: "bearer" });  } catch (e) { console.error("Google auth error:", e); res.status(401).json({ error: "Error de autenticación con Google" }); }});
// Roles
api.get('/roles', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT role FROM user_roles WHERE user_id = $1', [req.user.sub]);
    res.json(result.rows.map(r => r.role));
  } catch (e) { res.status(500).json({ error: 'Error interno' }); }
});

api.post('/roles', requireAuth, async (req, res) => {
  const { role } = req.body;
  if (!['consumidor', 'agricultor', 'ganadero', 'elaborador'].includes(role)) return res.status(400).json({ error: 'Rol no válido' });
  try {
    await pool.query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO NOTHING', [req.user.sub, role]);
    res.json({ message: 'Rol añadido' });
  } catch (e) { res.status(500).json({ error: 'Error interno' }); }
});

// ==========================================
// MESSAGES
// ==========================================

// GET /messages/conversations — list conversations
api.get('/messages/conversations', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      WITH convos AS (
        SELECT DISTINCT
          CASE WHEN from_user_id = $1 THEN to_user_id ELSE from_user_id END AS other_user_id
        FROM messages
        WHERE from_user_id = $1 OR to_user_id = $1
      )
      SELECT
        c.other_user_id,
        u.display_name,
        u.email,
        fp.farm_name,
        (SELECT message FROM messages
         WHERE (from_user_id = $1 AND to_user_id = c.other_user_id)
            OR (from_user_id = c.other_user_id AND to_user_id = $1)
         ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages
         WHERE (from_user_id = $1 AND to_user_id = c.other_user_id)
            OR (from_user_id = c.other_user_id AND to_user_id = $1)
         ORDER BY created_at DESC LIMIT 1) AS last_message_at,
        (SELECT count(*)::int FROM messages
         WHERE from_user_id = c.other_user_id AND to_user_id = $1 AND is_read = false) AS unread_count
      FROM convos c
      LEFT JOIN users u ON u.id = c.other_user_id
      LEFT JOIN farmer_profiles fp ON fp.user_id = c.other_user_id
      ORDER BY last_message_at DESC
    `, [req.user.sub]);
    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error' }); }
});

// GET /messages/:userId — get messages with a user
api.get('/messages/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT id, from_user_id, to_user_id, message, is_read, created_at
      FROM messages
      WHERE (from_user_id = $1 AND to_user_id = $2)
         OR (from_user_id = $2 AND to_user_id = $1)
      ORDER BY created_at ASC
      LIMIT 200
    `, [req.user.sub, userId]);

    // Mark as read
    await pool.query(`
      UPDATE messages SET is_read = true
      WHERE from_user_id = $2 AND to_user_id = $1 AND is_read = false
    `, [req.user.sub, userId]);

    res.json(result.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error' }); }
});

// POST /messages — send a message
api.post('/messages', requireAuth, async (req, res) => {
  const { to_user_id, message } = req.body;
  if (!to_user_id || !message?.trim()) return res.status(400).json({ error: 'Destinatario y mensaje requeridos' });
  try {
    const result = await pool.query(
      'INSERT INTO messages (from_user_id, to_user_id, message) VALUES ($1, $2, $3) RETURNING *',
      [req.user.sub, to_user_id, message.trim()]
    );
    res.json(result.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error' }); }
});

// GET /messages/unread/count — unread count
api.get('/messages/unread/count', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT count(*)::int AS count FROM messages WHERE to_user_id = $1 AND is_read = false',
      [req.user.sub]
    );
    res.json({ count: result.rows[0].count });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// PostgREST proxy
api.use('/data', (req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: POSTGREST_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${POSTGREST_PORT}` },
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => res.status(502).json({ error: 'DB error' }));
  if (['POST', 'PATCH', 'PUT'].includes(req.method) && req.body) {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
});

app.use('/api', api);

// ==========================================
// STATIC FILES + SPA FALLBACK
// ==========================================
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback
app.use((req, res) => {
  res.sendFile('index.html', { root: distPath });
});

// ==========================================
// START
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌿 Alimentos Biodinámicos running on http://0.0.0.0:${PORT}`);
});
