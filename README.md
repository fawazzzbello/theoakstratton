# Oakstratton - Modern BNPL Admin Platform

A full-stack Buy Now Pay Later (BNPL) platform featuring a stunning landing page and comprehensive admin dashboard for managing leads, email templates, analytics, and payment operations.

## 🌟 Features

### 🎨 Landing Page
- **Modern Design**: Klarna-inspired aesthetic with glassmorphism and 3D elements
- **Hero Slider**: Auto-rotating carousel with payment provider information
- **Feature Showcase**: 6 key features with animations
- **Pricing Tiers**: 3 flexible subscription plans
- **Social Proof**: Testimonials and statistics
- **Call-to-Action**: Prominent signup/demo buttons
- **Responsive**: Fully mobile-responsive design
- **Performance**: Optimized with Vite and code splitting

### 📊 Admin Dashboard

#### Dashboard
- Key metrics cards with trend indicators
- Revenue and conversion analytics charts
- Leads by source breakdown (pie chart)
- Recent leads table with status tracking

#### Leads Management
- Advanced filtering (source, status)
- Full-text search (name, email, company)
- Bulk selection and operations
- **CSV Export**: Export selected or all leads
- Status tracking (new, contacted, qualified, customer)
- Clean, responsive table layout

#### Email Templates
- WYSIWYG editor (ReactQuill)
- Template categories (welcome, confirmation, alerts)
- Variable insertion (name, email, company, phone, date, etc.)
- Template preview
- Template activation/deactivation
- Create, edit, delete operations

#### Waitlist Management
- Segmentation (All, Active, Dormant, Converted)
- Engagement score tracking
- Segment-based email campaigns
- Bulk selection for bulk operations
- Status badges and filtering

#### Email Tracking
- Delivery metrics (sent, delivered, opened, clicked)
- Performance timeline visualization
- Campaign performance comparison
- Bounce and unsubscribe rates
- Conversion tracking
- Detailed metrics by template

#### Advanced Analytics
- Revenue trends (monthly data)
- Conversion rate analysis
- CAC (Customer Acquisition Cost) tracking
- Conversion funnel visualization
- Cohort retention analysis
- Channel attribution reporting
- Custom report builder

#### Reporting & Intelligence
- 4 report types: Summary, Cohort, Channel, Custom
- Key metrics export (JSON format)
- Conversion funnel analysis
- Retention cohorts
- Channel performance breakdown
- Date range filtering

#### Settings
- **Notifications**: Configure email alerts and frequency
- **Exports**: Set up automated exports with custom schedules
- **API Configuration**: API key management, webhook settings
- **Retry Policies**: Aggressive/moderate/conservative options

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Password hashing (bcryptjs)
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers
- Input validation and HTML escaping
- Protected routes

### 📧 Email & Notifications
- SMTP configuration (Gmail, SendGrid, etc.)
- Email template system with variables
- Graceful SMTP degradation
- Toast notifications system
- 4 alert types (success, error, warning, info)
- Auto-dismiss with manual override

### 💳 Payment Integration (Ready)
- Stripe integration
- Payment transaction tracking
- Installment management

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool with HMR
- **Tailwind CSS** - Styling with Klarna color palette
- **Framer Motion** - Smooth animations
- **React Router v6** - Client-side routing
- **Recharts** - Data visualization
- **ReactQuill** - WYSIWYG editor
- **Axios** - HTTP client with interceptors
- **PapaParse** - CSV parsing and generation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email delivery
- **Stripe** - Payment processing
- **Helmet** - Security headers
- **Express Rate Limiting** - DDoS protection

### Deployment
- **Railway** - Hosting platform
- **PostgreSQL on Railway** - Managed database
- **Docker** - Containerization (via Railway)

## 📦 Project Structure

```
theoakstratton/
├── src/
│   ├── App.tsx                 # Main app router
│   ├── main.tsx                # React entry point
│   ├── components/
│   │   ├── landing/            # Landing page components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero3DSlider.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── ProvidersSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── Footer.tsx
│   │   ├── admin/
│   │   │   └── AdminLayout.tsx # Admin dashboard layout
│   │   └── common/
│   │       ├── ProtectedRoute.tsx
│   │       └── AlertNotifications.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── NotFound.tsx
│   │   └── Admin/
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── LeadsPage.tsx
│   │       ├── WaitlistPage.tsx
│   │       ├── TemplatesPage.tsx
│   │       ├── EmailTrackingPage.tsx
│   │       ├── AnalyticsPage.tsx
│   │       ├── ReportingPage.tsx
│   │       └── SettingsPage.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── AlertContext.tsx    # Global alerts
│   ├── services/
│   │   └── api.ts              # Axios instance with interceptors
│   └── styles/
│       └── globals.css         # Global styles and animations
├── server.js                   # Express server
├── database/
│   └── schema.sql              # PostgreSQL schema
├── public/
│   └── [static assets]
├── dist/                       # Built frontend (generated)
├── .env.example                # Environment variables template
├── .env.local                  # Local development config
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── Procfile                    # Railway process configuration
├── railway.json                # Railway deployment config
├── DEPLOYMENT.md               # Deployment guide
├── README.md                   # This file
└── package.json                # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd theoakstratton
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Create database**
```bash
createdb oakstratton_dev
psql oakstratton_dev < database/schema.sql
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📚 Usage

