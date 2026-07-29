import bcrypt from 'bcryptjs';

const PASSWORD_SALT_ROUNDS = 10;

async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, PASSWORD_SALT_ROUNDS);
}

async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export { comparePassword, hashPassword };

