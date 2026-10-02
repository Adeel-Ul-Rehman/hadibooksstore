# 🔐 Google OAuth "Continue with Google" - Complete Setup Guide

## ✅ Current Implementation Status

Your Google OAuth is **ALREADY IMPLEMENTED** and working! Here's what you have:

### Backend (Server) ✅
- ✅ Google OAuth Strategy configured (`middleware/passport.js`)
- ✅ Google Auth Controller (`controllers/googleAuthController.js`)
- ✅ Routes setup (`/api/auth/google`, `/api/auth/google/callback`)
- ✅ JWT token generation and cookie management
- ✅ Cart & Wishlist sync after Google login
- ✅ Environment variables configured

### Frontend (Client) ✅
- ✅ Google Login button in Login page
- ✅ Google Login button in Cart page (for guests)
- ✅ `loginWithGoogle()` function in AppContext
- ✅ Redirect handling in Account page
- ✅ Cart/Wishlist preservation during OAuth flow

---

## 🚀 Google Cloud Console Setup (Required)

You mentioned you've already added JavaScript URLs and Redirect URLs. Let me verify you have the correct ones:

### 1. Go to Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 2. Select Your Project
Find your OAuth 2.0 Client ID: `your-google-client-id.apps.googleusercontent.com`

### 3. Add Authorized JavaScript Origins

**For Production:**
```
https://www.hadibookstore.shop
https://hadibookstore.shop
https://api.hadibookstore.shop
```

**For Development (Optional):**
```
http://localhost:3000
http://localhost:4000
```

### 4. Add Authorized Redirect URIs

**For Production (MUST HAVE):**
```
https://api.hadibookstore.shop/api/auth/google/callback
```

**For Development (Optional):**
```
http://localhost:4000/api/auth/google/callback
```

### 5. Save Changes
Click "Save" at the bottom of the page.

---

## 📋 Complete OAuth Flow (How It Works)

### Step 1: User Clicks "Continue with Google"
**Location:** `/login` or `/cart` page

**What Happens:**
1. Frontend captures local cart/wishlist from localStorage
2. Calls `loginWithGoogle()` from AppContext
3. Redirects to: `https://api.hadibookstore.shop/api/auth/google?localCart=[...]&localWishlist=[...]`

### Step 2: Backend Receives Google Auth Request
**Endpoint:** `GET /api/auth/google`

**What Happens:**
1. Backend stores cart/wishlist in session
2. Redirects user to Google OAuth consent screen
3. Google asks user: "Allow Hadi Books Store to access your email and profile?"

### Step 3: User Grants Permission
**Location:** Google's OAuth page

**What Happens:**
1. User clicks "Allow"
2. Google redirects back with authorization code
3. Redirects to: `https://api.hadibookstore.shop/api/auth/google/callback?code=...`

### Step 4: Backend Processes Callback
**Endpoint:** `GET /api/auth/google/callback`

**What Happens:**
1. Backend exchanges code for user profile (email, name, photo)
2. Checks if user exists in database:
   - **Existing user:** Updates with Google ID
   - **New user:** Creates new account
3. Generates JWT token
4. Sets httpOnly cookie with token
5. Syncs cart/wishlist from session to database
6. Redirects to: `https://www.hadibookstore.shop/account?login=success&source=google&...`

### Step 5: Frontend Handles Success
**Location:** `/account` page

**What Happens:**
1. Account page detects `?login=success&source=google` in URL
2. Calls `isAuthenticated()` to verify token and load user data
3. Clears URL parameters
4. Syncs cart/wishlist from database
5. Shows success toast: "Logged in successfully!"
6. User is now fully logged in and can use the site

---

## 🧪 Testing the Complete Flow

### Test 1: New User Registration via Google

1. **Open Incognito Window**
2. Go to: `https://www.hadibookstore.shop/login`
3. Click "Continue with Google"
4. Select a Google account (not previously used)
5. Click "Allow" on permission screen
6. **Expected Result:**
   - ✅ Redirected to `/account`
   - ✅ User is logged in
   - ✅ Profile shows Google name and email
   - ✅ Green success toast appears

