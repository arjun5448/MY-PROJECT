import api from "./axiosConfig";

export const signupUser = async (payload) => {
  const response = await api.post("/auth/signup", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};
