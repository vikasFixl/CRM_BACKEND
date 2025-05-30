import rateLimit from 'express-rate-limit';

// Email-based rate limiter for login
const loginEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts for this email. Try again after 15 minutes.',
  },
  keyGenerator: (req) => {
    return req.body.email ? req.body.email.toLowerCase() : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email-based rate limiter for signup
const signupEmailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many signup attempts for this email. Try again later.',
  },
  keyGenerator: (req) => {
    return req.body.email ? req.body.email.toLowerCase() : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email-based rate limiter for forgot password
const forgotEmailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many forgot password requests for this email. Try again later.',
  },
  keyGenerator: (req) => {
    return req.body.email ? req.body.email.toLowerCase() : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 

// Email-based rate limiter for reset password
const resetEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: {
    success: false,
    message: 'Too many reset attempts for this email. Try again later.',
  },
  keyGenerator: (req) => {
    return req.body.email ? req.body.email.toLowerCase() : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // Max 100 requests per IP per minute
  message: "Too many requests from this IP, please try again later."
});


// General moderate limiter: max 5 requests per 15 minutes
const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many requests from this user, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slightly more lenient limiter for invites acceptance/decline
const lightLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// For actions like switch org or create invite (10 requests max)
const moderatePlusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { moderateLimiter, lightLimiter, moderatePlusLimiter,


  globalLimiter,
  loginEmailRateLimiter,
  signupEmailRateLimiter,
  forgotEmailRateLimiter,
  resetEmailRateLimiter,
};
