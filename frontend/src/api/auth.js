import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data).then((r) => r.data),
  login: (data) => client.post('/auth/login', data).then((r) => r.data),
  validate: (token) =>
    client
      .get('/auth/validate', { params: { token } })
      .then((r) => r.data),
  // Resolve current user from JWT (returns { id, name, email, role }).
  me: () => client.get('/auth/me').then((r) => r.data),
};