### Landing Page
- Visit the landing page to see the modern design
- Click "Login" in the navbar to access admin dashboard
- Default credentials:
  - Email: `admin@oakstratton.com`
  - Password: `AdminPassword123!`

### Admin Dashboard

**Dashboard**: Overview of key metrics and recent activity

**Leads**: Manage all leads with advanced filtering and CSV export
- Filter by source and status
- Search by name, email, or company
- Select and export leads
- View detailed lead information

**Waitlist**: Segment and manage waitlist subscribers
- View engagement scores
- Send emails to specific segments
- Track conversion status

**Templates**: Create and manage email templates
- WYSIWYG HTML editor
- Template variables ({name}, {email}, etc.)
- Multiple templates per category
- Preview before saving

**Email Tracking**: Monitor email delivery performance
- View sent, delivered, opened, and clicked metrics
- Track conversions and revenue impact
- Timeline visualization
- Campaign comparison

**Analytics**: Comprehensive business intelligence
- Monthly revenue trends
- Conversion rate analysis
- CAC tracking
- Conversion funnel breakdown

**Reporting**: Advanced reporting and data export
- Summary reports with key metrics
- Cohort retention analysis
- Channel attribution
- Custom report builder
- JSON export

**Settings**: Configure preferences and integrations
- Email notification preferences
- Automated export scheduling
- API key management
- Webhook configuration

## 🔑 Environment Variables

See [`.env.example`](./.env.example) for all available configuration options.

### Required for Production
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret (32+ chars)
- `JWT_REFRESH_SECRET`: Refresh token secret (32+ chars)
- `NODE_ENV`: Set to `production`

### Optional but Recommended
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`: Email configuration
- `STRIPE_SECRET_KEY`: Stripe API key for payments
- `CORS_ORIGIN`: Allowed domains (comma-separated)

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: Admin/manager accounts
- **email_templates**: Email template definitions
- **leads**: Waitlist and contact form submissions
- **email_events**: Email delivery tracking
- **analytics_events**: User behavior tracking
- **alerts**: System and custom alerts
- **transactions**: Payment records

See `database/schema.sql` for the complete schema.

## 🚢 Deployment

### Railway Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick start:
1. Connect GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Performance

- **Bundle Size**: ~1.2MB (gzip: ~167KB)
- **Time to Interactive**: <2s on 4G
- **Core Web Vitals**: Optimized
- **Lighthouse Score**: 85+

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing with bcryptjs
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers
- Input validation and HTML escaping
- Parameterized SQL queries (no injection)
- HTTPS in production

## 🐛 Troubleshooting

### Build Issues
See [DEPLOYMENT.md - Troubleshooting](./DEPLOYMENT.md#troubleshooting)

### Database Connection
```bash
# Test connection
psql $DATABASE_URL -c "SELECT NOW();"
```

### CORS Errors
Update `CORS_ORIGIN` environment variable to match your domain.

### Email Not Sending
1. Check SMTP configuration in `.env.local`
2. Enable "Less secure apps" for Gmail
3. Check server logs for errors

## 📖 Development

### Available Scripts

```bash
# Development
npm run dev                # Start dev server (frontend + backend)
npm run server:dev         # Start backend only
npm run client:dev         # Start frontend only

# Production
npm run build              # Build for production
npm run preview            # Preview production build
npm start                  # Start production server

# Tools
npm run lint               # Run ESLint
npm run type-check         # Check TypeScript types
```

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety

## 📄 License

ISC License - See LICENSE file

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Commit with descriptive messages
4. Push and create a pull request

## 📞 Support

For issues and questions:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review error messages in browser console and server logs
3. Check Railway Dashboard for service health
4. Contact support at support@oakstratton.com

## 🎉 Changelog

### v2.0.0 (Phase 4 Complete)
- ✅ Advanced features: Email tracking, reporting, settings
- ✅ Waitlist management with segmentation
- ✅ Railway deployment configuration
- ✅ Comprehensive deployment documentation
- ✅ AlertNotifications system
- ✅ Advanced analytics and reporting
- ✅ Custom report builder
- ✅ Automated exports

### v1.0.0
- ✅ Landing page with modern design
- ✅ Admin dashboard
- ✅ Lead management
- ✅ Email template system
- ✅ JWT authentication
- ✅ PostgreSQL database

---

**Built with ❤️ using React, TypeScript, and Express**

**Deployed on Railway** • **Last Updated**: May 2024
