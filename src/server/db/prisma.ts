import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Evita instanciar múltiples clientes en desarrollo (Next.js HMR)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Extiende el cliente para usar Prisma Accelerate
const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Exportamos el cliente ya configurado para usarlo en los Services
export const db = prisma;