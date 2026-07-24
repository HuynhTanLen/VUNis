/**
 * @file permission.dto.js
 * @description DTO cho module Permission.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreatePermissionDTO {
    constructor(body) {
        this.code = body.code?.trim().toLowerCase() || '';
        this.displayName = body.displayName?.trim() || '';
        this.description = body.description?.trim() || '';
        this.resource = body.resource?.trim().toLowerCase() || '';
        this.action = body.action?.trim().toLowerCase() || '';
    }

    validate() {
        if (!this.code) {
            throw new ValidationError('Mã quyền (code) là bắt buộc (ví dụ: user:delete)');
        }
        if (!this.displayName) {
            throw new ValidationError('Tên hiển thị quyền (displayName) là bắt buộc');
        }
        if (!this.resource) {
            throw new ValidationError('Tài nguyên (resource) là bắt buộc');
        }
        if (!this.action) {
            throw new ValidationError('Hành động (action) là bắt buộc');
        }
        return this;
    }
}

class UpdatePermissionDTO {
    constructor(body) {
        this.displayName = body.displayName?.trim();
        this.description = body.description?.trim();
    }

    validate() {
        if (!this.displayName && this.description === undefined) {
            throw new ValidationError('Cần cung cấp tên hiển thị hoặc mô tả để cập nhật');
        }
        return this;
    }
}

module.exports = {
    CreatePermissionDTO,
    UpdatePermissionDTO
};
