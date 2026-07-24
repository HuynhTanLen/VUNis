/**
 * @file attachment.dto.js
 * @description DTO cho module Attachment.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreateAttachmentDTO {
    constructor(body) {
        this.filename = body.filename?.trim() || '';
        this.originalName = body.originalName?.trim() || '';
        this.url = body.url?.trim() || '';
        this.size = Number(body.size) || 0;
        this.mimeType = body.mimeType?.trim() || 'application/octet-stream';
        this.taskId = body.taskId || body.task || null;
    }

    validate() {
        if (!this.filename || !this.originalName) {
            throw new ValidationError('Tên file không được để trống');
        }
        if (!this.url) {
            throw new ValidationError('Đường dẫn file (url) là bắt buộc');
        }
        if (!this.taskId) {
            throw new ValidationError('Mã công việc (taskId) là bắt buộc');
        }
        return this;
    }
}

module.exports = {
    CreateAttachmentDTO
};
