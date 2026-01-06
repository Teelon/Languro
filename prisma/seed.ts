
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(__dirname, 'raw_sql/DML.sql');
  console.log(`Reading SQL from ${sqlPath}`);

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  // Split by semicolon to get individual statements
  // Filter out empty lines and comments roughly
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} statements to execute.`);

  for (const statement of statements) {
    try {
      // Basic check to ensure it's not just a comment
      if (statement.startsWith('--') && !statement.includes('\n')) continue;

      await prisma.$executeRawUnsafe(statement);
      // console.log(`Executed: ${statement.substring(0, 50)}...`);
    } catch (e) {
      console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
      console.error(e);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
