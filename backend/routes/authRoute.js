import express from 'express';
import { login, register, getProfile } from '../controllers/authController.js';
import { validateLogin, validateRegister } from '../middlewares/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.get('/profile', authenticate, getProfile);

export default router;