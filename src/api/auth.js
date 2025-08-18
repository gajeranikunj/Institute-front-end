import api from "./axiosInstance";

// Validate token
export const validateToken = async (token) => {
  try {
    const response = await api.get("/admin/validate", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // { valid: true/false }
  } catch (error) {
    throw error.response?.data || { message: "Token validation failed" };
  }
};
