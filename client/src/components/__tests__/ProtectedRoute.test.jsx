import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

const mockUseAuth = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(roles) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route element={<ProtectedRoute roles={roles} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading state while auth is resolving', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    renderWithRouter();
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });

  it('redirects to /login when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    renderWithRouter();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to / when the user role is not permitted', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'staff' }, loading: false });
    renderWithRouter(['admin']);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders the protected content when authorized', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin' }, loading: false });
    renderWithRouter(['admin']);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders the protected content when no roles restriction is set', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'staff' }, loading: false });
    renderWithRouter();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
