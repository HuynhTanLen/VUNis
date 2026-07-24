/**
 * @file AppError.js
 * @description Lớp lỗi cơ sở (Base Error Class) cho toàn bộ ứng dụng.
 * Tất cả các lỗi tùy chỉnh trong từng module đều kế thừa từ class này.
 * 
 * Lợi ích so với new Error() thông thường:
 * - Tự động đính kèm statusCode HTTP
 * - Có mã lỗi (code) để Frontend dễ phân biệt
 * - Có thể kiểm tra lỗi bằng: if (err instanceof AppError)
 */
class AppError extends Error {
    /**
     * @param {string} message - Thông báo lỗi
     * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 500...)
     * @param {string} code - Mã lỗi duy nhất (VD: 'AUTH_EMAIL_EXISTS')
     */
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = this.constructor.name;
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Tài nguyên') {
        super(`${resource} không tồn tại`, 404, 'NOT_FOUND');
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Không có quyền truy cập') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Không đủ quyền hạn') {
        super(message, 403, 'FORBIDDEN');
    }
}

class ValidationError extends AppError {
    constructor(message = 'Dữ liệu không hợp lệ') {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Dữ liệu bị trùng lặp') {
        super(message, 409, 'CONFLICT');
    }
}

module.exports = { 
    AppError, NotFoundError, UnauthorizedError, 
    ForbiddenError, ValidationError, ConflictError 
};
