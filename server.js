import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import nodemailer from 'nodemailer'
import stripe from 'stripe'
import axios from 'axios'
import validator from 'validator'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import pg from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY || '')

// Initialize PostgreSQL client
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

// Track if database is available
let databaseAvailable = false

// Initialize database schema on startup
async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql')
    const schema = await fsPromises.readFile(schemaPath, 'utf-8')

    await pool.query(schema)
    console.log('✓ Database schema initialized successfully')
  } catch (error) {
    console.warn('⚠️  Database schema initialization error:', error.message)
  }
}

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err)
    console.warn('⚠️  Database not configured. Running in fallback mode with mock data.')
    databaseAvailable = false
  } else {
    console.log('✓ PostgreSQL connection successful')
    databaseAvailable = true
    initializeDatabase()
  }
})

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.set('trust proxy', 1)
app.use(helmet())
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || '*').split(','),
    credentials: true,
  })
)

app.use(bodyParser.json({ limit: '10kb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }))

// Serve static files (React build)
import fs from 'fs'
import { promises as fsPromises } from 'fs'

const distPath = path.join(__dirname, 'dist')
const publicPath = path.join(__dirname, 'public')

console.log('📁 Checking static file directories:')
console.log(`   - dist path: ${distPath}`)
console.log(`   - public path: ${publicPath}`)

// Check if dist exists
try {
  const distExists = fs.existsSync(distPath)
  const publicExists = fs.existsSync(publicPath)
  console.log(`   - dist exists: ${distExists}`)
  console.log(`   - public exists: ${publicExists}`)
  if (distExists) {
    const files = fs.readdirSync(distPath)
    console.log(`   - dist files: ${files.join(', ')}`)
  }
} catch (e) {
  console.log('   - Error checking directories:', e.message)
}

app.use(express.static(distPath))
app.use(express.static(publicPath))

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
})

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
})

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many form submissions, please try again later.',
})

app.use('/api/', apiLimiter)

// ============================================================================
// SMTP SETUP
// ============================================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Verify SMTP asynchronously without blocking startup
// Set a timeout to prevent hanging
if (process.env.SMTP_USER) {
  const smtpVerifyTimeout = setTimeout(() => {
    console.warn('⚠️  SMTP verification timeout. Email services may not work.')
  }, 3000)

  transporter.verify((error, success) => {
    clearTimeout(smtpVerifyTimeout)
    if (error) {
      console.warn('⚠️  SMTP Configuration Error. Email functionality may not work.')
    } else if (success) {
      console.log('✓ SMTP connection successful. Email services ready.')
    }
  })
} else {
  console.log('ℹ️  SMTP not configured. Email functionality disabled.')
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function validateInput(input, maxLength = 500) {
  if (!input || typeof input !== 'string') return null
  return validator.trim(input).substring(0, maxLength)
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, 'manager']
    )

    const user = result.rows[0]
    const accessToken = jwt.sign(user, process.env.JWT_SECRET || 'secret', {
      expiresIn: '15m',
    })
    const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
      expiresIn: '7d',
    })

    res.json({
      user,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    let user
    if (databaseAvailable) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      user = result.rows[0]
      const validPassword = await bcryptjs.compare(password, user.password_hash)

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])
    } else {
      // Fallback: Demo credentials for development/testing
      const demoEmail = 'admin@oakstratton.com'
      const demoPassword = 'AdminPassword123!'

      if (email !== demoEmail || password !== demoPassword) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      user = {
        id: '1',
        email: demoEmail,
        role: 'admin',
      }
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    )
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    )

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true })
})

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not found' })
  }
  res.json({ user: req.user })
})

app.post('/api/auth/refresh-token', (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' })
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret', (err, user) => {
      if (err) {
        console.error('Token verification error:', err.message)
        return res.status(403).json({ error: 'Invalid refresh token' })
      }

      try {
        const { iat, exp, ...userPayload } = user
        const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET || 'secret', {
          expiresIn: '15m',
        })
        res.json({ accessToken })
      } catch (signError) {
        console.error('Token signing error:', signError)
        res.status(500).json({ error: 'Token refresh failed' })
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error.message)
    res.status(500).json({ error: 'Token refresh failed' })
  }
})

// ============================================================================
// ADMIN DASHBOARD ENDPOINTS
// ============================================================================

