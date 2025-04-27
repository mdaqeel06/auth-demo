import axios from "axios";

const BACKEND_URL = "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: BACKEND_URL, // Base URL for all API calls
  headers: {
    "Content-Type": "application/json", // Default header for all requests
  },
  withCredentials: true, // Automatically include credentials (cookies) for all requests
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // Return the response if successful
  },
  (error) => {
    // Simply throw the error without retrying
    return Promise.reject(error);
  }
);

export default axiosInstance;
