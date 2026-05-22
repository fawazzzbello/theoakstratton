const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe webhook endpoint - must be before bodyParser
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
    }

    res.json({received: true});
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Trust proxy (important for Railway and other proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static('public'));

// Rate limiting for forms
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Too many requests from this IP',
});

app.use('/api/', apiLimiter);

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

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stripe_payment_intent_id TEXT UNIQUE,
      customer_email TEXT NOT NULL,
      customer_name TEXT,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'gbp',
      payment_method TEXT,
      bnpl_provider TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Configure SMTP transporter with error handling
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Test SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Configuration Error:', error);
    console.warn('⚠️  Email functionality may not work. Check your SMTP credentials in .env');
  } else if (success) {
    console.log('✓ SMTP connection successful. Email services ready.');
  }
});

// Validate reCAPTCHA token (optional)
async function verifyReCAPTCHA(token) {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return true; // Skip if not configured
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );

    return response.data.success && response.data.score > 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Stripe webhook handlers
async function handlePaymentSuccess(paymentIntent) {
  db.run(
    'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = ?',
    ['succeeded', paymentIntent.id]
  );
  console.log('Payment succeeded:', paymentIntent.id);
}

async function handlePaymentFailed(paymentIntent) {
  db.run(
    'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = ?',
    ['failed', paymentIntent.id]
  );
  console.log('Payment failed:', paymentIntent.id);
}

async function handleRefund(charge) {
  db.run(
    'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = ?',
    ['refunded', charge.payment_intent]
  );
  console.log('Payment refunded:', charge.payment_intent);
}