app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    if (databaseAvailable) {
      const stats = await pool.query('SELECT * FROM dashboard_stats')
      return res.json(stats.rows[0] || {})
    } else {
      // Fallback: Mock dashboard data
      return res.json({
        total_leads: 700,
        new_this_week: 42,
        active_templates: 8,
        engagement_rate: 68,
        conversion_rate: 24,
        revenue: 12450,
      })
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

// ============================================================================
// LEADS ENDPOINTS (Enhanced)
// ============================================================================

app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    const { name, email, company, phone, message } = req.body

    // Validation
    if (!name || !email || !company) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Insert into database
    await pool.query(
      'INSERT INTO leads (name, email, company, phone, source, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
      [name, email, company, phone || null, 'contact', 'new']
    )

    // Send emails if SMTP is configured
    if (process.env.SMTP_USER) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL || 'fawaz@belloite.com',
          subject: `New Contact: ${name} from ${company}`,
          html: `
            <h2>New inquiry from your BNPL landing page</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Company:</strong> ${escapeHtml(company)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message || 'No message')}</p>
          `,
        })

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: 'Thanks for reaching out - BNPL Solutions',
          html: `
            <h2>Thanks for your interest!</h2>
            <p>Hi ${escapeHtml(name)},</p>
            <p>We've received your message and will be in touch within 24 hours.</p>
            <p>Best regards,<br>The Oakstratton Team</p>
          `,
        })
      } catch (emailError) {
        console.error('Email sending error:', emailError)
      }
    }

    res.status(200).json({ success: true, message: 'Thank you! We\'ll be in touch soon.' })
  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({ error: 'Failed to process your request' })
  }
})

app.post('/api/waitlist', formLimiter, async (req, res) => {
  try {
    const { email, company, name } = req.body

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' })
    }

    await pool.query(
      'INSERT INTO leads (email, company, name, source, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      [email, company || 'N/A', name || 'N/A', 'waitlist', 'new']
    )

    if (process.env.SMTP_USER) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: 'Welcome to our waitlist!',
          html: `
            <h2>You're on the list! 🎉</h2>
            <p>Thanks for joining the waitlist for BNPL solutions.</p>
            <p>We'll send you early access and a special launch discount.</p>
            <p>Best regards,<br>The Oakstratton Team</p>
          `,
        })
      } catch (emailError) {
        console.error('Waitlist confirmation error:', emailError)
      }
    }

    res.status(200).json({ success: true, message: 'Welcome to the waitlist!' })
  } catch (error) {
    console.error('Waitlist error:', error)
    res.status(500).json({ error: 'Failed to join waitlist' })
  }
})

// ============================================================================
// PAYMENT ENDPOINTS (Existing - Maintained for Compatibility)
// ============================================================================

app.get('/api/payment-methods', (req, res) => {
  const methods = [
    {
      id: 'klarna',
      name: 'Klarna',
      description: '3-4 monthly payments',
      icon: '💳',
      fee: '2.49% + 30p',
      minAmount: 5000,
    },
    {
      id: 'afterpay_clearpay',
      name: 'Clearpay',
      description: '4 fortnightly payments',
      icon: '💳',
      fee: '4-6%',
      minAmount: 3500,
    },
    {
      id: 'paypal',
      name: 'PayPal Pay Later',
      description: '4 installments',
      icon: '💳',
      fee: '~2.9%',
      minAmount: 5000,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Instant payment',
      icon: '💳',
      fee: '1.4% + 20p',
      minAmount: 100,
    },
  ]
  res.json(methods)
})

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// ============================================================================
// REACT APP FALLBACK (SPA routing)
// ============================================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'))
    }
  })
})

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`)
  console.log(`🌍 API URL: ${process.env.API_URL || 'http://localhost:3000'}`)
  console.log(`📱 Frontend URL: ${process.env.VITE_API_URL || 'http://localhost:3000'}`)
  console.log(`🔐 Security features enabled: Helmet, Rate Limiting, Input Validation`)
  console.log(`🔑 Authentication: JWT with refresh tokens`)
  if (process.env.DATABASE_URL) {
    console.log(`🗄️  Database: PostgreSQL`)
  } else {
    console.log(`⚠️  Database: Not configured (DATABASE_URL not set)`)
  }
  console.log(`📧 SMTP: ${process.env.SMTP_USER ? 'Configured' : 'Not configured'}`)
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'All origins'}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`)
})
// Deployment trigger at Sun May 24 16:40:46 UTC 2026
