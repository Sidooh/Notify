import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: [process.env.NODE_ENV === 'production' ? 'error' : 'error']
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function(): string {
    return this.toString();
};

export default db;