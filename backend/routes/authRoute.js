import express from 'express';
import { login, register, getProfile } from '../controllers/authController.js';
import { validateLogin, validateRegister } from '../middlewares/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authLimiter, sanitizeInput, logSuspiciousActivity } from '../middlewares/securityMiddleware.js';

const router = express.Router();

// 🔒 SÉCURITÉ: Protection contre les attaques par force brute
router.post('/login', authLimiter, sanitizeInput, logSuspiciousActivity, validateLogin, login);
router.post('/register', authLimiter, sanitizeInput, logSuspiciousActivity, validateRegister, register);
router.get('/profile', authenticate, getProfile);

export default router;