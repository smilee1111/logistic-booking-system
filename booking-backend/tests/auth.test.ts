import request from 'supertest';
import app from '../src/app';
import { connectTestDb, disconnectTestDb, clearTestDb } from './testDb';
import { registerUser, type TestUser } from './helpers';

jest.mock('../src/utils/captcha', () => ({
    verifyCaptcha: jest.fn().mockResolvedValue(true),
}));

// The rate limiter is real, working middleware — tests just make many auth
// calls back-to-back in one process, which isn't a production scenario worth
// baking a NODE_ENV bypass into the actual middleware for. Mocked here only.
jest.mock('../src/middlewares/rateLimiter', () => ({
    authRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const validUser: TestUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    password: 'Str0ng!Passw0rd',
    phoneNumber: '9800000000',
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

describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
        const res = await registerUser(validUser);
        expect(res.status).toBe(201);
        expect(res.body.user.email).toBe(validUser.email);
        expect(res.body.user.role).toBe('user');
    });

    it('rejects a duplicate email/username', async () => {
        await registerUser(validUser);
        const res = await registerUser(validUser);
        expect(res.status).toBe(409);
    });

    it('rejects a mass-assignment attempt on role', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...validUser, role: 'admin' });
        expect(res.status).toBe(400);
    });

    it('rejects a weak password', async () => {
        const res = await registerUser({ ...validUser, password: 'weak' });
        expect(res.status).toBe(400);
        expect(res.body.errors.password).toBeDefined();
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await registerUser(validUser);
    });

    it('rejects the wrong password with a generic message', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: validUser.email, password: 'WrongPassword1!', captchaToken: 'test' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('rejects a nonexistent email with the same generic message (no user enumeration)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: validUser.password, captchaToken: 'test' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('logs in successfully and sets httpOnly session cookies', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: validUser.email, password: validUser.password, captchaToken: 'test' });

        expect(res.status).toBe(200);
        const cookies = res.headers['set-cookie'] as unknown as string[];
        const accessCookie = cookies.find((c) => c.startsWith('accessToken='));
        expect(accessCookie).toBeDefined();
        expect(accessCookie).toContain('HttpOnly');
        expect(accessCookie).toContain('SameSite=Strict');
    });

    it('locks the account after 5 failed attempts, even with the correct password on the 6th', async () => {
        for (let i = 0; i < 5; i++) {
            // eslint-disable-next-line no-await-in-loop
            await request(app)
                .post('/api/auth/login')
                .send({ email: validUser.email, password: 'WrongPassword1!', captchaToken: 'test' });
        }

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: validUser.email, password: validUser.password, captchaToken: 'test' });

        expect(res.status).toBe(423);
    });
});
