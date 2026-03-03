// Alimentos Biodinámicos — Server unificado
// Sirve: static files (dist/) + Auth API + proxy PostgREST
// Puerto: 3080 (misma URL pública que antes)

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || '60fbe00b1a938a795e143da6622ff24234275a2f2964d50f0ecda12cbe321a7f';
const PORT = process.env.PORT || 3080;
const POSTGREST_PORT = 3001;

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
// AUTH ENDPOINTS
// ==========================================
app.post('/auth/signup', async (req, res) => {
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

app.post('/auth/signin', async (req, res) => {
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

app.post('/auth/signout', (req, res) => res.json({ message: 'ok' }));

app.get('/auth/user', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, display_name, created_at FROM users WHERE id = $1', [req.user.sub]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ user: result.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Error interno' }); }
});

app.post('/auth/reset-password', requireAuth, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Contraseña mínimo 6 caracteres' });
  try {
    const hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [hash, req.user.sub]);
    res.json({ message: 'Contraseña actualizada' });
  } catch (e) { res.status(500).json({ error: 'Error interno' }); }
});

// ==========================================
// ROLES
// ==========================================
app.get('/roles', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT role FROM user_roles WHERE user_id = $1', [req.user.sub]);
    res.json(result.rows.map(r => r.role));
  } catch (e) { res.status(500).json({ error: 'Error interno' }); }
});

app.post('/roles', requireAuth, async (req, res) => {
  const { role } = req.body;
  if (!['consumidor', 'agricultor', 'ganadero', 'elaborador'].includes(role)) return res.status(400).json({ error: 'Rol no válido' });
  try {
    await pool.query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO NOTHING', [req.user.sub, role]);
    res.json({ message: 'Rol añadido' });
  } catch (e) { res.status(500).json({ error: 'Error interno' }); }
});

// ==========================================
// PostgREST PROXY (/rest/v1/*)
// ==========================================
app.use('/rest/v1', (req, res) => {
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

// ==========================================
// STATIC FILES + SPA FALLBACK
// ==========================================
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ==========================================
// START
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌿 Alimentos Biodinámicos running on http://0.0.0.0:${PORT}`);
});
