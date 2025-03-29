import axios from 'axios';

// Create an axios instance
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // Replace with your backend API URL
    headers: {
        'Content-Type': 'application/json', // Default content type
        // Add any other headers if needed, e.g., Authorization headers
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
});

export default axiosInstance;
