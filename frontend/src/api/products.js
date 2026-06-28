import client from './client';

export const productApi = {
  list: () => client.get('/products').then((r) => r.data),
  get: (id) => client.get(`/products/${id}`).then((r) => r.data),
  create: (data) => client.post('/products', data).then((r) => r.data),
  update: (id, data) => client.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/products/${id}`),
};
