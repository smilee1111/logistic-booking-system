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
}));

const userA: TestUser = {
    fullName: 'User A',
    email: 'usera@example.com',
    username: 'usera',
    password: 'Str0ng!Passw0rd',
    phoneNumber: '9800000010',
};
const userB: TestUser = {
    fullName: 'User B',
    email: 'userb@example.com',
    username: 'userb',
    password: 'Str0ng!Passw0rd',
    phoneNumber: '9800000011',
};
const adminUser: TestUser = {
    fullName: 'Admin',
    email: 'admin@example.com',
    username: 'admintester',
    password: 'Str0ng!Passw0rd',
    phoneNumber: '9800000012',
};

beforeAll(async () => {
    await connectTestDb();
});

afterAll(async () => {
    await disconnectTestDb();
});

beforeEach(async () => {
    await clearTestDb();
});

async function createResource(): Promise<string> {
    await registerUser(adminUser);
    await User.updateOne({ email: adminUser.email }, { role: 'admin' });
    const adminCookie = await loginUser(adminUser.email, adminUser.password);

    const res = await request(app)
        .post('/api/resources')
        .set('Cookie', adminCookie)
        .send({ name: 'Test Room', description: 'x', category: 'room', location: 'x', capacity: 2 });
    return res.body.resource.id as string;
}

describe('IDOR fix on GET /api/bookings/:id', () => {
    it('lets the owner read their own booking', async () => {
        const resourceId = await createResource();
        const cookieA = await registerAndLogin(userA);

        const created = await request(app)
            .post('/api/bookings')
            .set('Cookie', cookieA)
            .send({
                resourceId,
                startTime: '2027-01-01T10:00:00.000Z',
                endTime: '2027-01-01T11:00:00.000Z',
                contactPhone: '9811111111',
            });

        const res = await request(app)
            .get(`/api/bookings/${created.body.booking.id}`)
            .set('Cookie', cookieA);
        expect(res.status).toBe(200);
    });

    it('blocks a different user from reading someone else’s booking', async () => {
        const resourceId = await createResource();
        const cookieA = await registerAndLogin(userA);
        const cookieB = await registerAndLogin(userB);

        const created = await request(app)
            .post('/api/bookings')
            .set('Cookie', cookieA)
            .send({
                resourceId,
                startTime: '2027-01-02T10:00:00.000Z',
                endTime: '2027-01-02T11:00:00.000Z',
                contactPhone: '9811111111',
            });

        const res = await request(app)
            .get(`/api/bookings/${created.body.booking.id}`)
            .set('Cookie', cookieB);
        expect(res.status).toBe(404);
    });

    it('still lets an admin read any booking', async () => {
        const resourceId = await createResource();
        const cookieA = await registerAndLogin(userA);
        const adminCookie = await loginUser(adminUser.email, adminUser.password);

        const created = await request(app)
            .post('/api/bookings')
            .set('Cookie', cookieA)
            .send({
                resourceId,
                startTime: '2027-01-03T10:00:00.000Z',
                endTime: '2027-01-03T11:00:00.000Z',
                contactPhone: '9811111111',
            });

        const res = await request(app)
            .get(`/api/bookings/${created.body.booking.id}`)
            .set('Cookie', adminCookie);
        expect(res.status).toBe(200);
    });
});

describe('Overlap check on POST /api/bookings', () => {
    it('rejects an overlapping booking for the same resource', async () => {
        const resourceId = await createResource();
        const cookieA = await registerAndLogin(userA);
        const cookieB = await registerAndLogin(userB);

        await request(app)
            .post('/api/bookings')
            .set('Cookie', cookieA)
            .send({
                resourceId,
                startTime: '2027-02-01T10:00:00.000Z',
                endTime: '2027-02-01T11:00:00.000Z',
                contactPhone: '9811111111',
            });

        const overlapRes = await request(app)
            .post('/api/bookings')
            .set('Cookie', cookieB)
            .send({
                resourceId,
                startTime: '2027-02-01T10:30:00.000Z',
                endTime: '2027-02-01T11:30:00.000Z',
                contactPhone: '9822222222',
            });
        expect(overlapRes.status).toBe(409);
    });

    it('allows a non-overlapping booking for the same resource', async () => {
        const resourceId = await createResource();
        const cookieA = await registerAndLogin(userA);
        const cookieB = await registerAndLogin(userB);

        await request(app)
            .post('/api/bookings')
            .set('Cookie', cookieA)
            .send({
                resourceId,
                startTime: '2027-03-01T10:00:00.000Z',
                endTime: '2027-03-01T11:00:00.000Z',
                contactPhone: '9811111111',
            });

        const res = await request(app)
            .post('/api/bookings')
            .set('Cookie', cookieB)
            .send({
                resourceId,
                startTime: '2027-03-01T12:00:00.000Z',
                endTime: '2027-03-01T13:00:00.000Z',
                contactPhone: '9822222222',
            });
        expect(res.status).toBe(201);
    });
});
