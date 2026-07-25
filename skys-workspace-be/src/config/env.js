/**
 * @file env.js
 * @description Quản lý và xác thực biến môi trường.
 * Tập trung toàn bộ biến .env vào một nơi duy nhất.
 * Khi cần dùng biến nào, import từ file này thay vì gọi process.env trực tiếp.
 */
const dotenv = require('dotenv');
const path = require('path');

// Load file .env từ thư mục gốc của server
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const env = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ks_platform',
    JWT_SECRET: process.env.JWT_SECRET || 'default_secret_change_me',
    NODE_ENV: process.env.NODE_ENV || 'development',
};

// Kiểm tra các biến bắt buộc
const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
requiredVars.forEach((key) => {
    if (!process.env[key]) {
        console.warn(`⚠️  Cảnh báo: Biến môi trường ${key} chưa được cấu hình trong file .env`);
    }
});

module.exports = env;
