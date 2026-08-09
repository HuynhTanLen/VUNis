/**
 * @file logger.middleware.js
 * @description Middleware ghi log mỗi request đến server.
 * Giúp debug và giám sát ứng dụng trong quá trình phát triển.
 */

const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;

    // Ghi log khi request đến
    console.log(`[${timestamp}] ${method} ${url}`);

    // Đo thời gian phản hồi
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusColor = status >= 400 ? '🔴' : '🟢';
        console.log(`  ${statusColor} ${status} — ${duration}ms`);
    });

    next();
};

module.exports = { logger };
