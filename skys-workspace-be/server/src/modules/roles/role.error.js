/**
 * @file role.error.js
 * @description Lớp lỗi tùy chỉnh cho module Role.
 */
const { NotFoundError } = require('../../shared/errors/AppError');

class RoleNotFoundError extends NotFoundError {
    constructor() {
        super('Vai trò hệ thống');
    }
}

module.exports = {
    RoleNotFoundError
};
