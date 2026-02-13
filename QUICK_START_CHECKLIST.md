# 🚀 PLSFIX-THX Integration - Quick Start Checklist

**Goal:** Get extension + landing page working together in under 2 hours

---

## ⚡ Fast Track Setup

### Step 1: Get Stripe Keys (5 mins)
```bash
# Go to: https://dashboard.stripe.com/apikeys

# Copy these to .env.local:
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Step 2: Create Stripe Product (3 mins)
1. Go to: https://dashboard.stripe.com/products/create
2. Name: "PLSFIX-THX Lifetime Pro"
3. Price: $39 one-time
4. Copy Price ID (price_XXXX)
5. Paste into `/config.js` line 42

### Step 3: Setup Stripe Webhook (5 mins)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Listen for webhooks
stripe listen --forward-to localhost:3000/api/webhook/stripe

# Copy webhook signing secret to .env.local:
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 4: Verify Database (2 mins)
```sql
-- In Supabase SQL Editor
SELECT * FROM profiles LIMIT 1;

-- If table doesn't exist:
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  has_access BOOLEAN DEFAULT false,
  customer_id TEXT,
  price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 5: Update Extension URLs (2 mins)
**File:** `plsfix-chrome-extension/license-verifier.js` lines 6-8

```javascript
static SUPABASE_URL = 'https://dwttkdszexwnhwlwbaru.supabase.co';
static SUPABASE_KEY = 'YOUR_ANON_KEY_FROM_ENV_LOCAL';
```

**File:** `plsfix-chrome-extension/manifest.json` line 18

```json
"host_permissions": [
  "http://localhost:3000/*",
  "https://plsfixthx.com/*"
]
```

### Step 6: Test the Flow (10 mins)
```bash
# 1. Start landing page
cd pls-fix-landing
npm run dev

# 2. Load extension in Chrome
# - Go to chrome://extensions
# - Enable Developer mode
# - Load unpacked: plsfix-chrome-extension folder

# 3. Test checkout
# - Visit localhost:3000/#pricing
# - Click "Get Lifetime Pro"
# - Use test card: 4242 4242 4242 4242
# - Complete checkout

# 4. Verify in Supabase
# - Check profiles table
# - has_access should be true

# 5. Test in extension
# - Open extension popup
# - Take screenshot
# - Export (should have no watermark if Pro)
```

---

## ✅ Validation Checklist

After setup, verify these work:

### Landing Page
- [ ] `npm run dev` starts without errors
- [ ] Can sign in at `/signin`
- [ ] Checkout creates Stripe session
- [ ] Webhook logs show events
- [ ] Database updates after checkout

### Extension
- [ ] Loads without errors
- [ ] Can take screenshots
- [ ] Free tier: 5 export limit
- [ ] Free tier: watermark appears
- [ ] Pro tier: unlimited exports
- [ ] Pro tier: no watermark

### Integration
- [ ] `GET /api/extension/verify/{userId}` returns license
- [ ] `POST /api/extension/auth/callback` authenticates user
- [ ] Payment grants Pro access
- [ ] Extension reflects Pro status

---

## 🐛 Quick Fixes

### "Webhook signature verification failed"
```bash
# Make sure STRIPE_WEBHOOK_SECRET in .env.local matches
stripe listen --print-secret
```

### "Failed to verify license"
```javascript
// Check extension console for errors
// Verify Supabase URL and key are correct
```

### "Export limit not enforced"
```javascript
// In extension console:
const tracker = new UsageTracker();
await tracker.getUsageStats();
```

### "Watermark still showing for Pro"
```javascript
// In extension console:
const mgr = new SubscriptionManager();
const isPro = await mgr.isPro();
console.log('Is Pro:', isPro); // Should be true
```

---

## 📝 Development URLs

- Landing Page: http://localhost:3000
- Extension Popup: chrome-extension://[ID]/popup.html
- Extension Editor: chrome-extension://[ID]/editor.html
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://supabase.com/dashboard

---

## 🎯 Next Steps

After basic integration works:

1. **Add Sign-In Modal to Extension**
   - Create auth-modal.html
   - Add Google OAuth button
   - Add email/password form

2. **Add Pro Export Buttons**
   - PDF with grid layout
   - Interactive HTML export
   - Gate behind isPro() check

3. **Polish User Experience**
   - Loading states
   - Error messages
   - Success notifications

4. **Deploy to Production**
   - Deploy landing page
   - Update extension URLs
   - Submit to Chrome Web Store

---

## 📞 Emergency Contact

If completely stuck:
1. Check browser console for errors
2. Check Supabase logs
3. Check Stripe webhook logs
4. Verify all environment variables are set

**Most common issue:** Forgot to restart `npm run dev` after updating .env.local

---

**Estimated setup time:** 30-45 minutes
**Estimated testing time:** 15-30 minutes
**Total:** ~1 hour to working integration
