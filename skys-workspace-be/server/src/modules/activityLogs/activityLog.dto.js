/**
 * @file activityLog.dto.js
 * @description DTO cho module ActivityLog.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreateActivityLogDTO {
    constructor(body) {
        this.action = body.action?.trim() || '';
        this.type = body.type?.trim() || 'system';
        this.projectId = body.projectId || body.project || null;
    }

    validate() {
        if (!this.action) {
            throw new ValidationError('Mô tả hành động là bắt buộc');
        }
        if (!this.projectId) {
            throw new ValidationError('Mã dự án (projectId) là bắt buộc');
        }
        return this;
    }
}

module.exports = {
    CreateActivityLogDTO
};
