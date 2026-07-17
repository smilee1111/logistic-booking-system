import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceForm } from '@/components/admin/ResourceForm';

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/app/actions/admin/resources', () => ({
    createResourceAction: jest.fn(),
    updateResourceAction: jest.fn(),
}));

describe('ResourceForm', () => {
    it('renders all fields with create-mode defaults', () => {
        render(<ResourceForm mode="create" />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Location')).toBeInTheDocument();
        expect(screen.getByLabelText('Capacity')).toHaveValue(1);
        expect(screen.getByRole('button', { name: 'Create resource' })).toBeInTheDocument();
    });

    it('shows validation errors on empty submit without calling the server action', async () => {
        const { createResourceAction } = jest.requireMock('@/app/actions/admin/resources');
        const user = userEvent.setup();
        render(<ResourceForm mode="create" />);

        await user.clear(screen.getByLabelText('Name'));
        await user.click(screen.getByRole('button', { name: 'Create resource' }));

        expect(await screen.findByText('Name is too short')).toBeInTheDocument();
        expect(screen.getByText('Location is required')).toBeInTheDocument();
        expect(createResourceAction).not.toHaveBeenCalled();
    });

    it('shows the edit-mode label when editing', () => {
        render(<ResourceForm mode="edit" resourceId="123" defaultValues={{ name: 'Existing Room' }} />);

        expect(screen.getByLabelText('Name')).toHaveValue('Existing Room');
        expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    });
});
