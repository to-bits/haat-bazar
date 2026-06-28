import client from './client';

export const orderApi = {
  getCart: (userId) => client.get(`/cart/${userId}`).then((r) => r.data),
  addToCart: (userId, item) =>
    client.post(`/cart/${userId}/items`, item).then((r) => r.data),
  updateCartItem: (userId, productId, quantity) =>
    client
      .put(`/cart/${userId}/items/${productId}`, null, { params: { quantity } })
      .then((r) => r.data),
  removeCartItem: (userId, productId) =>
    client.delete(`/cart/${userId}/items/${productId}`).then((r) => r.data),
  clearCart: (userId) => client.delete(`/cart/${userId}`),

  checkout: (userId, paymentMethod) =>
    client
      .post(`/orders/checkout/${userId}`, { paymentMethod })
      .then((r) => r.data),
  getOrder: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  listUserOrders: (userId) =>
    client.get(`/orders/user/${userId}`).then((r) => r.data),
  updateStatus: (id, status) =>
    client.patch(`/orders/${id}/status`, null, { params: { status } })
      .then((r) => r.data),
};
