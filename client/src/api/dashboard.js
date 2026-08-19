import axiosClient from './axiosClient';

export const dashboardApi = {
  summary: () => axiosClient.get('/dashboard/summary').then((r) => r.data),
  statusDistribution: () => axiosClient.get('/dashboard/status-distribution').then((r) => r.data),
  categoryDistribution: () => axiosClient.get('/dashboard/category-distribution').then((r) => r.data),
  siteDistribution: () => axiosClient.get('/dashboard/site-distribution').then((r) => r.data),
  monthlyTrend: () => axiosClient.get('/dashboard/monthly-trend').then((r) => r.data),
  averageAge: () => axiosClient.get('/dashboard/average-age').then((r) => r.data),
};
