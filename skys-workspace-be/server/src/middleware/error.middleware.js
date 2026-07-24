/**
 * @file error.middleware.js
 * @description Middleware xử lý lỗi tập trung cho toàn bộ ứng dụng.
 * Đặt ở cuối chuỗi middleware trong app.js.
 */

/**
 * Middleware xử lý route không tồn tại (404).
 */
const notFound = (req, res, next) => {
    const error = new Error(`Không tìm thấy route: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Middleware xử lý lỗi toàn cục.
 * Mọi lỗi throw ra trong controller đều được bắt tại đây.
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

    console.error('❌ Error:', err.message);

    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

module.exports = { notFound, errorHandler };
