# PLSFIX-THX Landing Page + Chrome Extension Integration Plan

## 🎯 Goal
Connect the Chrome extension with the landing page to enable:
- User signup/signin from extension
- Payment processing via Stripe
- Automatic Pro feature unlock after payment
- Free tier limits (5 exports/day, watermarks)

---

## 📋 Current Status

### ✅ Already Implemented
- Landing page has Supabase auth (Google OAuth, Magic Link)
- Landing page has Stripe integration (checkout, webhooks)
- Landing page has `/api/extension/verify/[userId]` endpoint
- Landing page has `/api/extension/auth/callback` endpoint
- Extension has authentication framework (subscription-manager.js)
- Extension has usage tracking (5 exports/day limit)
- Extension has watermark system for free users
- Extension has Pro feature gating logic

### ❌ Missing/Needs Work
- Extension using placeholder Supabase URLs
- Extension not calling actual API endpoints
- No sign-in UI in extension
- Stripe products/prices not created
- Extension URLs hardcoded to localhost
- No OAuth redirect handling in extension
- Pro export UI buttons not visible

---

## 🔧 Phase 1: Environment & Configuration Setup

### Task 1.1: Update Chrome Extension Config URLs
**File:** `/Users/michaelarthur/Desktop/plsfix-chrome-extension/subscription-manager.js`

**Current (lines 19, 44-45):**
```javascript
const isDev = location.protocol === 'chrome-extension:' &&
              (location.hostname === 'localhost' || location.port === '3000');
const baseUrl = isDev ? 'http://localhost:3000' : 'https://plsfixthx.com';
```

**Action:** Update production URL when ready to deploy
- Dev: Keep `http://localhost:3000`
- Production: `https://plsfixthx.com` or your actual domain

### Task 1.2: Add Environment Variables
**File:** `/Users/michaelarthur/Desktop/pls-fix-landing/.env.local`

**Required variables:**
```bash
# Already have these
NEXT_PUBLIC_SUPABASE_URL=https://dwttkdszexwnhwlwbaru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>

# Need to add Stripe (currently empty)
STRIPE_PUBLIC_KEY=pk_test_... # or pk_live_...
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
RESEND_API_KEY=<your-resend-key>
```

**How to get Stripe keys:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy publishable key → `STRIPE_PUBLIC_KEY`
3. Copy secret key → `STRIPE_SECRET_KEY`
4. Go to Webhooks → Add endpoint → Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 🗄️ Phase 2: Database Schema Setup

### Task 2.1: Verify Supabase Profiles Table
**Location:** Supabase Dashboard → SQL Editor

**Expected schema:**
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  has_access BOOLEAN DEFAULT false,
  customer_id TEXT,
  price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Verify with:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles';
```

### Task 2.2: Set Up Row Level Security (RLS)
**Location:** Supabase Dashboard → Authentication → Policies

**Required policies:**
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

**Test with:**
```sql
-- Should return your profile when logged in
SELECT * FROM public.profiles WHERE id = auth.uid();
```

---

## 🌐 Phase 3: Landing Page API Verification

### Task 3.1: Test Extension Verify Endpoint
**Endpoint:** `GET /api/extension/verify/[userId]`
**File:** `/Users/michaelarthur/Desktop/pls-fix-landing/app/api/extension/verify/[userId]/route.js`

**Test in browser:**
```javascript
// In browser console on localhost:3000
const userId = 'your-user-id-from-supabase';
const res = await fetch(`http://localhost:3000/api/extension/verify/${userId}`);
const data = await res.json();
console.log(data);
// Expected: { success: true, userId, email, hasAccess, customerId, priceId, timestamp }
```

**If it fails:**
- Check Supabase connection in `/libs/supabase/server.js`
- Verify user exists in profiles table
- Check console for errors

### Task 3.2: Test Extension Auth Callback
**Endpoint:** `POST /api/extension/auth/callback`
**File:** `/Users/michaelarthur/Desktop/pls-fix-landing/app/api/extension/auth/callback/route.js`

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/extension/auth/callback \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "action": "signin"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "hasAccess": false
  },
  "token": "jwt-token"
}
```

