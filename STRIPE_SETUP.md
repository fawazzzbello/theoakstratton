# Stripe Payment Gateway Setup Guide

Complete guide to set up Stripe payment processing with BNPL options.

## Overview

This integration supports:
- **Klarna** - 3-4 monthly instalments
- **Clearpay/Afterpay** - 4 fortnightly payments
- **PayPal Pay Later** - 4 instalments
- **Card Payments** - Direct Visa/Mastercard/Amex

## Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click "Sign up" (or "Start now")
3. Enter your email and password
4. Complete account setup with business details

## Step 2: Get API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API Keys**
3. Make sure you're in test mode first (toggle in top-left)
4. Copy your keys:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

## Step 3: Enable Payment Methods

### For BNPL Methods:

1. Go to **Settings** → **Payment Methods**
2. Enable each provider:
   - ✅ Klarna
   - ✅ Clearpay
   - ✅ PayPal
3. Fill in merchant details for each (usually auto-filled)

### For Cards:
Cards are enabled by default.

## Step 4: Set Up Webhooks

Webhooks notify your server when payments succeed/fail.

### Create Webhook Endpoint:

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing Secret** (`whsec_...`)

## Step 5: Configure Environment Variables

Update your `.env` file:

```env
# Stripe Keys (test mode first)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**For Railway.com:**
1. Go to your project settings
2. Click **Variables**
3. Add the three variables above
4. Restart your deployment

## Step 6: Update Frontend Key

In `public/payment.js`, replace:
```javascript
const stripe = Stripe('REPLACE_WITH_STRIPE_PUBLISHABLE_KEY');
```

With your actual publishable key:
```javascript
const stripe = Stripe('pk_test_abc123...');
```

## Step 7: Test Payment Flow

1. Visit your landing page
2. Go to "Try Our Payment Integration" section
3. Test with Stripe test cards:

### Test Cards:

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
```

**Failed Payment:**
```
Card: 4000 0000 0000 0002
Exp: 12/34
CVC: 123
```

## Step 8: Go Live

### Switch to Production:

1. In Stripe Dashboard, toggle **Live Mode** (top-left)
2. Get live API keys:
   - **Publishable Key**: `pk_live_...`
   - **Secret Key**: `sk_live_...`

3. Update environment variables:
   ```env
   STRIPE_SECRET_KEY=sk_live_your_live_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   ```

4. Update webhook endpoint for live:
   - Go to **Webhooks** → Create new endpoint
   - URL: `https://yourdomain.com/api/stripe-webhook`
   - Add events and get live signing secret

5. Update `public/payment.js` with live publishable key

## Security Best Practices

✅ **What We've Done:**
- Never send Secret Key to frontend (kept on server)
- Use Stripe Elements for card handling (no sensitive data stored)
- Validate all payments server-side
- Use webhook signatures to verify Stripe events
- Rate limit payment endpoints
- Sanitize all inputs

✅ **Additional Security:**
- Enable 3D Secure for card payments (Settings → 3D Secure)
- Implement address verification (AVS)
- Monitor for fraud (Settings → Radar)
- Enable email receipts (Settings → Emails)

## API Endpoints

### Create Payment Intent
```bash
POST /api/payment-intent
Content-Type: application/json

{
  "amount": 5000,        # in pence (£50)
  "email": "customer@example.com",
  "name": "Customer Name",
  "paymentMethod": "card|klarna|afterpay_clearpay|paypal",
  "bnplProvider": "klarna|clearpay|paypal|none"
}

Response:
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

### Get Payment Methods
```bash
GET /api/payment-methods

Response:
[
  {
    "id": "klarna",
    "name": "Klarna",
    "description": "3-4 monthly payments",
    "fee": "2.49% + 30p",
    "minAmount": 5000
  },
  ...
]
```

### Get Transactions
```bash
GET /api/transactions?api_key=YOUR_API_KEY

Response: Array of transaction objects
```

## Troubleshooting

### Payment Fails Silently
- Check that webhook is configured correctly
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check server logs for errors

### BNPL Methods Not Showing
- Ensure payment methods are enabled in Stripe dashboard
- Check your Stripe account is verified
- Some methods require minimum transaction amounts

### "Invalid API Key" Error
- Verify STRIPE_SECRET_KEY starts with `sk_test_` or `sk_live_`
- Make sure you're not using publishable key as secret
- Restart your server after changing keys

### Webhooks Not Firing
- Verify webhook endpoint URL is accessible
- Check webhook signing secret matches
- Ensure server logs show webhook receives

## Testing BNPL Methods

### Klarna Test Mode:
- You'll see Klarna installment options
- No real charge is made
- Test flow completes immediately

### Clearpay Test Mode:
- Requires Australian address (test)
- Use postal code: 2000
- Test payments complete instantly

### PayPal Test Mode:
- Redirects to PayPal sandbox
- Use test PayPal account
- Credentials available in Stripe dashboard

## Monitoring

### View Transactions:
1. Stripe Dashboard → **Payments** → **Payments**
2. Click any payment to see details
3. View customer info, amount, method, status

### View Webhooks:
1. Stripe Dashboard → **Developers** → **Webhooks**
2. Click endpoint
3. See event history and delivery status

## Support

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- Test mode doesn't count against processing limits
- Live mode is PCI-DSS compliant

## Cost

- **Card Payments**: 1.4% + 20p (UK)
- **Klarna**: 2.49% + 30p
- **Clearpay**: 4-6%
- **PayPal**: ~2.9%
- **Webhook/API**: Free
