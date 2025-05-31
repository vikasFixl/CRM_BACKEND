import {rateLimit}from 'express-rate-limit';

// IP-based rate limiter for login
const loginEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 7,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP-based rate limiter for signup
const signupEmailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 7,
  message: {
    success: false,
    message: 'Too many signup attempts from this IP. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP-based rate limiter for forgot password
const forgotEmailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many forgot password requests from this IP. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP-based rate limiter for reset password
const resetEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: {
    success: false,
    message: 'Too many reset attempts from this IP. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global limiter: 100 requests per IP per minute
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 70,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate limiter: 10 requests per 15 minutes
const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Light limiter: 20 requests per 15 minutes
const lightLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate plus limiter: 10 requests per 15 minutes
const moderatePlusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export {
  moderateLimiter,
  lightLimiter,
  moderatePlusLimiter,
  globalLimiter,
  loginEmailRateLimiter,
  signupEmailRateLimiter,
  forgotEmailRateLimiter,
  resetEmailRateLimiter,
  rateLimit
};
