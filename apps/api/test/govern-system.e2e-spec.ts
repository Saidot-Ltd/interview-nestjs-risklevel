import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { resetTestDatabase } from './e2e-database';

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
            riskLabel
        }
    }
`;

describe('setSystemRiskLevel (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;

    beforeAll(async () => {
        await resetTestDatabase();

        const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = moduleRef.createNestApplication();
        await app.init();

        prisma = new PrismaClient();
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await app.close();
    });

    it('moves an Acme system from Medium to High', async () => {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .set('x-user-email', 'alice@acme.test')
            .send({
                query: SET_RISK_LEVEL,
                variables: { systemId: 1, riskLevel: 'High', organizationId: 1, actorId: 1 },
            });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.setSystemRiskLevel.riskLevel).toBe('High');

        const system = await prisma.governSystem.findUnique({ where: { id: 1 } });
        expect(system.riskLevel).toBe('High');
    });
});
