
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
const isProd = process.env.NODE_ENV === "production";

const ACCESS_SECRET   = process.env.JWT_ACCESS_SECRET;   // 256-bit key
const REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET;
const ISSUER          = process.env.JWT_ISSUER;
const ACCESS_TTL      = process.env.ACCESS_TTL
const REFRESH_TTL     = process.env.REFRESH_TTL

const BASE_OPTS = { algorithm: 'HS256' };


/* -------------------------------------------------
   Helpers
------------------------------------------------- */
const sign = (payload, secret, ttl, opts = {}) =>
  jwt.sign(
    { ...payload, iat: Math.floor(Date.now() / 1000), iss: ISSUER, ...opts },
    secret,
    { ...BASE_OPTS, expiresIn: ttl }
  );

/* -------------------------------------------------
   Access token (org-scoped)
------------------------------------------------- */
export const generateOrgAccessToken = (payload, ua, ip) =>
  sign(
    {
      ...payload,
      aud: payload.orgId,
      nbf: Math.floor(Date.now() / 1000),
      fingerprint: crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16),
    },
    ACCESS_SECRET,
    ACCESS_TTL
  );

/* -------------------------------------------------
   Refresh token (global)
------------------------------------------------- */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    uuid: user.uuid,
    email: user.email,
    role: user.Globalrole,
  };
  return sign(payload, REFRESH_SECRET, REFRESH_TTL);
};

/* -------------------------------------------------
   Cookie setters
------------------------------------------------- */
// ------------------ Cookie Setters ------------------

export const setTokenCookies = (res, accessToken, refreshToken) => {
  const baseOpts = {
    httpOnly:isProd,
    secure:isProd,
    sameSite: 'Lax',
  };
// org token
  res.cookie('_fxl_1A2B3C', accessToken, {
    ...baseOpts,
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  });
// user token 
  res.cookie('_fxl_9X8Y7Z', refreshToken, {
    ...baseOpts,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};
/* -------------------------------------------------
   Stand-alone access-token generator
------------------------------------------------- */
export const createAccessTokenOnly = (payload, ua, ip) =>
  sign(
    {
      ...payload,
      aud: payload.orgId,
      nbf: Math.floor(Date.now() / 1000),
      fingerprint: crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16),
    },
    ACCESS_SECRET,
    ACCESS_TTL
  );
  /**
 * Sets ONLY the access-token cookie (no refresh).
 * Useful for silent refresh or short-lived sessions.
 */
export const setAccessCookieOnly = (res, accessToken) => {
  res.cookie('_fxl_1A2B3C', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 1000 * 60 * 60 * 2, // 2 h
  });
};
/* -------------------------------------------------
   Verifiers
------------------------------------------------- */
export const verifyOrgToken = (token, ua, ip) => {
  const decoded = jwt.verify(token, ACCESS_SECRET, { issuer: ISSUER });
  const fp = crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16);
  if (decoded.fingerprint !== fp) return res.status(401).json('Fingerprint mismatch');
  return decoded;
};

export const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET, { issuer: ISSUER });