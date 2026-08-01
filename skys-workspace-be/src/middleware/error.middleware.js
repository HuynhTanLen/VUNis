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
 * Mọi lỗi throw ra trong controller hoặc Prisma đều được chuẩn hóa thông báo tiếng Việt tại đây.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    let userMessage = err.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại!';

    // 1. Xử lý lỗi Prisma Known Request Error (Ví dụ: Trùng lặp Unique, Khóa ngoại)
    if (err.code && err.code.startsWith('P')) {
        statusCode = 400;
        switch (err.code) {
            case 'P2002': {
                const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'Dữ liệu';
                userMessage = `Thông tin '${target}' đã tồn tại trong hệ thống, vui lòng nhập giá trị khác.`;
                break;
            }
            case 'P2003': {
                userMessage = 'Dữ liệu liên kết (người dùng/dự án) không tồn tại hoặc đã bị xóa.';
                break;
            }
            case 'P2025': {
                statusCode = 404;
                userMessage = 'Không tìm thấy dữ liệu yêu cầu hoặc bản ghi đã bị xóa.';
                break;
            }
            default:
                userMessage = `Lỗi thao tác cơ sở dữ liệu (Mã: ${err.code}). Vui lòng kiểm tra lại thông tin.`;
        }
    }

    // 2. Xử lý lỗi Prisma Validation Error (Thiếu trường bắt buộc hoặc sai kiểu dữ liệu)
    if (err.name === 'PrismaClientValidationError') {
        statusCode = 400;
        if (err.message.includes('Missing a required field')) {
            const match = err.message.match(/Missing a required field: `(\w+)`/);
            const fieldName = match ? match[1] : 'trường bắt buộc';
            userMessage = `Thiếu trường thông tin bắt buộc: '${fieldName}'. Vui lòng điền đầy đủ!`;
        } else {
            userMessage = 'Dữ liệu gửi lên không đúng định dạng hoặc thiếu trường bắt buộc.';
        }
    }

    console.error(`❌ [Error Handler] ${req.method} ${req.originalUrl}:`, err.message);

    res.status(statusCode).json({
        success: false,
        message: userMessage,
        code: err.code || err.name || 'INTERNAL_ERROR',
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

module.exports = { notFound, errorHandler };
