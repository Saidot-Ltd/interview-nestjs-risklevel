import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createE2eApp } from './e2e-app';
import { resetTestDatabase } from './e2e-database';

describe('REST routes (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;

    beforeAll(async () => {
        await resetTestDatabase();
        app = await createE2eApp();
        prisma = new PrismaClient();
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await app.close();
    });

    it('GET /me reports the signed-in user', async () => {
        const response = await request(app.getHttpServer()).get('/me').set('x-user-email', 'alice@acme.test');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: 1, email: 'alice@acme.test', organizationId: 1 });
    });

    it('GET /me refuses a request with no session', async () => {
        const response = await request(app.getHttpServer()).get('/me');

        expect(response.status).toBe(401);
    });

    it('GET /systems lists the caller organisation', async () => {
        const response = await request(app.getHttpServer())
            .get('/systems?page=1&pageSize=10')
            .set('x-user-email', 'bob@globex.test');

        expect(response.status).toBe(200);
        expect(response.body.total).toBe(5);
        expect(response.body.items.map((item) => item.id)).toEqual([7, 8, 9, 10, 11]);
    });

    it('PATCH /systems/:id/risk-level moves an Acme system from Medium to High', async () => {
        const response = await request(app.getHttpServer())
            .patch('/systems/1/risk-level')
            .set('x-user-email', 'alice@acme.test')
            .send({ riskLevel: 'High', organizationId: 1, actorId: 1 });

        expect(response.status).toBe(200);
        expect(response.body.riskLevel).toBe('High');

        const system = await prisma.governSystem.findUnique({ where: { id: 1 } });
        expect(system.riskLevel).toBe('High');
    });

    it('PATCH /systems/:id/risk-level rejects a body that fails the schema', async () => {
        const response = await request(app.getHttpServer())
            .patch('/systems/1/risk-level')
            .set('x-user-email', 'alice@acme.test')
            .send({ riskLevel: 'Low', organizationId: 'one' });

        expect(response.status).toBe(400);

        const system = await prisma.governSystem.findUnique({ where: { id: 1 } });
        expect(system.riskLevel).toBe('High');
    });

    it('GET /systems/:id/activity returns the audit trail', async () => {
        const response = await request(app.getHttpServer())
            .get('/systems/1/activity')
            .set('x-user-email', 'alice@acme.test');

        expect(response.status).toBe(200);
        expect(response.body.auditLog.length).toBeGreaterThan(0);
    });
});
