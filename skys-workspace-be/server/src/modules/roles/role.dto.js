/**
 * @file role.dto.js
 * @description DTO cho module Role.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreateRoleDTO {
    constructor(body) {
        this.name = body.name?.trim().toLowerCase() || '';
        this.displayName = body.displayName?.trim() || '';
        this.description = body.description?.trim() || '';
        this.permissions = Array.isArray(body.permissions) ? body.permissions : [];
        this.level = body.level !== undefined ? Number(body.level) : 10;
    }

    validate() {
        if (!this.name) {
            throw new ValidationError('Tên vai trò (name) là bắt buộc');
        }
        if (!this.displayName) {
            throw new ValidationError('Tên hiển thị (displayName) là bắt buộc');
        }
        if (isNaN(this.level) || this.level < 0 || this.level > 100) {
            throw new ValidationError('Cấp độ vai trò (level) phải từ 0 đến 100');
        }
        return this;
    }
}

class UpdateRoleDTO {
    constructor(body) {
        this.displayName = body.displayName?.trim();
        this.description = body.description?.trim();
        this.permissions = Array.isArray(body.permissions) ? body.permissions : undefined;
        this.level = body.level !== undefined ? Number(body.level) : undefined;
    }

    validate() {
        if (this.level !== undefined && (isNaN(this.level) || this.level < 0 || this.level > 100)) {
            throw new ValidationError('Cấp độ vai trò (level) phải từ 0 đến 100');
        }
        return this;
    }
}

module.exports = {
    CreateRoleDTO,
    UpdateRoleDTO
};
