import axios from "axios";

// axios.defaults.baseURL = "https://institute-backend-n2n3.onrender.com";
axios.defaults.baseURL = "http://localhost:5000";

// ✅ Set token for all requests (if exists)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const addfaculty = async ({
  name,
  email,
  password,
  phone,
  photo,
  salary,
  totalStudents,
  address,
  expertise,
  experienceYears,
}) => {
  console.log({
    name,
    email,
    password,
    phone,
    photo,
    salary,
    totalStudents,
    address,
    expertise,
    experienceYears,
  });

  try {
    const response = await axios.post("/faculty/register", {
      name,
      email,
      password,
      phone,
      photo,
      salary,
      totalStudents,
      address,
      expertise,
      experienceYears,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data || { message: "data creatation failed" };
  }
};

export const getallfaculty = async () => {
  try {
    const response = await axios.get("/faculty");
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data || { message: "data get failed" };
  }
};
