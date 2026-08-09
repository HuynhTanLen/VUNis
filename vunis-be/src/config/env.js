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
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};

// Kiểm tra các biến bắt buộc (Fail-Fast nếu thiếu)
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_PASSWORD'];
requiredVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`FATAL ERROR: Biến môi trường bắt buộc "${key}" chưa được cấu hình.`);
        process.exit(1);
    }
});

module.exports = env;

