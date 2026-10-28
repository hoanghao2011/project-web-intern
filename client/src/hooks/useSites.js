import { useQuery } from '@tanstack/react-query';
import { siteApi } from '../api/site';

export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: siteApi.list,
  });
}
