process.on('uncaughtException', err => { console.error('CRASH:', err.message); process.exit(1); });
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const https = require('https');

const BOT_TOKEN = process.env.BOT_TOKEN || '8675224128:AAHC3JeKtKZugijknH8diHMAyyDQ6fJSzGs';
const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || '8308426357';

function sendTelegram(chatId, text) {
  const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' });
  const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  });
  req.on('error', () => {});
  req.write(body);
  req.end();
}

function notifyAdmins(text) {
  const ids = new Set([SUPER_ADMIN_ID]);
  try {
    const botDb = new Database(path.join(__dirname, '../bot/atm_bot.db'), { readonly: true });
    botDb.prepare('SELECT telegram_id FROM bot_users').all().forEach(r => ids.add(String(r.telegram_id)));
    botDb.close();
  } catch {}
  ids.forEach(id => sendTelegram(id, text));
}

const app = express();

const isProd = process.env.NODE_ENV === 'production';
app.use(cors({
  origin: isProd
    ? ['https://atm.uz', 'https://www.atm.uz', 'http://localhost:5173']
    : true,
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// SQLite setup
const db = new Database(path.join(__dirname, 'applications.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS universities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    continent TEXT,
    country TEXT,
    city TEXT,
    admission_start TEXT,
    admission_end TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add missing columns if table already existed
['admission_start', 'admission_end', 'image_url', 'contract_pdf', 'requirements', 'degrees', 'directions', 'contract_fee', 'grant'].forEach(col => {
  try { db.exec(`ALTER TABLE universities ADD COLUMN ${col} TEXT`); } catch {}
});

db.exec(`
  CREATE TABLE IF NOT EXISTS web_admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    university TEXT,
    message TEXT,
    last_name TEXT,
    uni1 TEXT,
    uni2 TEXT,
    uni3 TEXT,
    grade TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
['last_name','uni1','uni2','uni3','grade','passport','jshshr','school','address','viloyat','shahar','street','street2','direction','lang'].forEach(col => {
  try { db.exec(`ALTER TABLE applications ADD COLUMN ${col} TEXT`); } catch {}
});

db.exec(`
  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_date TEXT NOT NULL,
    test_time TEXT NOT NULL,
    test_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    test_date TEXT DEFAULT '',
    test_time TEXT DEFAULT '',
    test_address TEXT DEFAULT '',
    price_support INTEGER DEFAULT 415000,
    price_contract INTEGER DEFAULT 18500000
  )
`);
if (db.prepare('SELECT COUNT(*) as c FROM settings').get().c === 0) {
  db.prepare('INSERT INTO settings (id, price_support, price_contract) VALUES (1, 415000, 18500000)').run();
}

db.exec(`
  CREATE TABLE IF NOT EXISTS degree_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS directions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);
const degreeCount = db.prepare('SELECT COUNT(*) as c FROM degree_types').get().c;
if (degreeCount === 0) {
  ['Foundation', 'Bakalavr', 'Magistr', 'PhD', 'Diplom'].forEach(n =>
    db.prepare('INSERT OR IGNORE INTO degree_types (name) VALUES (?)').run(n)
  );
}

db.exec(`
  CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree TEXT,
    direction TEXT,
    duration TEXT,
    language TEXT,
    price TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed default superadmin if no admins exist yet
const adminCount = db.prepare('SELECT COUNT(*) as c FROM web_admins').get().c;
if (adminCount === 0) {
  db.prepare('INSERT INTO web_admins (login, password, full_name) VALUES (?, ?, ?)').run('admin', 'admin123', 'Superadmin');
  console.log('✅ Default admin created: login=admin, password=admin123');
}

// Multer — image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `uni_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const insertStmt = db.prepare(
  'INSERT INTO applications (name, phone, email, university, message) VALUES (?, ?, ?, ?, ?)'
);

const selectAllStmt = db.prepare(
  'SELECT * FROM applications ORDER BY created_at DESC'
);

// Universities
app.get('/api/universities', (req, res) => {
  res.json(db.prepare('SELECT * FROM universities ORDER BY name').all());
});

app.post('/api/universities', (req, res) => {
  const { name, continent, country, city, admission_start, admission_end } = req.body;
  if (!name) return res.status(400).json({ error: 'Nomi kerak' });
  const r = db.prepare(
    'INSERT INTO universities (name, continent, country, city, admission_start, admission_end) VALUES (?,?,?,?,?,?)'
  ).run(name, continent||'', country||'', city||'', admission_start||'', admission_end||'');
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/universities/:id', (req, res) => {
  const { name, continent, country, city, admission_start, admission_end } = req.body;
  db.prepare(
    'UPDATE universities SET name=?, continent=?, country=?, city=?, admission_start=?, admission_end=? WHERE id=?'
  ).run(name, continent||'', country||'', city||'', admission_start||'', admission_end||'', req.params.id);
  res.json({ success: true });
});

app.post('/api/universities/:id/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fayl topilmadi' });
  // Delete old image
  const old = db.prepare('SELECT image_url FROM universities WHERE id=?').get(req.params.id);
  if (old?.image_url) {
    const oldPath = path.join(__dirname, old.image_url.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE universities SET image_url=? WHERE id=?').run(imageUrl, req.params.id);
  res.json({ image_url: imageUrl });
});

// Contracts (PDF per university)
const contractDir = path.join(__dirname, 'uploads', 'contracts');
if (!fs.existsSync(contractDir)) fs.mkdirSync(contractDir, { recursive: true });

const contractUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, contractDir),
    filename: (req, file, cb) => cb(null, `contract_${req.params.id}.pdf`)
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf')
});

app.get('/api/contracts', (req, res) => {
  res.json(db.prepare('SELECT id, name, country, city, continent, contract_pdf FROM universities ORDER BY name').all());
});

app.post('/api/contracts/:id/pdf', contractUpload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF fayl kerak' });
  const url = `/uploads/contracts/contract_${req.params.id}.pdf`;
  db.prepare('UPDATE universities SET contract_pdf=? WHERE id=?').run(url, req.params.id);
  res.json({ url });
});

