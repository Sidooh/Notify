import { PrismaClient } from '@prisma/client';
import {env} from "../utils/validate.env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const db = globalForPrisma.prisma || new PrismaClient({ log: ['error'] });

if (!env.isProduction) globalForPrisma.prisma = db;

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function(): string {
    return this.toString();
};

export const Notification = db.notification;
export const Notifiable = db.notifiable;
export const Setting = db.setting;

export default db;