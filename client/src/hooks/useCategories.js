import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api/category';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
  });
}
