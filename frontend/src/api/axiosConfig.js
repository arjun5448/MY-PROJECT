import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("licUser");

  if (user) {
    const parsedUser = JSON.parse(user);
    config.headers["X-User-Id"] = parsedUser.id;
  }

  return config;
});

export default api;
