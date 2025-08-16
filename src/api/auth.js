import axios from "axios";

// Base URL for your backend API
axios.defaults.baseURL = "https://institute-backend-n2n3.onrender.com";
// axios.defaults.baseURL = "http://localhost:5000";

// Validate token
export const validateToken = async (token) => {
  try {
    const response = await axios.get("/admin/validate", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // { valid: true/false }
  } catch (error) {
    throw error.response?.data || { message: "Token validation failed" };
  }
};

// Import login from login.js