### Task 3.3: Test Stripe Webhook
**Endpoint:** `POST /api/webhook/stripe`
**File:** `/Users/michaelarthur/Desktop/pls-fix-landing/app/api/webhook/stripe/route.js`

**Setup Stripe CLI for local testing:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook/stripe

# This will output a webhook signing secret
# Copy it to .env.local as STRIPE_WEBHOOK_SECRET
```

**Test checkout event:**
```bash
stripe trigger checkout.session.completed
```

**Verify in Supabase:**
```sql
-- Check if has_access was updated
SELECT email, has_access, customer_id FROM profiles;
```

---

## 🔌 Phase 4: Chrome Extension Updates

### Task 4.1: Update Manifest Host Permissions
**File:** `/Users/michaelarthur/Desktop/plsfix-chrome-extension/manifest.json`

**Add to host_permissions (around line 18):**
```json
"host_permissions": [
  "http://localhost:3000/*",
  "https://plsfixthx.com/*",
  "https://*.supabase.co/*"
],
```

### Task 4.2: Replace Placeholder URLs
**File:** `/Users/michaelarthur/Desktop/plsfix-chrome-extension/license-verifier.js`

**Replace lines 6-8:**
```javascript
// OLD (placeholder)
static SUPABASE_URL = 'https://your-project.supabase.co';
static SUPABASE_KEY = 'your_supabase_anon_key';

// NEW (actual values)
static SUPABASE_URL = 'https://dwttkdszexwnhwlwbaru.supabase.co';
static SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // From landing page .env.local
```

### Task 4.3: Add Sign-In Modal UI
**File:** Create `/Users/michaelarthur/Desktop/plsfix-chrome-extension/auth-modal.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Sign In - PLSFIX-THX</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      padding: 10px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #4f46e5;
    }
    .divider {
      text-align: center;
      margin: 20px 0;
      color: #666;
    }
  </style>
</head>
<body>
  <h2>Sign In to PLSFIX-THX</h2>

  <button id="googleSignIn" class="google-btn">
    Sign in with Google
  </button>

  <div class="divider">OR</div>

  <form class="auth-form" id="emailForm">
    <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="password" placeholder="Password" required>
    <button type="submit">Sign In</button>
  </form>

  <script src="auth-modal.js"></script>
</body>
</html>
```

**File:** Create `/Users/michaelarthur/Desktop/plsfix-chrome-extension/auth-modal.js`

```javascript
const subscriptionManager = new SubscriptionManager();

// Google OAuth sign-in
document.getElementById('googleSignIn').addEventListener('click', async () => {
  await subscriptionManager.initiateOAuth('google');
});

// Email/password sign-in
document.getElementById('emailForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const result = await subscriptionManager.signInWithCredentials(email, password);
    if (result.success) {
      window.close(); // Close modal
    } else {
      alert('Sign in failed: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
```

### Task 4.4: Implement OAuth Redirect Handling
**File:** `/Users/michaelarthur/Desktop/plsfix-chrome-extension/background.js`

**Add OAuth listener:**
```javascript
// Listen for OAuth callback
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'OAUTH_CALLBACK') {
    const { userId, email, token, hasAccess } = request.data;

    // Save auth data
    chrome.storage.local.set({
      userAuth: {
        userId,
        email,
        token,
        timestamp: Date.now()
      },
      subscriptionStatus: hasAccess ? 'active' : 'free'
    });

    sendResponse({ success: true });
  }
});
```

### Task 4.5: Add Pro Export UI Buttons
**File:** `/Users/michaelarthur/Desktop/plsfix-chrome-extension/editor.html`

**Find the export dropdown (around line 150) and add:**
```html
<!-- Existing PNG/CSV options -->

<!-- Add Pro options -->
<button class="dropdown-item pro-feature" id="exportPDFProBtn" title="Pro Feature">
  📄 Export to PDF (Grid Layout) ⭐
