import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEquipmentList } from '../useEquipmentList';
import { equipmentApi } from '../../api/equipment';

vi.mock('../../api/equipment', () => ({
  equipmentApi: {
    list: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useEquipmentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches equipment list with the given filters', async () => {
    const mockData = { items: [{ _id: '1', name: 'Máy khoan' }], total: 1, page: 1, totalPages: 1 };
    equipmentApi.list.mockResolvedValue(mockData);

    const filters = { category: '', status: 'active', site: '', search: '', page: 1, limit: 15 };
    const { result } = renderHook(() => useEquipmentList(filters), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(equipmentApi.list).toHaveBeenCalledWith(filters);
    expect(result.current.data).toEqual(mockData);
  });

  it('exposes an error state when the request fails', async () => {
    equipmentApi.list.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(
      () => useEquipmentList({ page: 1, limit: 15 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
