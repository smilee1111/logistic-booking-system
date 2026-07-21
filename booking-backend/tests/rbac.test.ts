import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { connectTestDb, disconnectTestDb, clearTestDb } from './testDb';
import { loginUser, registerAndLogin, registerUser, type TestUser } from './helpers';

jest.mock('../src/utils/captcha', () => ({
    verifyCaptcha: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/middlewares/rateLimiter', () => ({
    authRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
    generalRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const baseUser: TestUser = {
    fullName: 'RBAC Tester',
    email: 'rbac@example.com',
    username: 'rbactester',
    password: 'Str0ng!Passw0rd',
    phoneNumber: '9800000001',
};

async function makeAdminCookie(user: TestUser): Promise<string> {
    await registerUser(user);
    await User.updateOne({ email: user.email }, { role: 'admin' });
    // A fresh login is required — role is embedded in the JWT at login time,
    // so promoting the user in the DB alone wouldn't be reflected in an
    // already-issued token.
    return loginUser(user.email, user.password);
}

beforeAll(async () => {
    await connectTestDb();
});

afterAll(async () => {
    await disconnectTestDb();
});

beforeEach(async () => {
    await clearTestDb();
});

describe('RBAC', () => {
    it('rejects unauthenticated access to a protected route', async () => {
        const res = await request(app).get('/api/users/me');
        expect(res.status).toBe(401);
    });

    it('allows a logged-in user to access their own profile', async () => {
        const cookie = await registerAndLogin(baseUser);
        const res = await request(app).get('/api/users/me').set('Cookie', cookie);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(baseUser.email);
    });

    it('blocks a non-admin from listing all users', async () => {
        const cookie = await registerAndLogin(baseUser);
        const res = await request(app).get('/api/users').set('Cookie', cookie);
        expect(res.status).toBe(403);
    });

    it('blocks a non-admin from creating a resource', async () => {
        const cookie = await registerAndLogin(baseUser);
        const res = await request(app)
            .post('/api/resources')
            .set('Cookie', cookie)
            .send({ name: 'x', description: 'x', category: 'lab', location: 'x', capacity: 1 });
        expect(res.status).toBe(403);
    });

    it('allows an admin to list all users', async () => {
        const adminCookie = await makeAdminCookie(baseUser);
        const res = await request(app).get('/api/users').set('Cookie', adminCookie);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('allows an admin to create a resource', async () => {
        const adminCookie = await makeAdminCookie(baseUser);
        const res = await request(app)
            .post('/api/resources')
            .set('Cookie', adminCookie)
            .send({ name: 'Test Room', description: 'x', category: 'room', location: 'x', capacity: 2 });
        expect(res.status).toBe(201);
    });

    it('blocks an admin from changing their own role', async () => {
        const adminCookie = await makeAdminCookie(baseUser);
        const admin = await User.findOne({ email: baseUser.email });
        const res = await request(app)
            .patch(`/api/users/${admin!.id}/role`)
            .set('Cookie', adminCookie)
            .send({ role: 'user' });
        expect(res.status).toBe(400);
    });
});
