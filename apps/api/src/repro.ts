import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { seedDatabase } from '../prisma/seed';
import { AppModule } from './app.module';
import { NOTIFICATION_PROVIDER, NotificationProvider } from './notifications/notification-provider.types';

const SET_RISK_LEVEL = `
    mutation SetRiskLevel($systemId: Int!, $riskLevel: String!, $organizationId: Int!, $actorId: Int) {
        setSystemRiskLevel(
            systemId: $systemId
            riskLevel: $riskLevel
            organizationId: $organizationId
            actorId: $actorId
        ) {
            id
            riskLevel
        }
    }
`;

class ThrowsOnFirstSendProvider implements NotificationProvider {
    private calls = 0;

    async send(message: string): Promise<void> {
        this.calls += 1;
        if (this.calls === 1) {
            throw new Error(`notification provider is down (message: "${message}")`);
        }
    }
}

async function bootApp(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(NOTIFICATION_PROVIDER)
        .useClass(ThrowsOnFirstSendProvider)
        .compile();

    const app = moduleRef.createNestApplication();
    await app.init();
    return app;
}

async function main(): Promise<void> {
    Logger.overrideLogger(['error']);

    execSync('pnpm exec prisma migrate deploy', { cwd: join(__dirname, '..'), stdio: 'ignore' });

    const prisma = new PrismaClient();
    await seedDatabase(prisma);

    const app = await bootApp();

    console.log('calling setSystemRiskLevel(systemId: 1, riskLevel: "High") as alice@acme.test');
    const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('x-user-email', 'alice@acme.test')
        .send({
            query: SET_RISK_LEVEL,
            variables: { systemId: 1, riskLevel: 'High', organizationId: 1, actorId: 1 },
        });

    const error = response.body.errors?.[0];
    console.log(`the mutation ${error ? `failed: ${error.message}` : 'succeeded'}`);
    console.log('');

    const systems = await prisma.governSystem.findMany({
        where: { id: 1 },
        select: { id: true, name: true, riskLevel: true, organizationId: true, version: true },
    });
    const auditRows = await prisma.governAuditLog.findMany({
        where: { entityType: 'GovernSystem', entityId: 1 },
        select: { id: true, entityId: true, actorId: true, actorEmail: true, before: true, after: true },
    });
    const notifications = await prisma.notification.findMany({
        where: { systemId: 1 },
        select: { id: true, systemId: true, recipientId: true, message: true },
    });

    console.log('GovernSystem');
    console.table(systems);
    console.log('GovernAuditLog (entity GovernSystem 1)');
    console.table(auditRows);
    console.log('Notification (system 1)');
    console.table(notifications);

    await prisma.$disconnect();
    await app.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
