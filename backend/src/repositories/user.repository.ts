import type { User } from '@prisma/client/index';
import { prisma } from '../config/database.js';
import { newId } from '../utils/id.js';

class UserRepository {
  async create(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({
      data: {
        id: newId(),
        ...data
      }
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

  async updatePasswordHash(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
  }
}

export { UserRepository };

