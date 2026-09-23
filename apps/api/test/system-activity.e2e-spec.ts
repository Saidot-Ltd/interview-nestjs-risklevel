import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from './e2e-app';
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
            version
        }
    }
`;

const SYSTEM_ACTIVITY = `
    query SystemActivity($systemId: Int!) {
        systemActivity(systemId: $systemId) {
            auditLog {
                actorId
                actorEmail
                before
                after
            }
            notifications {
                recipientId
                message
            }
        }
    }
`;

const SOFT_DELETED_SYSTEM_ID = 6;

describe('systemActivity (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        await resetTestDatabase();
        app = await createE2eApp();
    });

    afterAll(async () => {
        await app.close();
    });

    function post(userEmail: string, query: string, variables: Record<string, unknown>) {
        return request(app.getHttpServer()).post('/graphql').set('x-user-email', userEmail).send({ query, variables });
    }

    function setRiskLevel(userEmail: string, systemId: number, riskLevel: string) {
        return post(userEmail, SET_RISK_LEVEL, { systemId, riskLevel, organizationId: 1, actorId: 1 });
    }

    function activityFor(userEmail: string, systemId: number) {
        return post(userEmail, SYSTEM_ACTIVITY, { systemId });
    }

    it('records one audit row and one notification when a system is raised to High', async () => {
        const mutation = await setRiskLevel('alice@acme.test', 1, 'High');
        expect(mutation.body.errors).toBeUndefined();

        const response = await activityFor('alice@acme.test', 1);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.systemActivity).toEqual({
            auditLog: [
                {
                    actorId: 1,
                    actorEmail: 'alice@acme.test',
                    before: JSON.stringify({ riskLevel: 'Medium', version: 1 }),
                    after: JSON.stringify({ riskLevel: 'High', version: 2 }),
                },
            ],
            notifications: [
                {
                    recipientId: 1,
                    message: 'Acme Credit Scoring was raised to High risk',
                },
            ],
        });
    });

    it('records an audit row but no notification when a system is lowered', async () => {
        const mutation = await setRiskLevel('alice@acme.test', 2, 'Low');
        expect(mutation.body.errors).toBeUndefined();

        const response = await activityFor('alice@acme.test', 2);

        expect(response.body.data.systemActivity).toEqual({
            auditLog: [
                {
                    actorId: 1,
                    actorEmail: 'alice@acme.test',
                    before: JSON.stringify({ riskLevel: 'High', version: 1 }),
                    after: JSON.stringify({ riskLevel: 'Low', version: 2 }),
                },
            ],
            notifications: [],
        });
    });

    it('lists the newest audit row first after two changes', async () => {
        await setRiskLevel('alice@acme.test', 3, 'Medium');
        await setRiskLevel('alice@acme.test', 3, 'High');

        const response = await activityFor('alice@acme.test', 3);

        expect(response.body.data.systemActivity.auditLog.map((entry) => entry.after)).toEqual([
            JSON.stringify({ riskLevel: 'High', version: 3 }),
            JSON.stringify({ riskLevel: 'Medium', version: 2 }),
        ]);
    });

    it('hides another tenant activity from bob', async () => {
        const response = await activityFor('bob@globex.test', 1);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.systemActivity).toEqual({ auditLog: [], notifications: [] });
    });

    it('returns nothing for a soft-deleted system', async () => {
        const response = await activityFor('alice@acme.test', SOFT_DELETED_SYSTEM_ID);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.systemActivity).toEqual({ auditLog: [], notifications: [] });
    });
});