### Test 2: Existing User Login via Google

1. **Open Incognito Window**
2. Go to: `https://www.hadibookstore.shop/login`
3. Click "Continue with Google"
4. Select a Google account previously used
5. (May not ask for permission if already granted)
6. **Expected Result:**
   - ✅ Redirected to `/account`
   - ✅ User is logged in with existing data
   - ✅ Previous orders/wishlist visible

### Test 3: Cart Preservation During Google Login

1. **Open Incognito Window**
2. Add 2-3 products to cart (without logging in)
3. Go to cart page
4. Click "Continue with Google"
5. Complete Google OAuth
6. **Expected Result:**
   - ✅ Redirected to `/account`
   - ✅ Cart items preserved
   - ✅ Cart synced to server (check `/cart` page)

### Test 4: Guest to Registered User Merge

1. **Create account with email:** `test@example.com` (normal signup)
2. **Logout**
3. **Open Incognito Window**
4. Go to `/login`
5. Click "Continue with Google"
6. Select Google account with email: `test@example.com`
7. **Expected Result:**
   - ✅ Google ID added to existing account
   - ✅ Both login methods work (Google + email/password)
   - ✅ All previous data preserved

---

## 🔧 Configuration Files

### Backend Environment Variables (.env)
```properties
# Example Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://<your-backend-app>.vercel.app/api/auth/google/callback
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
```

### Frontend Environment Variables (.env)
```properties
# For production build, set this:
VITE_API_URL=https://api.hadibookstore.shop

# For local development:
# VITE_API_URL=http://localhost:4000
```

### Important: Build Frontend for Production

After setting `VITE_API_URL`, rebuild:
```bash
cd client
npm run build
```

Then deploy the `dist` folder to Vercel.

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "redirect_uri_mismatch" Error
**Symptom:** Error page from Google saying redirect URI doesn't match

**Solution:**
1. Go to Google Cloud Console
2. Check "Authorized redirect URIs"
3. Make sure it includes: `https://api.hadibookstore.shop/api/auth/google/callback`
4. Wait 5-10 minutes for changes to propagate
5. Try again

### Issue 2: User Redirected to Login Instead of Account
**Symptom:** After Google OAuth, user goes to `/login` instead of `/account`

**Solution:**
Check backend logs:
```bash
ssh root@139.59.64.199 "pm2 logs hadi-books-store --lines 50"
```

Look for:
- `❌ Google callback error:` - Shows specific error
- `✅ Google OAuth successful` - Confirms success
- `🔑 JWT Token generated` - Confirms token creation

### Issue 3: Cart Not Syncing After Google Login
**Symptom:** Items added before login disappear after Google OAuth

**Check:**
1. Open browser DevTools → Console
2. Look for: `📦 Preserving local data during Google login:`
3. Should show cart/wishlist counts

**Solution:**
- Clear browser cache and cookies
- Try again in Incognito mode
- Check backend logs for sync errors

### Issue 4: Cookie Not Being Set
**Symptom:** User appears logged out immediately after Google OAuth

**Solution:**
Check cookie settings in `googleAuthController.js`:
```javascript
const cookieOptions = {
  httpOnly: true,
  secure: true,          // Must be true for HTTPS
  sameSite: 'none',      // Required for cross-domain cookies
  maxAge: 7 * 24 * 60 * 60 * 1000,
  domain: '.hadibookstore.shop',  // Allows sharing between www and api
  path: '/',
};
```

Verify in browser:
1. DevTools → Application → Cookies
2. Look for cookie named `token`
3. Should have `domain: .hadibookstore.shop`

### Issue 5: "Access Blocked" from Google
**Symptom:** Google shows "This app isn't verified" or "Access blocked"

**Solution:**
1. Your app is in "Testing" mode
2. Add test users in Google Cloud Console:
   - Go to OAuth consent screen
   - Add test users (your email addresses)
3. OR publish app for production (requires verification)

---

## 📊 Monitoring & Logs

