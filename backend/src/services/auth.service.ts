import { Prisma } from '@prisma/client/index';
import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';
import { generateAuthToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { HTTP_STATUS } from '../utils/http-status.js';

class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(payload: { name: string; email: string; password: string }) {
    const existingUser = await this.userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError('A user with this email already exists.', HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await hashPassword(payload.password);

    try {
      const user = await this.userRepository.create({
        name: payload.name,
        email: payload.email,
        passwordHash
      });

      return {
        token: generateAuthToken({
          userId: user.id,
          email: user.email
        }),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('A user with this email already exists.', HTTP_STATUS.CONFLICT);
      }

      throw error;
    }
  }

  async login(payload: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
    }

    const passwordMatches = await comparePassword(payload.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
    }

    return {
      token: generateAuthToken({
        userId: user.id,
        email: user.email
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async changePassword(userId: string, payload: { currentPassword: string; newPassword: string }) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
    }

    const passwordMatches = await comparePassword(payload.currentPassword, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError('Current password is incorrect.', HTTP_STATUS.UNAUTHORIZED);
    }

    const passwordHash = await hashPassword(payload.newPassword);
    await this.userRepository.updatePasswordHash(userId, passwordHash);

    return { message: 'Password updated successfully.' };
  }
}

export { AuthService };

