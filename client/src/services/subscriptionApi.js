import { api } from './api';

export const subscriptionService = {
  getAll: () => api.get('/subscriptions'),
  getById: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
  renew: (id, data) => api.post(`/subscriptions/${id}/renew`, data),
  activateMaintenance: (id, data) => api.post(`/subscriptions/${id}/maintenance-contract`, data),
};
