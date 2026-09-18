import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Debe ingresar un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'El nombre completo es requerido'),
  phoneNumber: z.string().optional(),
  savedCardNumber: z.string().optional(),
  savedCardHolder: z.string().optional(),
  savedCardExpiry: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Debe ingresar un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Sesión iniciada correctamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await authService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await authService.deleteAccount(req.user!.userId);
      res.status(200).json({
        success: true,
        message: 'Registro de usuario cancelado y eliminado del sistema',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