</button>
<button class="dropdown-item pro-feature" id="exportHTMLBtn" title="Pro Feature">
  🌐 Export Interactive HTML ⭐
</button>
```

**File:** `/Users/michaelarthur/Desktop/plsfix-chrome-extension/editor-ui.js`

**Add button handlers:**
```javascript
// In initializeEventListeners()
document.getElementById('exportPDFProBtn')?.addEventListener('click', async () => {
  const isPro = await subscriptionManager.isPro();
  if (!isPro) {
    showUpgradeModal();
    return;
  }
  await exportToPDFPro();
});

document.getElementById('exportHTMLBtn')?.addEventListener('click', async () => {
  const isPro = await subscriptionManager.isPro();
  if (!isPro) {
    showUpgradeModal();
    return;
  }
  await exportToInteractiveHTML();
});
```

---

## 💳 Phase 5: Payment Integration

### Task 5.1: Create Stripe Product
**Location:** https://dashboard.stripe.com/products

**Steps:**
1. Click "Add product"
2. Name: "PLSFIX-THX Lifetime Pro"
3. Description: "Unlimited screenshots, no watermarks, all export formats"
4. Pricing:
   - One-time payment
   - Price: $39.00 USD
5. Click "Save product"
6. Copy the Price ID (starts with `price_`)

### Task 5.2: Update Config with Stripe Price IDs
**File:** `/Users/michaelarthur/Desktop/pls-fix-landing/config.js`

**Update line 41:**
```javascript
priceId:
  process.env.NODE_ENV === "development"
    ? "price_1Niyy5AxyNprDp7iZIqEyD2h"  // Test mode price ID
    : "price_XXXXXXXXXXXX",  // ← Replace with your live mode price ID
```

### Task 5.3: Configure Stripe Webhook
**Location:** https://dashboard.stripe.com/webhooks

**Steps:**
1. Click "Add endpoint"
2. Endpoint URL: `https://your-domain.com/api/webhook/stripe`
   - For testing: Use Stripe CLI (see Phase 3, Task 3.3)
   - For production: Use actual domain
3. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy "Signing secret" → Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Task 5.4: Test Checkout Flow
**Test steps:**
1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/#pricing
3. Click "Get Lifetime Pro"
4. Sign in with Google or email
5. Fill out Stripe test card: `4242 4242 4242 4242`
6. Complete checkout
7. Verify in Supabase:
   ```sql
   SELECT email, has_access, customer_id FROM profiles WHERE email = 'your-test-email@example.com';
   ```
   Should show `has_access = true`

---

## 🔐 Phase 6: Authentication Flow Integration

### Task 6.1: Add Extension Auth Redirect
**File:** `/Users/michaelarthur/Desktop/pls-fix-landing/app/signin/page.js`

**Add extension detection:**
```javascript
// Check if coming from extension
const searchParams = useSearchParams();
const source = searchParams.get('source');
const isExtension = source === 'extension';

// After successful auth, redirect back to extension
if (isExtension) {
  // Get user data from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_access')
    .eq('id', user.id)
    .single();

  // Redirect to extension callback
  window.location.href = `chrome-extension://YOUR-EXTENSION-ID/auth-callback.html?` +
    `userId=${user.id}&email=${user.email}&hasAccess=${profile.has_access}&token=${user.session.access_token}`;
}
```

### Task 6.2: Create Extension Auth Callback Page
**File:** Create `/Users/michaelarthur/Desktop/plsfix-chrome-extension/auth-callback.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Authentication Success</title>
</head>
<body>
  <h2>Signing you in...</h2>
  <script>
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const email = params.get('email');
    const hasAccess = params.get('hasAccess') === 'true';
    const token = params.get('token');

    // Send to background script
    chrome.runtime.sendMessage({
      type: 'OAUTH_CALLBACK',
      data: { userId, email, token, hasAccess }
    }, (response) => {
      if (response.success) {
        window.close();
      }
    });
  </script>
