import { render, screen } from '@testing-library/react';
import { Nav } from '@/components/Nav';
import { AuthProvider } from '@/context/AuthContext';
import type { AuthUser } from '@/app/actions/auth';

jest.mock('@/app/actions/auth', () => ({
    logoutAction: jest.fn(),
}));

const regularUser: AuthUser = {
    id: '1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    username: 'jane',
    role: 'user',
};

const adminUser: AuthUser = { ...regularUser, id: '2', role: 'admin' };

describe('Nav', () => {
    it('shows Login/Register links when logged out', () => {
        render(
            <AuthProvider initialUser={null}>
                <Nav />
            </AuthProvider>,
        );

        expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
    });

    it('shows account links but not Admin for a regular user', () => {
        render(
            <AuthProvider initialUser={regularUser}>
                <Nav />
            </AuthProvider>,
        );

        expect(screen.getByText(/Hi, Jane Doe/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'My Bookings' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
    });

    it('shows the Admin link for an admin user', () => {
        render(
            <AuthProvider initialUser={adminUser}>
                <Nav />
            </AuthProvider>,
        );

        expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
    });
});
