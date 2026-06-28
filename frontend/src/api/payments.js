import client from './client';

export const paymentApi = {
  pay: (data) => client.post('/payments', data).then((r) => r.data),
  getByOrder: (orderId) =>
    client.get(`/payments/order/${orderId}`).then((r) => r.data),
};
