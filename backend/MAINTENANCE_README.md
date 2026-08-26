# Maintenance Mode System

A robust maintenance mode system for the SDES website that allows you to gracefully serve a maintenance page while keeping admin and selected users able to access the live site.

## Features

✅ **Maintenance Page**: Professional, branded maintenance page with countdown timer  
✅ **HTTP 503 Status**: Returns proper HTTP 503 (Service Unavailable) status code  
✅ **Retry-After Header**: Sets `Retry-After` header for search engines and clients  
✅ **IP Allowlist**: Allow specific IP addresses to bypass maintenance mode  
✅ **Bypass Token**: Secret token authentication for testing/admin access  
✅ **Environment-based Toggle**: Easy on/off via environment variable  
✅ **Health Checks**: Allows health check endpoints to always respond  

## Quick Start

### 1. Enable Maintenance Mode

Add to your `.env` file:

```env
# Enable maintenance mode (true/false)
MAINTENANCE_MODE=true

# Secret bypass token (change this to something secure)
MAINTENANCE_BYPASS_TOKEN=your-super-secret-bypass-token-here

# Comma-separated list of IP addresses allowed during maintenance
MAINTENANCE_ALLOWED_IPS=127.0.0.1,192.168.1.100

# Estimated maintenance duration in hours (for Retry-After header)
MAINTENANCE_DURATION_HOURS=2
```

### 2. Restart the server

```bash
npm run dev:backend
# or
node backend/server.mjs
```

That's it! The site will now show the maintenance page to all visitors except those who meet the bypass criteria.

## How to Bypass Maintenance Mode

Once maintenance mode is enabled, visitors can access the live site using one of these methods:

### Method 1: Bypass Query Parameter

Add the bypass token to the URL:

```
https://sdrs.com.sa/?bypass=your-super-secret-bypass-token-here
```

### Method 2: Bypass Cookie

Set a cookie named `maintenance_bypass` with the token value:

```javascript
// In browser console
document.cookie = "maintenance_bypass=your-super-secret-bypass-token-here; path=/";
```

### Method 3: IP Allowlist

If your IP address is in the `MAINTENANCE_ALLOWED_IPS` list, you can access the site normally from that IP without any additional parameters.