</body>
</html>
```

### Task 6.3: Test OAuth Flow
**Steps:**
1. Load extension in Chrome
2. Open extension popup
3. Click "Sign In"
4. Click "Sign in with Google"
5. Complete OAuth on landing page
6. Verify redirect back to extension
7. Check chrome.storage:
   ```javascript
   chrome.storage.local.get(['userAuth', 'subscriptionStatus'], (data) => {
     console.log(data);
   });
   ```

### Task 6.4: Test Email/Password Flow
**Steps:**
1. Open auth modal in extension
2. Enter email and password
3. Click "Sign In"
4. Verify API call to `/api/extension/auth/callback`
5. Verify storage updated with user data

---

## 🎮 Phase 7: Feature Access Control

### Task 7.1: Test Free Tier Limits
**Test scenario:**
1. Create new account (free user)
2. Export 5 screenshots from extension
3. Try to export 6th screenshot
4. Verify:
   - Upgrade modal appears
   - Export is blocked
   - Counter resets next day

**Verify in code:**
```javascript
// In extension console
const tracker = new UsageTracker();
const stats = await tracker.getUsageStats();
console.log(stats); // Should show 5/5 exports used
```

### Task 7.2: Test Watermark Application
**Test scenario:**
1. As free user, export PNG
2. Open exported image
3. Verify watermark at bottom: "Made with PLSFIX-THX Free • Upgrade at plsfixthx.com"

**Verify in code:**
```javascript
// In watermark-engine.js
const isPro = await subscriptionManager.isPro();
console.log('Should apply watermark:', !isPro);
```

### Task 7.3: Test Pro Feature Unlock
**Test scenario:**
1. Sign in as free user
2. Verify PDF/HTML export buttons are hidden/disabled
3. Complete payment for Lifetime Pro
4. Refresh extension
5. Verify:
   - PDF/HTML export buttons now enabled
   - No watermark on exports
   - No daily limit
   - Popup shows "✨ Pro: Unlimited screenshots"

### Task 7.4: Test Subscription Cancellation
**Test scenario (if using subscriptions):**
1. Cancel subscription in Stripe
2. Wait for webhook to fire
3. Verify in Supabase: `has_access = false`
4. Refresh extension
5. Verify free tier limits apply again

---

## 🧪 Phase 8: Testing & Polish

### Task 8.1: Complete User Journey Test
**Flow:**
```
1. Install extension
2. Take screenshot
3. Click "Export" → See free tier limit
4. Click "Upgrade" → Redirects to landing page
5. Click "Get Lifetime Pro"
6. Sign up with Google
7. Complete payment ($39)
8. Redirected back to extension (or refresh)
9. Verify Pro status
10. Export without watermark
11. Export PDF with grid layout
12. Export interactive HTML
```

### Task 8.2: Test License Caching
**Test scenario:**
1. Sign in as Pro user
2. Verify license API call
3. Use extension (should use cache, no API calls)
4. Wait 24 hours or clear cache
5. Verify new API call to verify license

**Check cache:**
```javascript
chrome.storage.local.get('licenseVerification', (data) => {
  console.log('Cached until:', new Date(data.licenseVerification?.expiresAt));
});
```

### Task 8.3: Test Offline Mode
**Test scenario:**
1. Sign in as Pro user (cache license)
2. Disconnect internet
3. Verify extension still works
4. Verify Pro features accessible
5. Try to verify license → Should use cache

### Task 8.4: Add Error Messaging
**Files to update:**
- `subscription-manager.js` - Add user-friendly error messages
- `editor-ui.js` - Show toast notifications for errors
- `popup.js` - Handle API timeouts gracefully

**Example:**
```javascript
try {
  await verifyLicense();
} catch (error) {
  showToast('Unable to verify license. Using cached status.', 'warning');
  console.error('License verification failed:', error);
}
```

### Task 8.5: Test Webhook Retry Logic
**Test scenario:**
1. Use Stripe CLI to trigger events
2. Make webhook endpoint temporarily fail (500 error)
3. Verify Stripe retries webhook
4. Fix endpoint
5. Verify webhook eventually succeeds

---

## 🚀 Phase 9: Production Deployment

### Task 9.1: Deploy Landing Page
**Platform:** Vercel/Netlify/Your choice

**Steps for Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - STRIPE_PUBLIC_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - RESEND_API_KEY
```

