import { Router } from 'express';
import { authController, loginSchema, registerSchema } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/profile', authenticateJwt, authController.getProfile);
router.put('/profile', authenticateJwt, authController.updateProfile);
router.delete('/profile', authenticateJwt, authController.deleteAccount);

export default router;
