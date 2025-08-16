import axios from "axios";

axios.defaults.baseURL = "https://institute-backend-n2n3.onrender.com";
// axios.defaults.baseURL = "http://localhost:5000";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post("/admin/login", { email, password });
    console.log(response);

    return response.data; // Will contain { _id, name, email, token }
  } catch (error) {
    console.log(error);

    throw error.response?.data || { message: "Login failed" };
  }
};
