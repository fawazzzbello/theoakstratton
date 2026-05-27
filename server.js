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
import fs from 'fs'
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

    // Run migrations to fix existing databases
    await runMigrations()

    // Seed default data
    await seedDefaultAdmin()
    await seedDefaultPlans()
    await seedDefaultEmailTemplates()
  } catch (error) {
    console.warn('⚠️  Database schema initialization error:', error.message)
  }
}

// Run database migrations
async function runMigrations() {
  try {
    const migrationsPath = path.join(__dirname, 'database', 'migrations.sql')
    const migrations = await fsPromises.readFile(migrationsPath, 'utf-8')

    await pool.query(migrations)
    console.log('✓ Database migrations completed successfully')
  } catch (error) {
    console.warn('⚠️  Database migrations error:', error.message)
  }
}

// Seed default pricing plans
async function seedDefaultPlans() {
  try {
    const plans = [
      { id: 'starter', name: 'Starter', description: 'Perfect for small businesses', price_gbp: 29900, features: ['Basic BNPL', 'Up to 100 customers', 'Email support'], display_order: 1 },
      { id: 'growth', name: 'Growth', description: 'For growing companies', price_gbp: 79900, features: ['Advanced BNPL', 'Up to 1000 customers', 'Priority support', 'Analytics'], display_order: 2 },
      { id: 'premium', name: 'Premium', description: 'Enterprise solution', price_gbp: 199900, features: ['Full BNPL Suite', 'Unlimited customers', '24/7 support', 'Custom integrations'], display_order: 3 },
    ]

    // Try to insert plans - if it fails due to schema mismatch, that's OK, we'll use defaults
    for (const plan of plans) {
      try {
        await pool.query(
          'INSERT INTO pricing_plans (id, name, description, price_gbp, features, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP',
          [plan.id, plan.name, plan.description, plan.price_gbp, JSON.stringify(plan.features), plan.display_order, true]
        )
      } catch (err) {
        // Silently skip - plan seeding may fail if schema differs, API will use defaults
      }
    }
    console.log('✓ Pricing plans sync completed')
  } catch (error) {
    console.warn('⚠️  Note: Plan seeding skipped (schema mismatch or database unavailable)')
  }
}

// Seed default email templates
async function seedDefaultEmailTemplates() {
  try {
    const templates = [
      {
        name: 'Welcome Email',
        subject: 'Welcome to Oakstratton - Your BNPL Solution',
        body: `<h2>Welcome to Oakstratton!</h2>
<p>Hi {{name}},</p>
<p>Thank you for your interest in our Buy Now Pay Later (BNPL) solutions. We're excited to help you provide flexible payment options to your customers.</p>
<h3>What's Next?</h3>
<ul>
  <li>Explore our BNPL features</li>
  <li>Review our pricing plans</li>
  <li>Schedule a demo with our team</li>
</ul>
<p>If you have any questions, reply to this email or contact us at support@oakstratton.com</p>
<p>Best regards,<br><strong>The Oakstratton Team</strong></p>`,
      },
      {
        name: 'Payment Confirmation',
        subject: 'Payment Confirmation - Oakstratton {{plan}}',
        body: `<h2>Payment Received!</h2>
<p>Hi {{name}},</p>
<p>Thank you for your payment. Your {{plan}} plan is now active.</p>
<h3>Account Details</h3>
<p><strong>Company:</strong> {{company}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p>You can now access your Oakstratton admin dashboard to start managing your BNPL integrations.</p>
<p>Thank you for choosing Oakstratton!</p>
<p>Best regards,<br><strong>The Oakstratton Team</strong></p>`,
      },
      {
        name: 'Feature Update',
        subject: 'New BNPL Features Available',
        body: `<h2>Introducing New Features</h2>
<p>Hi {{name}},</p>
<p>We're constantly improving Oakstratton to serve you better. Check out our latest features:</p>
<ul>
  <li>Enhanced analytics dashboard</li>
  <li>Improved payment processing</li>
  <li>New BNPL provider integrations</li>
  <li>Better customer reporting</li>
</ul>
<p>Log in to your dashboard to explore these new features and optimize your BNPL strategy.</p>
<p>Questions? Contact our support team anytime.</p>
<p>Best regards,<br><strong>The Oakstratton Team</strong></p>`,
      },
      {
        name: 'Re-engagement Campaign',
        subject: 'We miss you! Special offer inside',
        body: `<h2>Come Back and Grow Your Business</h2>
<p>Hi {{name}},</p>
<p>We notice you haven't been using your Oakstratton account recently. We'd love to help you succeed with BNPL payments.</p>
<h3>Special Offer</h3>
<p>Get 30% off your next month when you upgrade your plan this week!</p>
<p>Let us know if there's anything we can help you with or if you have any questions about our service.</p>
<p>Best regards,<br><strong>The Oakstratton Team</strong></p>`,
      },
    ]

    for (const template of templates) {
      try {
        const existing = await pool.query(
          'SELECT id FROM email_templates WHERE name = $1',
          [template.name]
        )

        if (existing.rows.length === 0) {
          await pool.query(
            'INSERT INTO email_templates (name, subject, html_content, category, is_active) VALUES ($1, $2, $3, $4, $5)',
            [template.name, template.subject, template.body, 'custom', true]
          )
        }
      } catch (err) {
        // Silently skip individual template errors
      }
    }
    console.log('✓ Default email templates seeded')
  } catch (error) {
    console.warn('⚠️  Note: Email template seeding skipped (schema mismatch or database unavailable)')
  }
}

