import api from "./axiosConfig";

export const getClientsByUser = async (userId) => {
  const response = await api.get(`/clients/${userId}`);
  return response.data;
};

export const addClient = async (userId, payload) => {
  const response = await api.post(`/clients/${userId}`, payload);
  return response.data;
};

export const updateClient = async (clientId, payload) => {
  const response = await api.put(`/clients/${clientId}`, payload);
  return response.data;
};

export const deleteClient = async (clientId) => {
  const response = await api.delete(`/clients/${clientId}`);
  return response.data;
};

export const sendReminder = async (clientId) => {
  const response = await api.post(`/clients/${clientId}/reminder`);
  return response.data;
};

export const markClientPaid = async (clientId) => {
  const response = await api.put(`/clients/${clientId}/mark-paid`);
  return response.data;
};
