import axiosClient from './axiosClient';

export const siteApi = {
  list: () => axiosClient.get('/sites').then((r) => r.data),
  getById: (id) => axiosClient.get(`/sites/${id}`).then((r) => r.data),
  create: (data) => axiosClient.post('/sites', data).then((r) => r.data),
  update: (id, data) => axiosClient.put(`/sites/${id}`, data).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/sites/${id}`).then((r) => r.data),
};
