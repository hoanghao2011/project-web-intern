import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders the Vietnamese label for a known status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
  });

  it('applies the color class associated with the status', () => {
    render(<StatusBadge status="broken" />);
    const badge = screen.getByText('Hỏng hóc');
    expect(badge.className).toContain('bg-rose-100');
  });

  it('falls back to the raw status string when unknown', () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText('unknown_status')).toBeInTheDocument();
  });
});
