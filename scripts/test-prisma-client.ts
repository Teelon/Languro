import { prisma } from '../src/utils/prismaDB';

async function main() {
    console.log('Checking Prisma Client keys...');
    // @ts-ignore - we want to check if it exists at runtime even if TS complains
    if (prisma.handwritingSession) {
        console.log('SUCCESS: prisma.handwritingSession exists!');
        // @ts-ignore
        const count = await prisma.handwritingSession.count();
        console.log(`Current session count: ${count}`);
    } else {
        console.error('FAILURE: prisma.handwritingSession is MISSING.');
        console.log('Available keys:', Object.keys(prisma));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
