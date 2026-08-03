/**
 * @file role.error.js
 * @description Định nghĩa các lớp lỗi tùy chỉnh cho module Role.
 */
const { AppError } = require('../../shared/errors/AppError');

class RoleNotFoundError extends AppError {
    constructor() {
        super('Vai trò không tồn tại trên hệ thống', 404, 'ROLE_NOT_FOUND');
    }
}

class SystemRoleProtectedError extends AppError {
    constructor() {
        super('Không thể chỉnh sửa hoặc xóa Vai trò mặc định của Hệ thống', 403, 'SYSTEM_ROLE_PROTECTED');
    }
}

class RoleCodeExistsError extends AppError {
    constructor() {
        super('Mã Vai trò này đã tồn tại trên hệ thống', 409, 'ROLE_CODE_EXISTS');
    }
}

module.exports = {
    RoleNotFoundError,
    SystemRoleProtectedError,
    RoleCodeExistsError
};