**Finding Your IP Address:**
- Visit [whatismyipaddress.com](https://whatismyipaddress.com)
- Or check server logs (the middleware logs allowed bypasses)

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `MAINTENANCE_MODE` | `false` | Set to `true` to enable maintenance mode |
| `MAINTENANCE_BYPASS_TOKEN` | `your-secret-bypass-token` | Secret token for bypass authentication (change this!) |
| `MAINTENANCE_ALLOWED_IPS` | `` (empty) | Comma-separated IPs allowed during maintenance (e.g., `127.0.0.1,192.168.1.100`) |
| `MAINTENANCE_DURATION_HOURS` | `2` | Estimated maintenance duration for `Retry-After` header |

## Configuration Examples

### Example 1: Turn Off Maintenance Mode

```env
MAINTENANCE_MODE=false
```

### Example 2: Maintenance with Multiple Admin IPs

```env
MAINTENANCE_MODE=true
MAINTENANCE_BYPASS_TOKEN=MySecretToken2024!
MAINTENANCE_ALLOWED_IPS=203.0.113.42,203.0.113.58,127.0.0.1
MAINTENANCE_DURATION_HOURS=3
```

### Example 3: Maintenance with Query Bypass Only

```env
MAINTENANCE_MODE=true
MAINTENANCE_BYPASS_TOKEN=TemporaryBypassCode123
MAINTENANCE_ALLOWED_IPS=
MAINTENANCE_DURATION_HOURS=1
```

## Health Check Endpoints

The following endpoints will **always respond** regardless of maintenance mode status:

- `/health`
- `/health-check`
- `/status`
- `/api/health`

This allows monitoring systems and load balancers to verify the server is running.

## How It Works

### Request Flow

```
Incoming Request
    ↓
Is MAINTENANCE_MODE enabled?
    ├─ NO  → Process normally
    ├─ YES → Check request path
            ├─ Health endpoint? → Allow
            ├─ Bypass token valid? → Allow
            ├─ IP in allowlist? → Allow
            └─ Otherwise → Show maintenance page (HTTP 503)
```

### Response Headers for Maintenance Mode

When the maintenance page is served, the following headers are set:

```
HTTP/1.1 503 Service Unavailable
Content-Type: text/html; charset=utf-8
Retry-After: 7200
```

The `Retry-After` header tells search engines and clients when to check back (in seconds).

## Maintenance Page Customization

The maintenance page is located at: `public/maintenance.html`

You can customize it to:
- Update contact email
- Change social media links
- Adjust the logo
- Modify the estimated time
- Change colors or styling

The page uses **inline CSS** with no external dependencies, ensuring it loads instantly even if other services are down.

### Customization Tips

```html
<!-- Update contact email -->
<a href="mailto:your-email@company.com" class="contact-email">your-email@company.com</a>

<!-- Update social links -->
<a href="https://your-linkedin-url" class="social-link" title="LinkedIn">in</a>

<!-- Change the site name in the logo -->
<div class="logo-placeholder">YOUR-LOGO</div>

<!-- Update brand colors - look for these hex codes in the <style> section -->
<!-- #262f61 - Dark blue background
     #B82227 - Red accent
     #F27141 - Orange accent
-->
```

## Monitoring and Logging

The middleware logs bypass events:

```
✓ Maintenance bypass granted for 192.168.1.100 (/api/chat)
```

Check your server logs to see who accessed the site during maintenance.

## Production Deployment

### Vercel Deployment

If deploying to Vercel, ensure the environment variables are set in your Vercel project settings:

1. Go to your Vercel project → Settings → Environment Variables
2. Add the variables:
   - `MAINTENANCE_MODE`
   - `MAINTENANCE_BYPASS_TOKEN`
   - `MAINTENANCE_ALLOWED_IPS`
   - `MAINTENANCE_DURATION_HOURS`
3. Redeploy your project

### Docker / Self-hosted

Pass environment variables when running the container:

```bash
docker run -e MAINTENANCE_MODE=true \
           -e MAINTENANCE_BYPASS_TOKEN=YourSecretToken \
           -e MAINTENANCE_ALLOWED_IPS=203.0.113.42 \
           -e MAINTENANCE_DURATION_HOURS=2 \
           your-image:tag
```

## Typical Maintenance Workflow

### Before Maintenance

1. Update `.env` file:
   ```env
   MAINTENANCE_MODE=true
   MAINTENANCE_BYPASS_TOKEN=TempToken123
   MAINTENANCE_ALLOWED_IPS=127.0.0.1
   ```

2. (Optional) Deploy new version with changes
3. Restart server

### During Maintenance

- Test the site using bypass token: `?bypass=TempToken123`
- Admins from allowed IPs can access normally
- All other visitors see the maintenance page
- Search engines receive HTTP 503 (won't deindex)

### After Maintenance

1. Update `.env` file:
   ```env
   MAINTENANCE_MODE=false
   ```

2. Restart server
3. Site is live for all visitors

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Change the default bypass token** - Don't use `your-secret-bypass-token`
2. **Use strong random tokens** - Example: `2e$kX9@mP7vL#nQ4zR8wT`
3. **Rotate tokens regularly** during maintenance
4. **Don't commit tokens** to version control - Use `.env` files
5. **Use HTTPS only** - Bypass tokens in URLs can be logged

### Generating a Secure Bypass Token

```bash
# Linux/Mac
openssl rand -hex 32

# PowerShell (Windows)
[System.Convert]::ToHexString([byte[]]@((1..32 | ForEach-Object {Get-Random -Maximum 256})))

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Troubleshooting

### Issue: Maintenance page not showing

**Solution:**
- Check `MAINTENANCE_MODE=true` in `.env`
- Verify server has restarted
- Check that maintenance.html exists at `public/maintenance.html`

### Issue: Can't bypass with token

**Solution:**
- Verify exact token in `.env` matches in URL parameter
- Check token doesn't have leading/trailing spaces
- Try URL encoding: `?bypass=your%20token` if spaces exist
- Check browser cookies if using cookie bypass

### Issue: Admin can't access from their IP

**Solution:**
- Get their actual IP (check server logs or [whatismyipaddress.com](https://whatismyipaddress.com))
- If behind corporate proxy, the IP might be the proxy's IP
- Add IP to `MAINTENANCE_ALLOWED_IPS` list
- Restart server

### Issue: Search engines are deindexing

**Solution:**
- This shouldn't happen if HTTP 503 is set correctly
- Verify `Content-Type` header is `text/html; charset=utf-8`
- Check `Retry-After` header is being sent
- Wait a few days; search engines will re-index after maintenance ends

## Code References

- **Middleware File**: `backend/middleware/maintenanceMiddleware.js`
- **Maintenance Page**: `public/maintenance.html`
- **Server Integration**: `backend/server.mjs` (imported and used)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the middleware comments in `maintenanceMiddleware.js`
3. Verify all environment variables are set correctly
4. Check server logs for error messages

---

**Version**: 1.0  
**Last Updated**: 2024  
**Maintained by**: SDES Development Team
