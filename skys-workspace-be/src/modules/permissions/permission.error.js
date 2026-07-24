/**
 * @file permission.error.js
 * @description Lớp lỗi tùy chỉnh cho module Permission.
 */
const { NotFoundError } = require('../../shared/errors/AppError');

class PermissionNotFoundError extends NotFoundError {
    constructor() {
        super('Quyền hạn');
    }
}

module.exports = {
    PermissionNotFoundError
};
