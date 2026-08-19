import axiosClient from './axiosClient';

export const categoryApi = {
  list: () => axiosClient.get('/categories').then((r) => r.data),
  create: (data) => axiosClient.post('/categories', data).then((r) => r.data),
  update: (id, data) => axiosClient.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/categories/${id}`).then((r) => r.data),
};
