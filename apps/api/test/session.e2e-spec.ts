import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from './e2e-app';
import { resetTestDatabase } from './e2e-database';

const WHO_AM_I = `
    query WhoAmI {
        governSystems {
            total
            items {
                id
                organizationId
            }
        }
    }
`;

const ME_QUERY = `
    query Me {
        me {
            id
            email
            organizationId
        }
    }
`;

const WEB_ORIGIN = 'http://localhost:4373';

describe('session resolution (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        await resetTestDatabase();
        app = await createE2eApp();
    });

    afterAll(async () => {
        await app.close();
    });

    function query(configure: (pending: request.Test) => request.Test) {
        return configure(request(app.getHttpServer()).post('/graphql')).send({ query: WHO_AM_I });
    }

    it('resolves the user from the x-user-email header', async () => {
        const response = await query((pending) => pending.set('x-user-email', 'alice@acme.test'));

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.governSystems.total).toBe(5);
        expect(response.body.data.governSystems.items.map((item) => item.id)).toEqual([1, 2, 3, 4, 5]);
    });

    it('resolves the user from the interview_user cookie', async () => {
        const response = await query((pending) => pending.set('Cookie', 'interview_user=bob%40globex.test'));

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.governSystems.total).toBe(5);
        expect(response.body.data.governSystems.items.map((item) => item.id)).toEqual([7, 8, 9, 10, 11]);
    });

    it('prefers the header over the cookie when both are present', async () => {
        const response = await query((pending) =>
            pending.set('x-user-email', 'alice@acme.test').set('Cookie', 'interview_user=bob%40globex.test'),
        );

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.governSystems.items.map((item) => item.organizationId)).toEqual([1, 1, 1, 1, 1]);
    });

    it('rejects an unknown email exactly as it rejects an anonymous request', async () => {
        const unknown = await query((pending) => pending.set('x-user-email', 'nobody@nowhere.test'));
        const anonymous = await query((pending) => pending);

        expect(unknown.body.data).toBeNull();
        expect(unknown.body.errors).toHaveLength(1);
        expect(unknown.body.errors[0].message).toBe('No organization in the current context');
        expect(anonymous.body.errors[0].message).toBe(unknown.body.errors[0].message);
    });

    it('reports the signed-in user through me', async () => {
        const alice = await request(app.getHttpServer())
            .post('/graphql')
            .set('x-user-email', 'alice@acme.test')
            .send({ query: ME_QUERY });
        const bob = await request(app.getHttpServer())
            .post('/graphql')
            .set('Cookie', 'interview_user=bob%40globex.test')
            .send({ query: ME_QUERY });

        expect(alice.body.data.me).toEqual({ id: 1, email: 'alice@acme.test', organizationId: 1 });
        expect(bob.body.data.me).toEqual({ id: 2, email: 'bob@globex.test', organizationId: 2 });
    });

    it('refuses me for an unknown email', async () => {
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .set('x-user-email', 'nobody@nowhere.test')
            .send({ query: ME_QUERY });

        expect(response.body.data).toBeNull();
        expect(response.body.errors[0].message).toBe('No user in the current context');
    });

    it('allows credentialed cross-origin calls from the web origin', async () => {
        const response = await request(app.getHttpServer())
            .options('/graphql')
            .set('Origin', WEB_ORIGIN)
            .set('Access-Control-Request-Method', 'POST');

        expect(response.headers['access-control-allow-origin']).toBe(WEB_ORIGIN);
        expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
});
