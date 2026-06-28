import client from './client';

export const inventoryApi = {
  check: (productId) =>
    client.get(`/inventory/${productId}`).then((r) => r.data),
  set: (productId, quantity) =>
    client.put(`/inventory/${productId}`, { quantity }).then((r) => r.data),
  reduce: (productId, quantity) =>
    client.put(`/inventory/${productId}/reduce`, null, {
      params: { quantity },
    }),
  checkBatch: (items) =>
    client.post('/inventory/check-stock', items).then((r) => r.data),
  reduceBatch: (items) => client.post('/inventory/reduce', items),
};
