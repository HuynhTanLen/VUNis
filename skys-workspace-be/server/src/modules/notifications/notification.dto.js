/**
 * @file notification.dto.js
 * @description Data Transfer Objects cho module Notification.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreateNotificationDTO {
    constructor(body) {
        this.message = body.message?.trim() || '';
        this.type = body.type || 'system';
        this.receiverId = body.receiverId || body.receiver || null;
        this.relatedProject = body.relatedProject || null;
        this.relatedTask = body.relatedTask || null;
    }

    validate() {
        if (!this.message) {
            throw new ValidationError('Nội dung thông báo là bắt buộc');
        }
        if (!this.receiverId) {
            throw new ValidationError('Người nhận thông báo (receiverId) là bắt buộc');
        }
        return this;
    }
}

module.exports = {
    CreateNotificationDTO
};
