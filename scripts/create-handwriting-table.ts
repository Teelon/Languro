import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';

async function main() {
    console.log('Creating handwriting_sessions table...');
    try {
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "handwriting_sessions" (
        "id" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "imageUrl" TEXT,
        "imageKey" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "handwriting_sessions_pkey" PRIMARY KEY ("id")
      );
    `;
        console.log('Table created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
