// src/axiosInstance.js
import axios from 'axios';

// Create an Axios instance with a default base URL
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API, // Replace with your desired base URL
  // Optionally, you can set other default configurations here
  // headers: { 'Content-Type': 'application/json' }
});

export default axiosInstance;