app.delete('/api/contracts/:id/pdf', (req, res) => {
  const p = path.join(contractDir, `contract_${req.params.id}.pdf`);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  db.prepare('UPDATE universities SET contract_pdf=NULL WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// Widget images (carousel)
const widgetDir = path.join(__dirname, 'uploads', 'widgets');
const widgetUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, widgetDir),
    filename: (req, file, cb) => cb(null, `widget_${Date.now()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 20 * 1024 * 1024 }
});

app.get('/api/widgets', (req, res) => {
  const files = fs.readdirSync(widgetDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(f => ({ filename: f, url: `/uploads/widgets/${encodeURIComponent(f)}` }));
  res.json(files);
});

app.post('/api/widgets', widgetUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fayl topilmadi' });
  res.json({ filename: req.file.filename, url: `/uploads/widgets/${req.file.filename}` });
});

app.delete('/api/widgets/:filename', (req, res) => {
  const file = path.join(widgetDir, req.params.filename);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.json({ success: true });
});

app.post('/api/universities/next-year', (req, res) => {
  const rows = db.prepare("SELECT id, admission_start, admission_end FROM universities WHERE admission_start != '' OR admission_end != ''").all();
  const upd = db.prepare("UPDATE universities SET admission_start=?, admission_end=? WHERE id=?");
  const run = db.transaction(() => {
    for (const r of rows) {
      const addYear = d => d ? new Date(new Date(d).setFullYear(new Date(d).getFullYear()+1)).toISOString().slice(0,10) : '';
      upd.run(addYear(r.admission_start), addYear(r.admission_end), r.id);
    }
  });
  run();
  res.json({ updated: rows.length });
});

app.delete('/api/universities/:id', (req, res) => {
  const row = db.prepare('SELECT image_url FROM universities WHERE id=?').get(req.params.id);
  if (row?.image_url) {
    const p = path.join(__dirname, row.image_url.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  db.prepare('DELETE FROM universities WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// Tests
app.get('/api/tests', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  db.prepare("DELETE FROM tests WHERE test_date < ?").run(today);
  res.json(db.prepare('SELECT * FROM tests ORDER BY test_date, test_time').all());
});

app.post('/api/tests', (req, res) => {
  const { test_date, test_time, test_address } = req.body;
  if (!test_date || !test_time || !test_address) return res.status(400).json({ error: 'Barcha maydonlar kerak' });
  const r = db.prepare('INSERT INTO tests (test_date, test_time, test_address) VALUES (?,?,?)').run(test_date, test_time, test_address);
  res.json({ id: r.lastInsertRowid });
});

app.delete('/api/tests/:id', (req, res) => {
  db.prepare('DELETE FROM tests WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// Settings
app.get('/api/settings', (req, res) => {
  res.json(db.prepare('SELECT * FROM settings WHERE id=1').get());
});

app.put('/api/settings', (req, res) => {
  const { test_date, test_time, test_address, price_support, price_contract } = req.body;
  db.prepare(`UPDATE settings SET test_date=?, test_time=?, test_address=?, price_support=?, price_contract=? WHERE id=1`)
    .run(test_date||'', test_time||'', test_address||'', price_support||415000, price_contract||18500000);
  res.json({ success: true });
});

// Auth
app.post('/api/auth', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: 'Login va parol kerak' });
  const admin = db.prepare('SELECT * FROM web_admins WHERE login=? AND password=?').get(login, password);
  if (!admin) return res.status(401).json({ error: 'Login yoki parol noto\'g\'ri' });
  res.json({ success: true, name: admin.full_name });
});

// Applications
app.post('/api/apply', (req, res) => {
  const { name, last_name, phone, email, university, message, uni1, uni2, uni3, grade, passport, jshshr, school, viloyat, shahar, street, street2, direction, lang } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Majburiy maydonlarni to\'ldiring' });
  }
  db.prepare(`INSERT INTO applications (name, last_name, phone, email, university, message, uni1, uni2, uni3, grade, passport, jshshr, school, viloyat, shahar, street, street2, direction, lang)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(name, last_name||'', phone, email||'', university||'', message||'', uni1||'', uni2||'', uni3||'', grade||'', passport||'', jshshr||'', school||'', viloyat||'', shahar||'', street||'', street2||'', direction||'', lang||'');

  const unis = [uni1, uni2, uni3].filter(Boolean).map((u, i) => `${i+1}. ${u}`).join('\n');
  const text = `🎓 <b>Yangi abiturent:</b>\n\n👤 ${name} ${last_name||''}\n📞 ${phone}\n🏫 ${grade||'—'}\n\n<b>Universitetlar:</b>\n${unis || '—'}`;
  notifyAdmins(text);

  console.log('New application:', { name, phone });
  res.json({ success: true });
});

app.delete('/api/applications/:id', (req, res) => {
  db.prepare('DELETE FROM applications WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/applications', (req, res) => {
  const rows = selectAllStmt.all();
  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    last_name: r.last_name,
    phone: r.phone,
    email: r.email,
    uni1: r.uni1,
    uni2: r.uni2,
    uni3: r.uni3,
    grade: r.grade,
    passport: r.passport,
    jshshr: r.jshshr,
    school: r.school,
    viloyat: r.viloyat,
    shahar: r.shahar,
    street: r.street,
    street2: r.street2,
    direction: r.direction,
    lang: r.lang,
    message: r.message,
    createdAt: r.created_at,
  })));
});

