const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize SQLite database for leads
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT,
      company TEXT,
      phone TEXT,
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, company, phone, message } = req.body;

  if (!name || !email || !company) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Save to database
    db.run(
      'INSERT OR IGNORE INTO leads (name, email, company, phone, type) VALUES (?, ?, ?, ?, ?)',
      [name, email, company, phone, 'contact'],
      function(err) {
        if (err) console.log('DB error:', err);
      }
    );

    // Send email to business owner
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'fawaz@belloite.com',
      subject: `New Contact: ${name} from ${company}`,
      html: `
        <h2>New inquiry from your BNPL landing page</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message || 'No message'}</p>
      `
    });

    // Send confirmation email to lead
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Thanks for reaching out - BNPL Solutions',
      html: `
        <h2>Thanks for your interest!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will be in touch within 24 hours.</p>
        <p>In the meantime, check out our full BNPL solutions guide for small businesses.</p>
        <p>Best regards,<br>The BNPL Solutions Team</p>
      `
    });

    res.status(200).json({ success: true, message: 'Thank you! We\'ll be in touch soon.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// Waitlist endpoint
app.post('/api/waitlist', async (req, res) => {
  const { email, company, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Save to database
    db.run(
      'INSERT OR IGNORE INTO leads (name, email, company, type) VALUES (?, ?, ?, ?)',
      [name || 'N/A', email, company || 'N/A', 'waitlist'],
      function(err) {
        if (err) console.log('DB error:', err);
      }
    );

    // Send confirmation to lead
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to our waitlist!',
      html: `
        <h2>You're on the list! 🎉</h2>
        <p>Thanks for joining the waitlist for BNPL solutions.</p>
        <p>We'll send you early access, exclusive tips, and a special launch discount when we open.</p>
        <p>Best regards,<br>The BNPL Solutions Team</p>
      `
    });

    // Notify admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'fawaz@belloite.com',
      subject: `New waitlist signup: ${email}`,
      html: `
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
      `
    });

    res.status(200).json({ success: true, message: 'Welcome to the waitlist!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// Get leads (protected endpoint - in production add auth)
app.get('/api/leads', (req, res) => {
  db.all('SELECT * FROM leads ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
