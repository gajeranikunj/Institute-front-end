import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "https://institute-backend-n2n3.onrender.com",
  // baseURL: "http://localhost:5000",  // switch for local
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
