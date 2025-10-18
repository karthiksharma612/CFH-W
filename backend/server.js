require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, 'data', 'submissions.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Init DB
const db = new Database(DB_FILE);
db.prepare(`CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// setup mailer
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: (process.env.MAIL_SECURE === 'true'),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, phone, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

    const stmt = db.prepare('INSERT INTO submissions (name,email,company,phone,message) VALUES (?,?,?,?,?)');
    const info = stmt.run(name, email, company || '', phone || '', message);

    // build email
    const to = process.env.TO_EMAIL || 'Curafehealth@gmail.com';
    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const subject = `Website contact from ${name}`;
    const textLines = [];
    textLines.push(`Name: ${name}`);
    textLines.push(`Email: ${email}`);
    if (company) textLines.push(`Company: ${company}`);
    if (phone) textLines.push(`Phone: ${phone}`);
    textLines.push('');
    textLines.push('Message:');
    textLines.push(message);

    const mailOptions = {
      from,
      to,
      subject,
      text: textLines.join('\n')
    };

    // send email (best-effort)
    transporter.sendMail(mailOptions, (err, infoMail) => {
      if (err) {
        console.error('sendMail error', err);
        return res.status(202).json({ ok: true, warning: 'stored but email failed', id: info.lastInsertRowid });
      }
      return res.json({ ok: true, id: info.lastInsertRowid });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/submissions', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, email, company, phone, message, created_at FROM submissions ORDER BY created_at DESC').all();
    res.json({ ok: true, submissions: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
