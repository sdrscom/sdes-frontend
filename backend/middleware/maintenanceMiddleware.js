import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Maintenance Mode Middleware for Express.js
 * 
 * Configuration:
 * - MAINTENANCE_MODE: Set to 'true' to enable maintenance mode (default: 'false')
 * - MAINTENANCE_BYPASS_TOKEN: Secret token for bypassing maintenance (e.g., ?bypass=YOUR_SECRET)
 * - MAINTENANCE_ALLOWED_IPS: Comma-separated list of IP addresses allowed during maintenance
 * - MAINTENANCE_DURATION_HOURS: How long until maintenance is estimated to end (default: 2)
 * 
 * Usage:
 *   app.use(maintenanceMiddleware());
 * 
 * Bypass Methods:
 *   1. Query parameter: ?bypass=YOUR_SECRET_TOKEN
 *   2. Cookie: maintenance_bypass=YOUR_SECRET_TOKEN
 *   3. IP Allowlist: Add IP to MAINTENANCE_ALLOWED_IPS
 */

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const BYPASS_TOKEN = process.env.MAINTENANCE_BYPASS_TOKEN || 'your-secret-bypass-token';
const ALLOWED_IPS = (process.env.MAINTENANCE_ALLOWED_IPS || '')
  .split(',')
  .map(ip => ip.trim())
  .filter(ip => ip.length > 0);
const MAINTENANCE_DURATION_HOURS = parseInt(process.env.MAINTENANCE_DURATION_HOURS) || 2;

// Load maintenance page
let maintenancePage = '';
try {
  const maintenancePath = path.join(__dirname, '../../public/maintenance.html');
  maintenancePage = fs.readFileSync(maintenancePath, 'utf-8');
} catch (error) {
  console.warn('Warning: maintenance.html not found. Using fallback maintenance page.');
  maintenancePage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Under Maintenance</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background: #262f61; color: white; }
        h1 { color: #F27141; }
      </style>
    </head>
    <body>
      <h1>We'll Be Back Soon</h1>
      <p>Our site is currently under maintenance. Please check back shortly.</p>
      <p>Estimated time: ${MAINTENANCE_DURATION_HOURS} hour(s)</p>
    </body>
    </html>
  `;
}

/**
 * Get client IP address from request
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress
  );
}

/**
 * Check if client can bypass maintenance mode
 */
function canBypassMaintenance(req) {
  // Check bypass token in query parameter or cookie
  const bypassToken = req.query.bypass || req.cookies?.maintenance_bypass;
  if (bypassToken && bypassToken === BYPASS_TOKEN) {
    return true;
  }

  // Check if IP is in allowlist
  const clientIp = getClientIp(req);
  if (ALLOWED_IPS.includes(clientIp)) {
    return true;
  }

  return false;
}

/**
 * Routes that should bypass maintenance mode
 */
function shouldBypassRoute(req) {
  const bypassRoutes = [
    '/health',
    '/health-check',
    '/status',
    '/api/health',
  ];

  return bypassRoutes.some(route => req.path.startsWith(route));
}

/**
 * Maintenance middleware
 */
export function maintenanceMiddleware() {
  return (req, res, next) => {
    // If maintenance mode is disabled, skip this middleware
    if (!MAINTENANCE_MODE) {
      return next();
    }

    // Always allow health check endpoints
    if (shouldBypassRoute(req)) {
      return next();
    }

    // Allow requests if bypass token is valid or IP is whitelisted
    if (canBypassMaintenance(req)) {
      console.log(`✓ Maintenance bypass granted for ${getClientIp(req)} (${req.path})`);
      return next();
    }

    // Return maintenance page with proper HTTP status and headers
    res.status(503);
    res.set('Retry-After', `${MAINTENANCE_DURATION_HOURS * 3600}`); // Retry after X seconds
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(maintenancePage);
  };
}

/**
 * Helper function to toggle maintenance mode via environment
 * You can use this in your deployment scripts or admin panel
 * 
 * Example in code:
 *   process.env.MAINTENANCE_MODE = 'true';
 *   // or in .env file:
 *   MAINTENANCE_MODE=true
 */
export function getMaintenanceStatus() {
  return {
    enabled: MAINTENANCE_MODE,
    allowedIPs: ALLOWED_IPS,
    durationHours: MAINTENANCE_DURATION_HOURS,
    bypassTokenActive: !!BYPASS_TOKEN && BYPASS_TOKEN !== 'your-secret-bypass-token',
  };
}

export default maintenanceMiddleware;
