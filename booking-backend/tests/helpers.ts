import request from 'supertest';
import app from '../src/app';

export interface TestUser {
    fullName: string;
    email: string;
    username: string;
    password: string;
    phoneNumber: string;
}

export function registerUser(user: TestUser) {
    return request(app).post('/api/auth/register').send(user);
}

export async function loginUser(email: string, password: string): Promise<string> {
    const res = await request(app).post('/api/auth/login').send({ email, password, captchaToken: 'test' });
    const cookies = res.headers['set-cookie'] as unknown as string[];
    const accessTokenCookie = cookies?.find((c) => c.startsWith('accessToken='));
    if (!accessTokenCookie) {
        throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
    }
    return accessTokenCookie.split(';')[0];
}

export async function registerAndLogin(user: TestUser): Promise<string> {
    await registerUser(user);
    return loginUser(user.email, user.password);
}