app.put('/api/universities/:id/programs', (req, res) => {
  const { requirements, degrees, directions, contract_fee, grant } = req.body
  db.prepare('UPDATE universities SET requirements=?, degrees=?, directions=?, contract_fee=?, grant=? WHERE id=?')
    .run(JSON.stringify(requirements), JSON.stringify(degrees), JSON.stringify(directions), contract_fee || null, grant ? '1' : null, req.params.id)
  res.json({ ok: true })
})

app.get('/api/degree-types', (req, res) => res.json(db.prepare('SELECT * FROM degree_types ORDER BY id').all()))
app.post('/api/degree-types', (req, res) => {
  try { const r = db.prepare('INSERT INTO degree_types (name) VALUES (?)').run(req.body.name); res.json({ id: r.lastInsertRowid }) }
  catch { res.status(400).json({ error: 'Already exists' }) }
})
app.delete('/api/degree-types/:id', (req, res) => { db.prepare('DELETE FROM degree_types WHERE id=?').run(req.params.id); res.json({ ok: true }) })

app.get('/api/directions', (req, res) => res.json(db.prepare('SELECT * FROM directions ORDER BY name').all()))
app.post('/api/directions', (req, res) => {
  try { const r = db.prepare('INSERT INTO directions (name) VALUES (?)').run(req.body.name); res.json({ id: r.lastInsertRowid }) }
  catch { res.status(400).json({ error: 'Already exists' }) }
})
app.delete('/api/directions/:id', (req, res) => { db.prepare('DELETE FROM directions WHERE id=?').run(req.params.id); res.json({ ok: true }) })

app.get('/api/programs', (req, res) => {
  const { university_id } = req.query
  const rows = university_id
    ? db.prepare('SELECT p.*, u.name as university_name FROM programs p JOIN universities u ON p.university_id=u.id WHERE p.university_id=?').all(university_id)
    : db.prepare('SELECT p.*, u.name as university_name FROM programs p JOIN universities u ON p.university_id=u.id ORDER BY u.name, p.name').all()
  res.json(rows)
})

app.post('/api/programs', (req, res) => {
  const { university_id, name, degree, direction, duration, language, price, description } = req.body
  const r = db.prepare('INSERT INTO programs (university_id,name,degree,direction,duration,language,price,description) VALUES (?,?,?,?,?,?,?,?)').run(university_id, name, degree, direction, duration, language, price, description)
  res.json({ id: r.lastInsertRowid })
})

app.put('/api/programs/:id', (req, res) => {
  const { name, degree, direction, duration, language, price, description } = req.body
  db.prepare('UPDATE programs SET name=?,degree=?,direction=?,duration=?,language=?,price=?,description=? WHERE id=?').run(name, degree, direction, duration, language, price, description, req.params.id)
  res.json({ ok: true })
})

app.delete('/api/programs/:id', (req, res) => {
  db.prepare('DELETE FROM programs WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

app.post('/api/ai', async (req, res) => {
  const { messages, system } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, ...messages],
        max_tokens: 1024,
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });
    res.json({ content: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// Serve built frontend
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