**Post-deployment:**
1. Update Stripe webhook URL to production domain
2. Test checkout flow on production
3. Verify webhook events received

### Task 9.2: Update Extension to Production URLs
**File:** `/Users/michaelarthur/Desktop/plsfix-chrome-extension/subscription-manager.js`

**Update baseUrl detection (lines 44-45):**
```javascript
const baseUrl = 'https://plsfixthx.com'; // Production URL
```

**Or use dynamic detection:**
```javascript
const isDev = false; // Set to false for production build
const baseUrl = isDev ? 'http://localhost:3000' : 'https://plsfixthx.com';
```

### Task 9.3: Submit Extension to Chrome Web Store
**Preparation:**
1. Update version in `manifest.json`
2. Create screenshots for store listing
3. Write store description focusing on AI workflow
4. Create 1280x800 promo tile
5. Prepare privacy policy

**Submission:**
1. Go to https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload extension ZIP
4. Fill out listing details
5. Set pricing: Free (with in-app purchases)
6. Submit for review

**After approval:**
1. Update extension ID in landing page redirect URLs
2. Test OAuth flow with published extension
3. Monitor user feedback

### Task 9.4: Monitor First Users
**Setup monitoring:**
1. Supabase Dashboard → Database → Real-time
2. Watch profiles table for new signups
3. Check Stripe Dashboard for payments
4. Monitor webhook logs

**Track metrics:**
- New signups per day
- Free → Pro conversion rate
- Failed payment attempts
- API error rates
- Extension install → signup rate

---

## ✅ Completion Checklist

### Must Have (Critical)
- [ ] Stripe environment variables set
- [ ] Extension uses production API URLs
- [ ] `/api/extension/verify` endpoint works
- [ ] `/api/extension/auth/callback` endpoint works
- [ ] Stripe webhook updates `has_access`
- [ ] Free tier limits enforced (5/day)
- [ ] Watermark applied to free exports
- [ ] Pro features unlock after payment
- [ ] OAuth flow redirects correctly

### Should Have (Important)
- [ ] Sign-in modal in extension popup
- [ ] Error messages for API failures
- [ ] License verification caching
- [ ] Offline mode with cached license
- [ ] Pro export buttons visible
- [ ] Subscription cancellation works
- [ ] Email notifications on purchase

### Nice to Have (Polish)
- [ ] Loading states in UI
- [ ] Onboarding flow for new users
- [ ] Usage analytics tracking
- [ ] A/B testing for pricing
- [ ] Referral program
- [ ] Customer testimonials

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to verify license"
**Solutions:**
- Check Supabase URL and key in extension
- Verify user exists in profiles table
- Check network tab for 403/404 errors
- Ensure host_permissions includes API domain

### Issue: "Stripe webhook not firing"
**Solutions:**
- Verify webhook URL is correct
- Check webhook signing secret matches .env
- Use Stripe CLI for local testing
- Check Stripe Dashboard → Webhooks → Logs

### Issue: "OAuth redirect doesn't work"
**Solutions:**
- Ensure extension ID matches in redirect URL
- Check chrome://extensions for extension ID
- Verify auth-callback.html exists in extension
- Check popup blocker isn't blocking redirect

### Issue: "Pro features not unlocking"
**Solutions:**
- Check `has_access` in Supabase profiles table
- Clear extension cache and re-verify license
- Check webhook successfully updated database
- Verify API returns `hasAccess: true`

---

## 📞 Support

If you get stuck:
1. Check browser console for errors
2. Check Supabase logs
3. Check Stripe webhook logs
4. Verify environment variables are set
5. Test with Stripe test cards first

---

**Last Updated:** 2026-01-02
**Status:** Ready for implementation
**Estimated Time:** 2-3 days for complete integration