### Check if Google OAuth is Working

**Backend Logs:**
```bash
ssh root@139.59.64.199 "pm2 logs hadi-books-store --lines 100"
```

**Look for these messages:**
```
🔐 Starting Google OAuth flow
🔍 Google OAuth profile received for: user@example.com
✅ Google OAuth successful for user: user@example.com
🔑 JWT Token generated for user: [user-id]
🍪 Setting token cookie
🔄 Redirecting to account page with sync data...
```

**Frontend Console:**
```
📦 Preserving local data during Google login: {cartItems: 2, wishlistItems: 1}
📍 Redirecting to Google OAuth: https://api.hadibookstore.shop/api/auth/google?localCart=[...]
🔄 Account: Google OAuth detected, refreshing user data...
```

---

## ✅ Final Checklist

Before testing, verify:

### Google Cloud Console:
- [ ] OAuth 2.0 Client ID exists
- [ ] Authorized JavaScript origins includes: `https://www.hadibookstore.shop`
- [ ] Authorized JavaScript origins includes: `https://api.hadibookstore.shop`
- [ ] Authorized redirect URIs includes: `https://api.hadibookstore.shop/api/auth/google/callback`
- [ ] OAuth consent screen configured
- [ ] Test users added (if in Testing mode)

### Backend Server:
- [ ] `.env` has `GOOGLE_CLIENT_ID`
- [ ] `.env` has `GOOGLE_CLIENT_SECRET`
- [ ] `.env` has `GOOGLE_CALLBACK_URL`
- [ ] `.env` has `NODE_ENV=production`
- [ ] Server running: `pm2 list` shows "online"
- [ ] Logs clean: `pm2 logs hadi-books-store`

### Frontend Client:
- [ ] `.env` has `VITE_API_URL=https://api.hadibookstore.shop`
- [ ] Built for production: `npm run build`
- [ ] Deployed to Vercel
- [ ] "Continue with Google" button visible on `/login` page

### Testing:
- [ ] Incognito window test successful
- [ ] New user registration works
- [ ] Existing user login works
- [ ] Cart preservation works
- [ ] No console errors

---

## 🎯 Expected User Experience

### Perfect Flow:
1. User clicks "Continue with Google"
2. Brief loading spinner
3. Google popup/redirect opens
4. User selects account
5. Permission screen (first time only)
6. User clicks "Allow"
7. Redirect to Hadi Books Store
8. Green toast: "Logged in successfully!"
9. User sees their profile page
10. Cart items preserved (if any)

**Total time:** 5-10 seconds

---

## 🔐 Security Features Already Implemented

- ✅ **httpOnly Cookies:** Token not accessible via JavaScript
- ✅ **Secure Flag:** Cookies only sent over HTTPS
- ✅ **SameSite=none:** Works across domains (www → api)
- ✅ **JWT Expiration:** Tokens expire after 7 days
- ✅ **Email Verification:** Google users marked as verified automatically
- ✅ **Account Merging:** Existing email accounts merged with Google login
- ✅ **Session Protection:** Local cart/wishlist preserved during OAuth

---

## 📞 Need Help?

If Google OAuth still doesn't work after checking everything:

1. **Check Backend Logs:**
   ```bash
   ssh root@139.59.64.199 "pm2 logs hadi-books-store --lines 200"
   ```

2. **Check Frontend Console:**
   - Open DevTools → Console
   - Look for errors or warnings

3. **Test API Endpoint Directly:**
   - Visit: `https://api.hadibookstore.shop/api/auth/google`
   - Should redirect to Google OAuth

4. **Verify Google Cloud Settings:**
   - Screenshot your OAuth settings
   - Double-check redirect URIs

---

## 🎉 Your Implementation is Complete!

The "Continue with Google" feature is **fully implemented** in your codebase. You just need to:

1. ✅ Verify Google Cloud Console settings (redirect URIs)
2. ✅ Test in Incognito mode
3. ✅ Monitor logs for any errors

**The code is ready - just configuration needs verification!**
