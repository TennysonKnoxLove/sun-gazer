# Generac PWRfleet - Token Setup Guide

## Overview

Generac PWRfleet uses OAuth 2.0 authentication. To connect Sun Gazer to your Generac system, you'll need to extract your OAuth tokens from your browser session.

**No security concerns:** Your tokens are encrypted and stored securely. You don't need to make any data public!

---

## Step-by-Step Token Extraction

### 1. Open Developer Tools

1. Go to [https://pwrfleet.generac.com](https://pwrfleet.generac.com)
2. **Before logging in**, press **F12** (or right-click → Inspect) to open Developer Tools
3. Click on the **Network** tab
4. Make sure recording is enabled (red circle in top-left)

### 2. Log In and Capture Tokens

1. **Log in** to your Generac account
2. In the Network tab, look for a request to:

   - `generac-api.neur.io/sessions/v1/pkce/tokens`
   - Or similar endpoint containing "token" or "auth"

3. Click on that request
4. Click the **Response** tab
5. You should see JSON that looks like this:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "v1.Mfr3NWt4zCxW8c7h5xDKpN2...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": "abc123-def456-ghi789"
}
```

### 3. Copy the Values

You need to copy these 4 values:

| Field            | What to Copy                       | Example                   |
| ---------------- | ---------------------------------- | ------------------------- |
| **userId**       | The user ID string                 | `abc123-def456-ghi789`    |
| **accessToken**  | The entire JWT token (long string) | `eyJhbGciOiJSUzI1NiIs...` |
| **refreshToken** | The refresh token string           | `v1.Mfr3NWt4zCxW8c7h...`  |
| **expiresIn**    | Number of seconds until expiry     | `3600`                    |

**Tip:** Double-click each value to select it, then copy (Ctrl+C / Cmd+C)

---

## Step 4: Add to Sun Gazer

1. In Sun Gazer, go to **Settings** → **Access Management**
2. Click **Add Vendor Access**
3. Select **Generac (PWRcell)**
4. Paste the values you copied:
   - **User ID**: Paste the `userId`
   - **Access Token**: Paste the `accessToken`
   - **Refresh Token**: Paste the `refreshToken` (optional but recommended)
   - **Expires In**: Paste the `expiresIn` (optional)
5. Click **Add Access**

---

## What Happens Next?

✅ Sun Gazer will:

- Encrypt and securely store your tokens
- Use the access token to fetch your Generac fleet data
- Automatically refresh the access token when it expires (if refresh token provided)
- Display your sites in the Fleet Dashboard

---

## Token Expiration

- **Access tokens** typically expire after 1 hour (`expiresIn: 3600`)
- If you provided a **refresh token**, Sun Gazer will automatically get a new access token
- If you **didn't** provide a refresh token, you'll need to manually extract tokens again when they expire

---

## Troubleshooting

### "Authentication failed" error

- Your access token may have expired
- Go back to Step 2 and get fresh tokens

### "No sites found"

- Make sure you're logged into the correct Generac account
- Verify your User ID is correct
- Check that you have sites/systems associated with your account

### Can't find the token request

- Make sure Developer Tools was open **before** you logged in
- Try clearing the Network tab (trash icon) and logging in again
- The request might be named differently - look for anything with "token" or "session"

---

## Security Notes

🔒 **Your data is safe:**

- Tokens are encrypted before storage
- No data is made public
- Each user uses their own authentication
- Sun Gazer only accesses data you have permission to see

⚠️ **Keep your tokens secure:**

- Don't share your tokens with anyone
- Treat them like passwords
- If you think they're compromised, log out of pwrfleet.generac.com and log back in to invalidate old tokens

---

## Need Help?

If you're having trouble:

1. Take a screenshot of the token response (blur out the actual token values!)
2. Check the Sun Gazer logs for error messages
3. Verify you're copying the entire token (they're very long!)

---

## Alternative: Future Enhancement

We're exploring adding a direct "Login with Generac" button that would handle this automatically. For now, manual token extraction is the most secure and reliable method.
