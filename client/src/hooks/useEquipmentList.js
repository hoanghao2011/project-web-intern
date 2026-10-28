import { useQuery } from '@tanstack/react-query';
import { equipmentApi } from '../api/equipment';

export function equipmentListKey(filters) {
  return ['equipment', 'list', filters];
}

export function useEquipmentList(filters) {
  return useQuery({
    queryKey: equipmentListKey(filters),
    queryFn: () => equipmentApi.list(filters),
    placeholderData: (previousData) => previousData,
  });
}