// Input validation and sanitization
function validateInput(input, maxLength = 500) {
  if (!input || typeof input !== 'string') return null;
  return validator.trim(input).substring(0, maxLength);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Stripe payment intent endpoint
app.post('/api/payment-intent', formLimiter, async (req, res) => {
  try {
    let { amount, email, name, paymentMethod, bnplProvider } = req.body;

    // Validate inputs
    amount = parseInt(amount);
    email = validateInput(email, 254);
    name = validateInput(name, 100);
    paymentMethod = validateInput(paymentMethod, 50);
    bnplProvider = validateInput(bnplProvider, 50);

    if (!amount || amount < 100 || !email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid amount or email' });
    }

    // Validate payment method
    const validMethods = ['card', 'klarna', 'afterpay_clearpay', 'paypal'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // in pence
      currency: 'gbp',
      payment_method_types: [paymentMethod],
      metadata: {
        email: email,
        name: name,
        bnpl_provider: bnplProvider || 'none'
      }
    });

    // Save to database
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO transactions (stripe_payment_intent_id, customer_email, customer_name, amount, payment_method, bnpl_provider, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [paymentIntent.id, email, name, amount, paymentMethod, bnplProvider || 'none', 'pending'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Get available BNPL payment methods
app.get('/api/payment-methods', (req, res) => {
  const methods = [
    {
      id: 'klarna',
      name: 'Klarna',
      description: '3-4 monthly payments',
      icon: '💳',
      fee: '2.49% + 30p',
      minAmount: 5000 // £50 minimum
    },
    {
      id: 'afterpay_clearpay',
      name: 'Clearpay',
      description: '4 fortnightly payments',
      icon: '💳',
      fee: '4-6%',
      minAmount: 3500 // £35 minimum
    },
    {
      id: 'paypal',
      name: 'PayPal Pay Later',
      description: '4 installments',
      icon: '💳',
      fee: '~2.9%',
      minAmount: 5000 // £50 minimum
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Instant payment',
      icon: '💳',
      fee: '1.4% + 20p',
      minAmount: 100 // £1 minimum
    }
  ];
  res.json(methods);
});

// Get transaction history
app.get('/api/transactions', (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.all(
    'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100',
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

// Contact form endpoint
app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    let { name, email, company, phone, message, recaptchaToken } = req.body;

    // Validate reCAPTCHA if token provided
    if (recaptchaToken) {
      const isValidCaptcha = await verifyReCAPTCHA(recaptchaToken);
      if (!isValidCaptcha) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }
    }

    // Validate and sanitize inputs
    name = validateInput(name, 100);
    email = validateInput(email, 254);
    company = validateInput(company, 100);
    phone = validateInput(phone, 20);
    message = validateInput(message, 5000);

    // Validate required fields
    if (!name || !email || !company) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Escape HTML for email content
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedCompany = escapeHtml(company);
    const escapedPhone = escapeHtml(phone || '');
    const escapedMessage = escapeHtml(message || '');

    // Save to database (using parameterized queries to prevent SQL injection)
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO leads (name, email, company, phone, type) VALUES (?, ?, ?, ?, ?)',
        [name, email, company, phone, 'contact'],
        function(err) {
          if (err && err.message !== 'UNIQUE constraint failed: leads.email') {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // Send email to business owner
    if (process.env.SMTP_USER) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL || 'fawaz@belloite.com',
          subject: `New Contact: ${escapedName} from ${escapedCompany}`,
          html: `
            <h2>New inquiry from your BNPL landing page</h2>
            <p><strong>Name:</strong> ${escapedName}</p>
            <p><strong>Email:</strong> ${escapedEmail}</p>
            <p><strong>Company:</strong> ${escapedCompany}</p>
            <p><strong>Phone:</strong> ${escapedPhone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${escapedMessage || 'No message'}</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }

      // Send confirmation email to lead
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: 'Thanks for reaching out - BNPL Solutions',
          html: `
            <h2>Thanks for your interest!</h2>
            <p>Hi ${escapedName},</p>
            <p>We've received your message and will be in touch within 24 hours.</p>
            <p>In the meantime, check out our full BNPL solutions guide for small businesses.</p>
            <p>Best regards,<br>The BNPL Solutions Team</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    } else {
      console.warn('SMTP not configured. Skipping email notifications.');
    }

    res.status(200).json({ success: true, message: 'Thank you! We\'ll be in touch soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// Waitlist endpoint
app.post('/api/waitlist', formLimiter, async (req, res) => {
  try {
    let { email, company, name, recaptchaToken } = req.body;

    // Validate reCAPTCHA if token provided
    if (recaptchaToken) {
      const isValidCaptcha = await verifyReCAPTCHA(recaptchaToken);
      if (!isValidCaptcha) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }
    }

    // Validate and sanitize inputs
    email = validateInput(email, 254);
    company = validateInput(company, 100);
    name = validateInput(name, 100);

    // Validate required field
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Escape HTML for email content
    const escapedEmail = escapeHtml(email);
    const escapedCompany = escapeHtml(company || '');
    const escapedName = escapeHtml(name || '');

    // Save to database
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO leads (name, email, company, type) VALUES (?, ?, ?, ?)',
        [name || 'N/A', email, company || 'N/A', 'waitlist'],
        function(err) {
          if (err && err.message !== 'UNIQUE constraint failed: leads.email') {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // Send confirmation to lead
    if (process.env.SMTP_USER) {
      try {
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
      } catch (emailError) {
        console.error('Failed to send waitlist confirmation:', emailError);
      }

      // Notify admin
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL || 'fawaz@belloite.com',
          subject: `New waitlist signup: ${escapedEmail}`,
          html: `
            <p><strong>Email:</strong> ${escapedEmail}</p>
            <p><strong>Company:</strong> ${escapedCompany || 'Not provided'}</p>
            <p><strong>Name:</strong> ${escapedName || 'Not provided'}</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send admin waitlist notification:', emailError);
      }
    } else {
      console.warn('SMTP not configured. Skipping email notifications.');
    }

    res.status(200).json({ success: true, message: 'Welcome to the waitlist!' });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// Get leads - Protected with API key
app.get('/api/leads', (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.all('SELECT * FROM leads ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Security features enabled: Helmet, Rate Limiting, Input Validation');
});
