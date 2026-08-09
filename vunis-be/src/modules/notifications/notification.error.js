/**
 * @file notification.error.js
 * @description Lớp lỗi tùy chỉnh cho module Notification.
 */
const { NotFoundError } = require('../../shared/errors/AppError');

class NotificationNotFoundError extends NotFoundError {
    constructor() {
        super('Thông báo');
    }
}

module.exports = {
    NotificationNotFoundError
};
