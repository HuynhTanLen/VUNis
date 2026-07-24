/**
 * @file auth.error.js
 * @description Các lỗi riêng của module Auth.
 * Kế thừa từ AppError để controller tự biết trả HTTP status nào.
 */
const { AppError, ConflictError, UnauthorizedError, NotFoundError } = require('../../shared/errors/AppError');

class EmailExistsError extends ConflictError {
    constructor() {
        super('Email này đã được đăng ký');
        this.code = 'AUTH_EMAIL_EXISTS';
    }
}

class InvalidCredentialsError extends UnauthorizedError {
    constructor() {
        super('Email hoặc mật khẩu không chính xác');
        this.code = 'AUTH_INVALID_CREDENTIALS';
    }
}

class UserNotFoundError extends NotFoundError {
    constructor() {
        super('Người dùng');
        this.code = 'AUTH_USER_NOT_FOUND';
    }
}

module.exports = { EmailExistsError, InvalidCredentialsError, UserNotFoundError };
