import { randomUUID } from 'node:crypto';

// ponytail: Prisma 7 client-side uuid() runs in a sandbox without Node globals
function newId(): string {
  return randomUUID();
}

export { newId };
