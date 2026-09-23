import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '../prisma/seed';

const apiRoot = join(__dirname, '..');
const databaseUrl = 'file:./test.db';

export async function resetTestDatabase(): Promise<void> {
    for (const suffix of ['', '-journal', '-wal', '-shm']) {
        rmSync(join(apiRoot, 'prisma', `test.db${suffix}`), { force: true });
    }

    execSync('pnpm exec prisma migrate deploy', {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'ignore',
    });

    const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
    await seedDatabase(prisma);
    await prisma.$disconnect();
}
