import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { default: false },
});

export const publicFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // max 15 enquiries per 10 mins
  message: {
    success: false,
    message: 'Too many enquiry requests submitted from this network. Please wait a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { default: false },
});

