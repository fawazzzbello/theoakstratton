# Fasthosts Livemail SMTP Setup Guide

Complete guide to configure Fasthosts SMTP with your BNPL landing page.

## Fasthosts SMTP Settings

### Connection Details

**Host:** `mail.fasthosts.com`

**Port Options:**
- `587` (Recommended - TLS)
- `465` (SSL/TLS)

**Authentication:**
- Username: Your full Fasthosts email address
- Password: Your email password

## Railway Configuration

### Step 1: Get Your Fasthosts Email Details
1. Log in to [Fasthosts Control Panel](https://www.fasthosts.co.uk/cp)
2. Find your email account
3. Note your **full email address** and **password**

### Step 2: Add to Railway Variables

Go to your Railway project → **Variables** → Add:

**Option A: Port 587 (TLS - Recommended)**
```
SMTP_HOST=mail.fasthosts.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
ADMIN_EMAIL=fawaz@belloite.com
```

**Option B: Port 465 (SSL)**
```
SMTP_HOST=mail.fasthosts.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
ADMIN_EMAIL=fawaz@belloite.com
```

### Step 3: Restart Railway

After adding variables:
1. Go to your Railway deployment
2. Click the 3-dot menu → **Redeploy**
3. Wait for it to restart (~1 minute)

## Testing Your Configuration

### Test from Command Line

You can test if SMTP is working by:
1. Filling out the contact form on your landing page
2. Checking if you receive the confirmation email
3. Checking Railroad logs for any errors

### Common Issues

**Error: "Invalid login credentials"**
- Double-check username (should be full email address)
- Verify password is correct
- Make sure it's not an app password (use regular email password)

**Error: "Connection timeout"**
- Try port 465 with `SMTP_SECURE=true`
- Check your firewall isn't blocking SMTP
- Verify host is `mail.fasthosts.com`

**Email not sending but no error**
- Check `ADMIN_EMAIL` is correct
- Verify email address is using correct domain
- Check Fasthosts email account is active

## Fasthosts Alternative Hosts

If `mail.fasthosts.com` doesn't work, try:
- `smtp.fasthosts.com`
- `pop.fasthosts.com` (less common)

Contact Fasthosts support for alternative SMTP relay hosts if needed.

## Email Limits

Fasthosts Livemail typically allows:
- **Sending rate:** Unlimited (depends on plan)
- **Daily limit:** Depends on hosting plan
- **Relay:** May require whitelist for high volume

For high-volume email campaigns, contact Fasthosts to upgrade limits.

## Local Testing

To test locally before deploying to Railway:

1. Create `.env` file:
```
SMTP_HOST=mail.fasthosts.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
ADMIN_EMAIL=fawaz@belloite.com
```

2. Run locally:
```bash
npm install
npm start
```

3. Test contact form at `http://localhost:3000`

## Troubleshooting Checklist

- [ ] Email address is full Fasthosts email (name@domain.com)
- [ ] Password is correct (not app password)
- [ ] SMTP_HOST is `mail.fasthosts.com`
- [ ] PORT is 587 or 465
- [ ] SECURE matches port (false for 587, true for 465)
- [ ] ADMIN_EMAIL is valid
- [ ] Railway variables are set correctly
- [ ] Railway deployment restarted after changes
- [ ] Fasthosts email account is active
- [ ] Fasthosts mailbox not full

## Support

- Fasthosts Email Support: https://www.fasthosts.co.uk/support
- Check Fasthosts Control Panel for email logs
- Monitor Railway logs for SMTP errors

## Alternative: Use Gmail Instead

If you have trouble with Fasthosts, you can use Gmail SMTP instead:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
```

[Get Gmail App Password](https://support.google.com/accounts/answer/185833)
