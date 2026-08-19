import axiosClient from './axiosClient';

export const transactionApi = {
  list: (params) => axiosClient.get('/transactions', { params }).then((r) => r.data),
  stockIn: (data) => axiosClient.post('/transactions/stock-in', data).then((r) => r.data),
  stockOut: (data) => axiosClient.post('/transactions/stock-out', data).then((r) => r.data),
  transfer: (data) => axiosClient.post('/transactions/transfer', data).then((r) => r.data),
};
