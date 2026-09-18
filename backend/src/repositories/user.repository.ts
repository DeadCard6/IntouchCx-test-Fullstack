import { prisma } from '../config/database.js';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        savedCardNumber: true,
        savedCardHolder: true,
        savedCardExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    savedCardNumber?: string;
    savedCardHolder?: string;
    savedCardExpiry?: string;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase().trim(),
      },
    });
  }

  async update(id: string, data: Partial<{
    fullName: string;
    phoneNumber: string;
    savedCardNumber: string | null;
    savedCardHolder: string | null;
    savedCardExpiry: string | null;
  }>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userRepository = new UserRepository();
