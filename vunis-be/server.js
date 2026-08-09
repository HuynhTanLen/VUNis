/**
 * @file server.js
 * @description Entry point — Khởi động ứng dụng VUNIS Platform Backend.
 * File này CHỈ làm 2 việc: kết nối DB và khởi động HTTP server.
 * Mọi cấu hình khác nằm trong thư mục src/.
 */
const app = require('./src/app');
const env = require('./src/config/env');
const connectDatabase = require('./src/config/database');
const {initSocket} = require('./src/config/socket');
const http = require('http');

const startServer = async () => {
    // 1. Kết nối Database + Seed dữ liệu mặc định
    await connectDatabase();

    const server = http.createServer(app);
    initSocket(server);

    // 2. Khởi động HTTP Server
    server.listen(env.PORT, () => {
        console.log(`Server đang chạy tại: http://localhost:${env.PORT}`);
        console.log(`Health check:        http://localhost:${env.PORT}/api/health`);
        console.log(`Môi trường:          ${env.NODE_ENV}`);
        console.log(`Socket.io Server started`);
    });
};

startServer().catch((err) => {
    console.error('Lỗi không thể khởi động server:', err);
    process.exit(1);
});
