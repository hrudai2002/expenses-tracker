import type { User } from '@prisma/client/index';
import { prisma } from '../config/database.js';

class UserRepository {
  async create(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({
      data
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }
}

export { UserRepository };

