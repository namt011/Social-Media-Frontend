import axios from 'axios';
import Cookies from 'js-cookie';  // Import js-cookie

// Đảm bảo API_PATH được định nghĩa đúng trong tệp này hoặc được lấy từ một nơi khác
const API_PATH = "http://localhost:8080"; // Ví dụ URL cơ sở cho API của bạn

const axiosInstance = axios.create({
  baseURL: API_PATH, // Cấu hình baseURL từ API_PATH
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  config => {
    const token = Cookies.get('accessToken');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
    
  },
  error => {
    console.log(token);
    return Promise.reject(error);
  }
  
);

export default axiosInstance;