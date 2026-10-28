import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { equipmentApi } from '../api/equipment';

export function equipmentKey(id) {
  return ['equipment', 'detail', id];
}

export function useEquipment(id) {
  return useQuery({
    queryKey: equipmentKey(id),
    queryFn: () => equipmentApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useChangeEquipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => equipmentApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}
