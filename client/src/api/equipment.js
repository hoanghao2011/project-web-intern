import axiosClient from './axiosClient';

export const equipmentApi = {
  list: (params) => axiosClient.get('/equipment', { params }).then((r) => r.data),
  getById: (id) => axiosClient.get(`/equipment/${id}`).then((r) => r.data),
  getByCode: (code) => axiosClient.get(`/equipment/code/${code}`).then((r) => r.data),
  create: (formData) =>
    axiosClient
      .post('/equipment', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  update: (id, formData) =>
    axiosClient
      .put(`/equipment/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  remove: (id) => axiosClient.delete(`/equipment/${id}`).then((r) => r.data),
  changeStatus: (id, status) =>
    axiosClient.patch(`/equipment/${id}/status`, { status }).then((r) => r.data),
};
