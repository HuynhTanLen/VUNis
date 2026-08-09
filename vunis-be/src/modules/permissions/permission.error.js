/**
 * @file permission.error.js
 * @description Định nghĩa các lớp lỗi tùy chỉnh cho module Permission.
 */
const { AppError } = require('../../shared/errors/AppError');

class PermissionNotFoundError extends AppError {
    constructor() {
        super('Quyền hạn không tồn tại trên hệ thống', 404, 'PERMISSION_NOT_FOUND');
    }
}

module.exports = {
    PermissionNotFoundError
};
