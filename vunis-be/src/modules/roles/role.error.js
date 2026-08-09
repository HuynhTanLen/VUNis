/**
 * @file role.error.js
 * @description Định nghĩa các lớp lỗi tùy chỉnh cho module Role.
 */
const { AppError } = require('../../shared/errors/AppError');

class RoleNotFoundError extends AppError {
    constructor() {
        super('Role not found in the system', 404, 'ROLE_NOT_FOUND');
    }
}

class SystemRoleProtectedError extends AppError {
    constructor() {
        super('Cannot edit or delete a protected System Role', 403, 'SYSTEM_ROLE_PROTECTED');
    }
}

class RoleCodeExistsError extends AppError {
    constructor() {
        super('This Role code already exists in the system', 409, 'ROLE_CODE_EXISTS');
    }
}

module.exports = {
    RoleNotFoundError,
    SystemRoleProtectedError,
    RoleCodeExistsError
};
