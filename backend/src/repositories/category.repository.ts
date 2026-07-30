import type { Category, CategoryType } from '@prisma/client/index';
import { prisma } from '../config/database.js';
import { newId } from '../utils/id.js';

class CategoryRepository {
  async create(data: { userId: string; name: string; type: CategoryType; color?: string }): Promise<Category> {
    return prisma.category.create({ data: { id: newId(), ...data } });
  }

  async findManyByUser(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: 'asc' }, { name: 'asc' }]
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id }
    });
  }

  async update(
    id: string,
    data: { name: string; type: CategoryType; color?: string | null }
  ): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id }
    });
  }
}

export { CategoryRepository };

