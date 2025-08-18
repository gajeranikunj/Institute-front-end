import api from "./axiosInstance";

// Add faculty
export const addfaculty = async (data) => {
  try {
    const response = await api.post("/faculty/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Faculty creation failed" };
  }
};

// Get all faculty
export const getallfaculty = async () => {
  try {
    const response = await api.get("/faculty");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch faculty" };
  }
};