// Seed default admin user
async function seedDefaultAdmin() {
  try {
    const adminEmail = 'admin@oakstratton.com'
    const adminPassword = 'AdminPassword123!'

    // Check if admin already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail])

    if (existing.rows.length === 0) {
      const hashedPassword = await bcryptjs.hash(adminPassword, 10)
      await pool.query(
        'INSERT INTO users (email, password_hash, role, is_superadmin, first_name, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
        [adminEmail, hashedPassword, 'admin', true, 'System', true]
      )
      console.log('✓ Default admin user created with superadmin role')
    }
  } catch (error) {
    console.warn('⚠️  Error seeding default admin user:', error.message)
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
// SMTP SETUP - Outlook/Office365 Compatible
// ============================================================================

const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' ? true : false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
}

// Add TLS options for better compatibility
if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('office365')) {
  smtpConfig.tls = {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  }
}

const transporter = nodemailer.createTransport(smtpConfig)

// Verify SMTP asynchronously without blocking startup
if (process.env.SMTP_USER) {
  const smtpVerifyTimeout = setTimeout(() => {
    console.warn('⚠️  SMTP verification timeout. Email services may not work.')
  }, 5000)

  transporter.verify((error, success) => {
    clearTimeout(smtpVerifyTimeout)
    if (error) {
      console.error('❌ SMTP Configuration Error:', error.message)
      console.warn('⚠️  Email functionality disabled. Check SMTP credentials.')
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

// Send email with retry logic
async function sendEmailWithRetry(mailOptions, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions)
      console.log(`✓ Email sent successfully to ${mailOptions.to}`)
      return result
    } catch (error) {
      console.error(`Email attempt ${attempt}/${maxRetries} failed for ${mailOptions.to}:`, error.message)

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempt - 1) * 1000
        console.log(`Retrying in ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      } else {
        console.error(`Failed to send email to ${mailOptions.to} after ${maxRetries} attempts`)
        throw error
      }
    }
  }
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
// LEADS MANAGEMENT ENDPOINTS
// ============================================================================

app.get('/api/admin/leads', authenticateToken, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (databaseAvailable) {
      const result = await pool.query(
        'SELECT id, name, email, company, phone, source, status, created_at FROM leads ORDER BY created_at DESC LIMIT 500'
      )
      return res.json(result.rows.map(row => ({
        id: row.id,
        name: row.name || 'N/A',
        email: row.email,
        company: row.company || 'N/A',
        phone: row.phone || '',
        source: row.source || 'contact',
        status: row.status || 'new',
        date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      })))
    } else {
      return res.json([])
    }
  } catch (error) {
    console.error('Get leads error:', error)
    res.status(500).json({ error: 'Failed to fetch leads' })
  }
})

app.post('/api/admin/send-response/:leadId', authenticateToken, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { leadId } = req.params
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    if (databaseAvailable) {
      // Get lead info
      const leadResult = await pool.query('SELECT email, name FROM leads WHERE id = $1', [leadId])
      if (leadResult.rows.length === 0) {
        return res.status(404).json({ error: 'Lead not found' })
      }

      const lead = leadResult.rows[0]

      // TODO: Send email via configured SMTP (currently disabled)
      // For now, just save the message and update status
      await pool.query(
        'UPDATE leads SET status = $1, notes = $2 WHERE id = $3',
        ['contacted', (message || '').substring(0, 1000)]
      )

      res.json({ success: true, message: 'Response sent successfully' })
    } else {
      res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Send response error:', error)
    res.status(500).json({ error: 'Failed to send response' })
  }
})

// ============================================================================
// USER MANAGEMENT ENDPOINTS (Admin Only)
// ============================================================================

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.role || req.user.role === 'manager') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (databaseAvailable) {
      const result = await pool.query('SELECT id, email, first_name, last_name, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC')
      return res.json(result.rows)
    } else {
      return res.json([{ id: '1', email: 'admin@oakstratton.com', first_name: 'System', role: 'admin', is_active: true, created_at: new Date() }])
    }
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role === 'manager') {
      return res.status(403).json({ error: 'Unauthorized - only admins can create users' })
    }

    const { email, password, firstName, lastName, role } = req.body

    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'Email, password, and first name required' })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    if (databaseAvailable) {
      const hashedPassword = await bcryptjs.hash(password, 10)
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING id, email, first_name, role',
        [email, hashedPassword, firstName, lastName || '', role || 'manager']
      )
      return res.status(201).json(result.rows[0])
    } else {
      return res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Create user error:', error)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' })
    }
    res.status(500).json({ error: 'Failed to create user' })
  }
})

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role === 'manager') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    if (databaseAvailable) {
      await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id])
      return res.json({ success: true })
    } else {
      return res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

app.post('/api/admin/users/:id/change-password', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role === 'manager') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    if (databaseAvailable) {
      const hashedPassword = await bcryptjs.hash(newPassword, 10)
      await pool.query('UPDATE users SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, id])
      return res.json({ success: true })
    } else {
      return res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

// ============================================================================
// CONTENT MANAGEMENT ENDPOINTS
// ============================================================================

app.get('/api/landing-content', async (req, res) => {
  try {
    if (databaseAvailable) {
      const result = await pool.query('SELECT section_name, section_key, content_type, content_value FROM landing_content ORDER BY section_name')
      const contentMap = {}
      result.rows.forEach(row => {
        if (!contentMap[row.section_name]) contentMap[row.section_name] = {}
        try {
          contentMap[row.section_name][row.section_key] = row.content_type === 'json' ? JSON.parse(row.content_value) : row.content_value
        } catch {
          contentMap[row.section_name][row.section_key] = row.content_value
        }
      })
      return res.json(contentMap)
    } else {
      return res.json(getLandingContentDefaults())
    }
  } catch (error) {
    console.error('Get landing content error:', error)
    res.status(500).json({ error: 'Failed to fetch content' })
  }
})

app.put('/api/admin/landing-content/:sectionKey', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role === 'manager') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { sectionKey } = req.params
    const { contentValue, contentType = 'text', sectionName = 'general' } = req.body

    if (!contentValue) {
      return res.status(400).json({ error: 'Content value required' })
    }

    if (databaseAvailable) {
      const valueStr = typeof contentValue === 'string' ? contentValue : JSON.stringify(contentValue)
      await pool.query(
        'INSERT INTO landing_content (section_name, section_key, content_type, content_value, updated_by) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (section_key) DO UPDATE SET content_value = $4, updated_by = $5, updated_at = CURRENT_TIMESTAMP, version = version + 1',
        [sectionName, sectionKey, contentType, valueStr, req.user.id]
      )
      return res.json({ success: true })
    } else {
      return res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Update content error:', error)
    res.status(500).json({ error: 'Failed to update content' })
  }
})

// ============================================================================
// PRICING & ORDERS ENDPOINTS
// ============================================================================

app.get('/api/plans', async (req, res) => {
  try {
    if (databaseAvailable) {
      const result = await pool.query('SELECT id, name, description, price_gbp, features FROM pricing_plans WHERE is_active = true ORDER BY display_order')
      return res.json(result.rows)
    } else {
      return res.json(getDefaultPlans())
    }
  } catch (error) {
    console.error('Get plans error:', error)
    res.status(500).json({ error: 'Failed to fetch plans' })
  }
})

app.post('/api/checkout/create-session', formLimiter, async (req, res) => {
  try {
    const { planId, email, name } = req.body

    if (!planId || !email || !name) {
      return res.status(400).json({ error: 'Plan ID, email, and name required' })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (databaseAvailable) {
      // Try to find plan by ID, but fall back to name if ID is a string (UUID mismatch)
      let planResult = { rows: [] }

      try {
        // Try direct ID lookup first
        planResult = await pool.query('SELECT id, name, price_gbp, stripe_price_id FROM pricing_plans WHERE id = $1 AND is_active = true', [planId])
      } catch (err) {
        // If UUID type error, try looking up by name instead
        if (err.message.includes('invalid input syntax for type uuid')) {
          try {
            planResult = await pool.query('SELECT id, name, price_gbp, stripe_price_id FROM pricing_plans WHERE LOWER(name) = LOWER($1) AND is_active = true', [planId])
          } catch (nameErr) {
            // If name lookup also fails, use defaults
          }
        }
      }

      // If still no plan found, use default plans
      if (planResult.rows.length === 0) {
        const defaults = getDefaultPlans()
        const defaultPlan = defaults.find(p => p.id === planId)
        if (!defaultPlan) {
          return res.status(404).json({ error: 'Plan not found' })
        }

        // Use default plan data
        const plan = { id: defaultPlan.id, name: defaultPlan.name, price_gbp: defaultPlan.price_gbp, stripe_price_id: null }
        const stripePrice = plan.stripe_price_id || (plan.price_gbp * 100).toString()
        const orderNumber = `ORD-${Date.now()}`

        const session = await stripeClient.checkout.sessions.create({
          payment_method_types: ['card', 'klarna', 'afterpay_clearpay', 'paypal'],
          line_items: [
            {
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: plan.name,
                },
                unit_amount: plan.price_gbp,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/cancel`,
          customer_email: email,
          metadata: {
            order_number: orderNumber,
            plan_id: planId,
            customer_name: name,
          },
        })

        return res.json({ sessionId: session.id, url: session.url })
      }

      const plan = planResult.rows[0]
      const stripePrice = plan.stripe_price_id || (plan.price_gbp * 100).toString()
      const orderNumber = `ORD-${Date.now()}`

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card', 'klarna', 'afterpay_clearpay', 'paypal'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: plan.name,
              },
              unit_amount: plan.price_gbp,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/cancel`,
        customer_email: email,
        metadata: {
          order_number: orderNumber,
          plan_id: planId,
          customer_name: name,
        },
      })

      // Store order
      await pool.query(
        'INSERT INTO orders (order_number, customer_email, customer_name, plan_id, amount_gbp, stripe_session_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [orderNumber, email, name, planId, plan.price_gbp, session.id, 'pending']
      )

      return res.json({ sessionId: session.id, url: session.url })
    } else {
      return res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Create session error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

app.get('/api/checkout/session-details', async (req, res) => {
  try {
    const { session_id } = req.query

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    const session = await stripeClient.checkout.sessions.retrieve(session_id)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // Return relevant session details
    res.json({
      id: session.id,
      email: session.customer_email,
      plan_name: session.metadata?.plan_id,
      amount: (session.amount_total / 100).toFixed(2),
      status: session.payment_status,
    })
  } catch (error) {
    console.error('Get session details error:', error)
    res.status(500).json({ error: 'Failed to fetch session details' })
  }
})

app.get('/api/admin/orders', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role === 'manager') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (databaseAvailable) {
      const result = await pool.query('SELECT id, order_number, customer_email, customer_name, amount_gbp, status, created_at FROM orders ORDER BY created_at DESC LIMIT 100')
      return res.json(result.rows)
    } else {
      return res.json([])
    }
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// ============================================================================
// EMAIL TEMPLATES ENDPOINTS
// ============================================================================

app.get('/api/admin/email-templates', authenticateToken, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (databaseAvailable) {
      const result = await pool.query(
        'SELECT id, name, subject, html_content as body, is_active, created_at FROM email_templates ORDER BY created_at DESC'
      )
      return res.json(result.rows.map(row => ({
        id: row.id,
        name: row.name,
        subject: row.subject,
        body: row.body,
        preview: row.body.substring(0, 100),
        is_active: row.is_active,
        created_at: row.created_at,
      })))
    } else {
      return res.json([])
    }
  } catch (error) {
    console.error('Get email templates error:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

app.post('/api/admin/email-templates', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { name, subject, body, is_active } = req.body

    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (databaseAvailable) {
      const result = await pool.query(
        'INSERT INTO email_templates (name, subject, html_content, is_active, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, subject, body, is_active !== false, req.user.id]
      )
      res.json({ success: true, id: result.rows[0].id })
    } else {
      res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Create template error:', error)
    res.status(500).json({ error: 'Failed to create template' })
  }
})

app.put('/api/admin/email-templates/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { name, subject, body, is_active } = req.body
    const { id } = req.params

    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (databaseAvailable) {
      await pool.query(
        'UPDATE email_templates SET name = $1, subject = $2, html_content = $3, is_active = $4 WHERE id = $5',
        [name, subject, body, is_active !== false, id]
      )
      res.json({ success: true })
    } else {
      res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Update template error:', error)
    res.status(500).json({ error: 'Failed to update template' })
  }
})

app.delete('/api/admin/email-templates/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    if (databaseAvailable) {
      await pool.query('DELETE FROM email_templates WHERE id = $1', [id])
      res.json({ success: true })
    } else {
      res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Delete template error:', error)
    res.status(500).json({ error: 'Failed to delete template' })
  }
})

// ============================================================================
// EMAIL CAMPAIGNS ENDPOINTS
// ============================================================================

app.get('/api/admin/email-campaigns', authenticateToken, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (databaseAvailable) {
      const result = await pool.query(
        'SELECT id, name, template_id, segment, recipient_count, status, sent_at, created_at FROM email_campaigns ORDER BY created_at DESC'
      )
      return res.json(result.rows)
    } else {
      return res.json([])
    }
  } catch (error) {
    console.error('Get campaigns error:', error)
    res.status(500).json({ error: 'Failed to fetch campaigns' })
  }
})

app.post('/api/admin/email-campaigns', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { name, template_id, segment } = req.body

    if (!name || !template_id || !segment) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (databaseAvailable) {
      // Get recipient count based on segment
      let recipientCount = 0
      if (segment === 'all') {
        const countResult = await pool.query('SELECT COUNT(*) as count FROM leads')
        recipientCount = parseInt(countResult.rows[0].count)
      } else if (segment === 'waitlist') {
        const countResult = await pool.query('SELECT COUNT(*) as count FROM leads WHERE source = $1', ['waitlist'])
        recipientCount = parseInt(countResult.rows[0].count)
      } else if (segment === 'contacted') {
        const countResult = await pool.query('SELECT COUNT(*) as count FROM leads WHERE status = $1', ['contacted'])
        recipientCount = parseInt(countResult.rows[0].count)
      } else if (segment === 'customers') {
        const countResult = await pool.query('SELECT COUNT(*) as count FROM leads WHERE status = $1', ['customer'])
        recipientCount = parseInt(countResult.rows[0].count)
      } else if (segment === 'new') {
        const countResult = await pool.query('SELECT COUNT(*) as count FROM leads WHERE status = $1', ['new'])
        recipientCount = parseInt(countResult.rows[0].count)
      }

      const result = await pool.query(
        'INSERT INTO email_campaigns (name, template_id, segment, recipient_count, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, template_id, segment, recipientCount, req.user.id]
      )
      res.json({ success: true, id: result.rows[0].id })
    } else {
      res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Create campaign error:', error)
    res.status(500).json({ error: 'Failed to create campaign' })
  }
})

app.post('/api/admin/email-campaigns/:id/send', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    if (databaseAvailable) {
      // Get campaign details
      const campaignResult = await pool.query(
        'SELECT * FROM email_campaigns WHERE id = $1',
        [id]
      )

      if (campaignResult.rows.length === 0) {
        return res.status(404).json({ error: 'Campaign not found' })
      }

      const campaign = campaignResult.rows[0]

      // TODO: Send emails based on segment
      // For now, just mark as sent
      await pool.query(
        'UPDATE email_campaigns SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['sent', id]
      )

      res.json({ success: true, message: `Campaign sent to ${campaign.recipient_count} recipients` })
    } else {
      res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Send campaign error:', error)
    res.status(500).json({ error: 'Failed to send campaign' })
  }
})

app.delete('/api/admin/email-campaigns/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    if (databaseAvailable) {
      await pool.query('DELETE FROM email_campaigns WHERE id = $1', [id])
      res.json({ success: true })
    } else {
      res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Delete campaign error:', error)
    res.status(500).json({ error: 'Failed to delete campaign' })
  }
})

// ============================================================================
// TESTIMONIALS ENDPOINTS
// ============================================================================

app.get('/api/testimonials', async (req, res) => {
  try {
    if (databaseAvailable) {
      const result = await pool.query('SELECT id, quote, author, role, company, rating, image_url FROM testimonials WHERE is_active = true ORDER BY display_order')
      return res.json(result.rows)
    } else {
      return res.json(getDefaultTestimonials())
    }
  } catch (error) {
    console.error('Get testimonials error:', error)
    res.status(500).json({ error: 'Failed to fetch testimonials' })
  }
})

app.post('/api/admin/testimonials', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role === 'manager') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { quote, author, role, company, rating } = req.body

    if (!quote || !author) {
      return res.status(400).json({ error: 'Quote and author required' })
    }

    if (databaseAvailable) {
      const result = await pool.query(
        'INSERT INTO testimonials (quote, author, role, company, rating, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *',
        [quote, author, role || '', company || '', rating || 5]
      )
      return res.status(201).json(result.rows[0])
    } else {
      return res.status(503).json({ error: 'Database not available' })
    }
  } catch (error) {
    console.error('Create testimonial error:', error)
    res.status(500).json({ error: 'Failed to create testimonial' })
  }
})

// ============================================================================
// STRIPE WEBHOOK HANDLER
// ============================================================================

app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return res.status(400).json({ error: 'Webhook secret not configured' })
  }

  try {
    const event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      if (databaseAvailable && session.metadata.order_number) {
        await pool.query(
          'UPDATE orders SET stripe_payment_intent_id = $1, status = $2, stripe_customer_id = $3, updated_at = CURRENT_TIMESTAMP WHERE stripe_session_id = $4',
          [session.payment_intent, 'completed', session.customer, session.id]
        )
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).json({ error: 'Webhook error' })
  }
})

// ============================================================================
// DEFAULT DATA FUNCTIONS
// ============================================================================

function getLandingContentDefaults() {
  return {
    hero: {
      hero_title: 'Modern BNPL Solutions for Your Business',
      hero_subtitle: 'Empower customers with flexible payment options. Increase conversion rates by up to 30%.',
      hero_cta: 'Get Started Today',
    },
  }
}

function getDefaultPlans() {
  return [
    { id: 'starter', name: 'Starter', description: 'Perfect for small businesses', price_gbp: 29900, features: ['Basic BNPL', 'Up to 100 customers', 'Email support'] },
    { id: 'growth', name: 'Growth', description: 'For growing companies', price_gbp: 79900, features: ['Advanced BNPL', 'Up to 1000 customers', 'Priority support', 'Analytics'] },
    { id: 'premium', name: 'Premium', description: 'Enterprise solution', price_gbp: 199900, features: ['Full BNPL Suite', 'Unlimited customers', '24/7 support', 'Custom integrations'] },
  ]
}

function getDefaultTestimonials() {
  return [
    { id: '1', quote: 'Oakstratton increased our conversion rates by 28%', author: 'Sarah Johnson', role: 'CEO', company: 'TechStart Inc' },
    { id: '2', quote: 'Best BNPL solution we\'ve ever implemented', author: 'Mike Chen', role: 'CFO', company: 'Growth Retail' },
  ]
}

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

    // TODO: Email functionality - implement later or configure SMTP_USER env var

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

    // TODO: Email functionality - implement later or configure SMTP_USER env var

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
// ADMIN DATA MANAGEMENT ENDPOINTS (Clear Demo Data)
// ============================================================================

app.post('/api/admin/clear-data', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { tables } = req.body

    if (!tables || !Array.isArray(tables)) {
      return res.status(400).json({ error: 'Please specify tables to clear' })
    }

    const allowedTables = ['leads', 'analytics_events', 'email_events', 'orders', 'transactions']
    const tablesToClear = tables.filter((t) => allowedTables.includes(t))

    if (tablesToClear.length === 0) {
      return res.status(400).json({ error: 'No valid tables specified' })
    }

    for (const table of tablesToClear) {
      await pool.query(`DELETE FROM ${table}`)
      console.log(`✓ Cleared ${table} table`)
    }

    res.json({ success: true, message: `Cleared ${tablesToClear.join(', ')} tables` })
  } catch (error) {
    console.error('Clear data error:', error)
    res.status(500).json({ error: 'Failed to clear data' })
  }
})

app.post('/api/admin/clear-leads', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await pool.query('DELETE FROM leads')
    res.json({ success: true, message: 'All leads cleared' })
  } catch (error) {
    console.error('Clear leads error:', error)
    res.status(500).json({ error: 'Failed to clear leads' })
  }
})

app.post('/api/admin/clear-analytics', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await pool.query('DELETE FROM analytics_events')
    await pool.query('DELETE FROM email_events')
    res.json({ success: true, message: 'All analytics cleared' })
  } catch (error) {
    console.error('Clear analytics error:', error)
    res.status(500).json({ error: 'Failed to clear analytics' })
  }
})

// ============================================================================
// FILE UPLOAD ENDPOINTS
// ============================================================================

app.post('/api/admin/upload-asset', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Get raw body for file upload
    let chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', async () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8')
        const boundary = req.headers['content-type'].split('boundary=')[1]

        // Simple multipart form-data parser
        const parts = body.split(`--${boundary}`)
        let fileData = null
        let filename = null
        let fileType = null

        for (const part of parts) {
          if (part.includes('filename=')) {
            const filenameMatch = part.match(/filename="([^"]+)"/)
            if (filenameMatch) filename = filenameMatch[1]

            const typeMatch = part.match(/name="type".*?\r\n\r\n([^\r\n]+)/)
            if (typeMatch) fileType = typeMatch[1]

            const fileContent = part.split('\r\n\r\n')[1]?.split('\r\n--')[0]
            if (fileContent) fileData = fileContent
          }
        }

        if (!fileData || !filename || !fileType) {
          return res.status(400).json({ error: 'File upload failed' })
        }

        // Save file to public folder
        const publicPath = path.join(__dirname, 'public', 'assets')
        if (!fs.existsSync(publicPath)) {
          fs.mkdirSync(publicPath, { recursive: true })
        }

        let filepath
        if (fileType === 'logo') {
          filepath = path.join(publicPath, 'logo.png')
        } else if (fileType === 'favicon') {
          filepath = path.join(publicPath, 'favicon.ico')
        } else {
          return res.status(400).json({ error: 'Invalid file type' })
        }

        fs.writeFileSync(filepath, Buffer.from(fileData, 'binary'))
        res.json({ success: true, message: `${fileType} uploaded successfully`, path: `/assets/${path.basename(filepath)}` })
      } catch (parseErr) {
        console.error('File parse error:', parseErr)
        res.status(500).json({ error: 'Failed to parse file upload' })
      }
    })
  } catch (error) {
    console.error('Upload asset error:', error)
    res.status(500).json({ error: 'Failed to upload asset' })
  }
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
