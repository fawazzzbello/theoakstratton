# BNPL Landing Page

A modern, responsive landing page to sell Buy Now Pay Later (BNPL) integration services to small businesses. Includes contact forms, waitlist signup, and SMTP email integration for lead capture.

## Features

✨ **Modern Design**
- Beautiful, responsive landing page
- Mobile-first design
- Smooth scrolling navigation

📧 **Lead Capture**
- Contact form for consultations
- Waitlist signup form
- SMTP email notifications

💾 **Lead Management**
- SQLite database for storing leads
- Auto-confirmation emails
- Admin notifications for new leads

🔗 **Social Integration**
- Easy-to-update social media links
- Professional call-to-action buttons

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your details:

```bash
cp .env.example .env
```

Edit `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=fawaz@belloite.com
PORT=3000
```

### 3. Gmail Setup (if using Gmail SMTP)

1. Enable 2-factor authentication on your Gmail account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use that password in `.env` as `SMTP_PASS`

### 4. Update Social Links

Edit `public/index.html` and update the social links in the contact section:

```html
<a href="https://linkedin.com/in/yourprofile" target="_blank">LinkedIn</a>
<a href="https://twitter.com/yourhandle" target="_blank">Twitter</a>
<a href="https://instagram.com/yourhandle" target="_blank">Instagram</a>
```

## Running Locally

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Visit `http://localhost:3000` in your browser.

## API Endpoints

### POST `/api/contact`
Submit a contact form inquiry.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "phone": "0123456789",
  "message": "I'm interested in BNPL solutions"
}
```

### POST `/api/waitlist`
Join the waitlist.

**Body:**
```json
{
  "email": "john@example.com",
  "company": "Acme Corp",
  "name": "John Doe"
}
```

### GET `/api/leads`
Retrieve all leads from the database (add authentication in production).

## Customization

### Colors
Edit CSS variables in `public/styles.css`:
```css
:root {
    --primary: #2563eb;      /* Main brand color */
    --primary-dark: #1e40af;
    --secondary: #10b981;    /* Accent color */
    --dark: #1f2937;
    --light: #f9fafb;
}
```

### Content
All text can be edited directly in `public/index.html`:
- Hero section headline
- Pricing packages
- Provider information
- Testimonials
- Call-to-action buttons

### Email Templates
Customize email templates in `server.js`:
- Contact confirmation email
- Waitlist welcome email
- Admin notification email

## Deployment

### Railway.com (Recommended ⭐)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect to your `theoakstratton` repository
   - Railway auto-detects Node.js and deploys

3. **Set Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these variables:
     ```
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     ADMIN_EMAIL=fawaz@belloite.com
     NODE_ENV=production
     ```

4. **Get Your Domain**
   - Railway auto-generates a domain (e.g., `yourapp.railway.app`)
   - Or connect your custom domain in Railway settings
   - Your app is live! 🚀

**Pro Tip:** Railway redeploys automatically when you push to `main` or your deployment branch.

### Heroku
```bash
heroku create your-app-name
heroku config:set SMTP_USER=your-email SMTP_PASS=your-password
git push heroku main
```

### Netlify (Frontend Only)
If you want to deploy just the static frontend and use a serverless function for forms, you can use the `public/` directory.

### Docker
Create a `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

## Database

The app uses SQLite with an in-memory database by default. To persist data, modify `server.js`:

```javascript
// Change from:
const db = new sqlite3.Database(':memory:');

// To:
const db = new sqlite3.Database('./leads.db');
```

## Security Features ✅

All production security best practices are implemented:

### 1. **Rate Limiting**
- Forms: 5 requests per 15 minutes per IP
- API: 100 requests per hour per IP
- Prevents spam and brute force attacks

### 2. **Input Validation & Sanitization**
- All inputs validated with `validator.js`
- HTML special characters escaped before storing/sending
- Max length limits enforced (name: 100, email: 254, message: 5000)
- Invalid emails rejected

### 3. **API Authentication**
- `/api/leads` endpoint requires `API_KEY` header
- Pass API key via: `X-API-Key: your-key` or `?api_key=your-key`
- Set `API_KEY` in environment variables

### 4. **reCAPTCHA v3 (Optional)**
- Integrated reCAPTCHA support to prevent bot spam
- Non-intrusive (no user interaction required)
- Get keys: https://www.google.com/recaptcha/admin
- Configure in `.env`: `RECAPTCHA_SECRET_KEY` & `RECAPTCHA_SITE_KEY`

### 5. **Security Headers**
- Helmet.js for HTTP security headers
- CORS properly configured
- Content Security Policy enabled
- X-Frame-Options, X-Content-Type-Options, etc.

### 6. **Database**
- Parameterized queries (prevent SQL injection)
- UNIQUE constraint on emails
- No sensitive data in logs

### 7. **HTTPS**
- Railway automatically provides free HTTPS
- All traffic encrypted end-to-end

### 8. **Environment Variables**
- All secrets stored in `.env` file
- Never committed to git (`.gitignore` configured)
- API keys, SMTP password protected

### Configuration Checklist

```env
# Required for security
API_KEY=generate-a-random-strong-key
NODE_ENV=production

# Optional but recommended
RECAPTCHA_SECRET_KEY=your-key-from-google
RECAPTCHA_SITE_KEY=your-site-key-from-google
CORS_ORIGIN=https://yourdomain.com
```

### Getting Leads Securely

```bash
curl -H "X-API-Key: YOUR_API_KEY" https://yourdomain.com/api/leads
```

Or with query parameter:
```bash
curl https://yourdomain.com/api/leads?api_key=YOUR_API_KEY
```

## Support

For questions or issues, contact: fawaz@belloite.com

## License

MIT
