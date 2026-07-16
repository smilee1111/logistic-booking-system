import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import { AuthProvider } from '@/context/AuthContext';

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/app/actions/auth', () => ({
    loginAction: jest.fn(),
    verifyMfaLoginAction: jest.fn(),
}));

// The real widget loads Google's script over the network, which jsdom can't do.
jest.mock('react-google-recaptcha', () => {
    return function MockReCAPTCHA() {
        return <div data-testid="recaptcha-stub" />;
    };
});

describe('LoginPage', () => {
    it('renders email and password fields', () => {
        render(
            <AuthProvider>
                <LoginPage />
            </AuthProvider>,
        );

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('shows validation errors on empty submit without calling the server action', async () => {
        const { loginAction } = jest.requireMock('@/app/actions/auth');
        const user = userEvent.setup();
        render(
            <AuthProvider>
                <LoginPage />
            </AuthProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
        expect(screen.getByText('Please complete the CAPTCHA')).toBeInTheDocument();
        expect(loginAction).not.toHaveBeenCalled();
    });
});
