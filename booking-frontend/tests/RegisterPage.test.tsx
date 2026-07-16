import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/register/page';

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/app/actions/auth', () => ({
    registerAction: jest.fn(),
}));

describe('RegisterPage', () => {
    it('renders all fields', () => {
        render(<RegisterPage />);

        expect(screen.getByLabelText('Full name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('shows validation errors on empty submit without calling the server action', async () => {
        const { registerAction } = jest.requireMock('@/app/actions/auth');
        const user = userEvent.setup();
        render(<RegisterPage />);

        await user.click(screen.getByRole('button', { name: 'Create account' }));

        expect(await screen.findByText('Full name is too short')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
        expect(registerAction).not.toHaveBeenCalled();
    });
});
