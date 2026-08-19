import axiosClient from './axiosClient';

export const maintenanceApi = {
  list: (params) => axiosClient.get('/maintenance', { params }).then((r) => r.data),
  upcoming: (days) => axiosClient.get('/maintenance/upcoming', { params: { days } }).then((r) => r.data),
  create: (data) => axiosClient.post('/maintenance', data).then((r) => r.data),
};
