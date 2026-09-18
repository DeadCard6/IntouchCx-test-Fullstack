import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { generateToken } from '../utils/token.util.js';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    savedCardNumber?: string;
    savedCardHolder?: string;
    savedCardExpiry?: string;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 400, message: 'El correo electrónico ya se encuentra registrado' };
    }

    // Hash password with bcrypt (RNF Seguridad)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        savedCardNumber: user.savedCardNumber,
        savedCardHolder: user.savedCardHolder,
        savedCardExpiry: user.savedCardExpiry,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: 'Credenciales inválidas: correo o contraseña incorrectos' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw { statusCode: 401, message: 'Credenciales inválidas: correo o contraseña incorrectos' };
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        savedCardNumber: user.savedCardNumber,
        savedCardHolder: user.savedCardHolder,
        savedCardExpiry: user.savedCardExpiry,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'Usuario no encontrado' };
    }
    return user;
  }

  async updateProfile(userId: string, data: any) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'Usuario no encontrado' };
    }
    return userRepository.update(userId, data);
  }

  async deleteAccount(userId: string) {
    return userRepository.delete(userId);
  }
}

export const authService = new AuthService();
