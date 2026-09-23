import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from './e2e-app';
import { resetTestDatabase } from './e2e-database';

const SYSTEMS_QUERY = `
    query GovernSystems($page: Int, $pageSize: Int) {
        governSystems(page: $page, pageSize: $pageSize) {
            total
            page
            pageSize
            items {
                id
                name
                riskLevel
                riskLabel
                organizationId
                ownerId
                ownerEmail
                version
            }
        }
    }
`;

const ARGUMENTS_QUERY = `
    query GovernSystemsArguments {
        __type(name: "Query") {
            fields {
                name
                args {
                    name
                }
            }
        }
    }
`;

describe('governSystems (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        await resetTestDatabase();
        app = await createE2eApp();
    });

    afterAll(async () => {
        await app.close();
    });

    function listAs(userEmail: string, variables: Record<string, unknown> = {}) {
        return request(app.getHttpServer())
            .post('/graphql')
            .set('x-user-email', userEmail)
            .send({ query: SYSTEMS_QUERY, variables });
    }

    it('returns every live Acme system to alice and never the soft-deleted one', async () => {
        const response = await listAs('alice@acme.test');

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.governSystems).toEqual({
            total: 5,
            page: 1,
            pageSize: 20,
            items: [
                {
                    id: 1,
                    name: 'Acme Credit Scoring',
                    riskLevel: 'Medium',
                    riskLabel: 'Limited risk',
                    organizationId: 1,
                    ownerId: 1,
                    ownerEmail: 'alice@acme.test',
                    version: 1,
                },
                {
                    id: 2,
                    name: 'Acme CV Screening',
                    riskLevel: 'High',
                    riskLabel: 'High risk',
                    organizationId: 1,
                    ownerId: 1,
                    ownerEmail: 'alice@acme.test',
                    version: 1,
                },
                {
                    id: 3,
                    name: 'Acme Chat Assistant',
                    riskLevel: 'Low',
                    riskLabel: 'Low risk',
                    organizationId: 1,
                    ownerId: 1,
                    ownerEmail: 'alice@acme.test',
                    version: 1,
                },
                {
                    id: 4,
                    name: 'Acme Fraud Triage',
                    riskLevel: 'Medium',
                    riskLabel: 'Limited risk',
                    organizationId: 1,
                    ownerId: 1,
                    ownerEmail: 'alice@acme.test',
                    version: 1,
                },
                {
                    id: 5,
                    name: 'Acme Demand Forecast',
                    riskLevel: 'Low',
                    riskLabel: 'Low risk',
                    organizationId: 1,
                    ownerId: 1,
                    ownerEmail: 'alice@acme.test',
                    version: 1,
                },
            ],
        });
    });

    it('returns only Globex systems to bob', async () => {
        const response = await listAs('bob@globex.test');

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.governSystems.total).toBe(5);
        expect(response.body.data.governSystems.items.map((item) => item.id)).toEqual([7, 8, 9, 10, 11]);
        expect(response.body.data.governSystems.items.map((item) => item.organizationId)).toEqual([2, 2, 2, 2, 2]);
        expect(response.body.data.governSystems.items.map((item) => item.ownerEmail)).toEqual(
            Array(5).fill('bob@globex.test'),
        );
    });

    it('orders the page the same way on every call', async () => {
        const [first, second] = await Promise.all([listAs('alice@acme.test'), listAs('alice@acme.test')]);

        expect(first.body.data.governSystems.items).toEqual(second.body.data.governSystems.items);
        expect(first.body.data.governSystems.items.map((item) => item.id)).toEqual([1, 2, 3, 4, 5]);
    });

    it('pages through the organisation without changing the total', async () => {
        const firstPage = await listAs('alice@acme.test', { page: 1, pageSize: 2 });
        const secondPage = await listAs('alice@acme.test', { page: 2, pageSize: 2 });
        const thirdPage = await listAs('alice@acme.test', { page: 3, pageSize: 2 });

        expect(firstPage.body.data.governSystems.total).toBe(5);
        expect(firstPage.body.data.governSystems.page).toBe(1);
        expect(firstPage.body.data.governSystems.pageSize).toBe(2);
        expect(firstPage.body.data.governSystems.items.map((item) => item.id)).toEqual([1, 2]);

        expect(secondPage.body.data.governSystems.total).toBe(5);
        expect(secondPage.body.data.governSystems.page).toBe(2);
        expect(secondPage.body.data.governSystems.items.map((item) => item.id)).toEqual([3, 4]);

        expect(thirdPage.body.data.governSystems.items.map((item) => item.id)).toEqual([5]);
    });

    it('takes no organizationId argument in the schema', async () => {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .set('x-user-email', 'alice@acme.test')
            .send({ query: ARGUMENTS_QUERY });

        const field = response.body.data.__type.fields.find((candidate) => candidate.name === 'governSystems');
        expect(field.args.map((argument) => argument.name).sort()).toEqual(['page', 'pageSize']);
    });
});
