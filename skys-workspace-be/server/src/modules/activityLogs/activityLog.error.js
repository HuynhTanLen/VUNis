/**
 * @file activityLog.error.js
 * @description Class lỗi tùy chỉnh cho module ActivityLog.
 */
const { NotFoundError } = require('../../shared/errors/AppError');

class ActivityLogNotFoundError extends NotFoundError {
    constructor() {
        super('Nhật ký hoạt động');
    }
}

module.exports = {
    ActivityLogNotFoundError
};
