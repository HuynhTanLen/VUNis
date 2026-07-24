import axios from 'axios';

// Tạo 1 instance axios với cấu hình sẵn
const api = axios.create({
    baseURL: '/api',          // Dùng proxy, không hardcode URL
    withCredentials: true     // Gửi cookie theo mọi request
});

export default api;
