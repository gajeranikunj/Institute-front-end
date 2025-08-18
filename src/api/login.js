import api from "./axiosInstance";

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/admin/login", { email, password });
    return response.data; // { _id, name, email, token }
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};
