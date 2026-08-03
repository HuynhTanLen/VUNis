/**
 * @file role.dto.js
 * @description DTO và Validation cho module Role.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreateRoleDTO {
    constructor(body) {
        this.name = body.name?.trim();
        this.code = body.code?.trim().toUpperCase();
        this.description = body.description?.trim() || '';
        this.permissionCodes = Array.isArray(body.permissions) ? body.permissions : [];
    }

    validate() {
        if (!this.name) throw new ValidationError('Tên vai trò không được để trống');
        if (!this.code) throw new ValidationError('Mã vai trò không được để trống');
        return this;
    }
}

class UpdateRoleDTO {
    constructor(body) {
        if (body.name !== undefined) this.name = body.name?.trim();
        if (body.description !== undefined) this.description = body.description?.trim();
        if (body.permissions !== undefined && Array.isArray(body.permissions)) {
            this.permissionCodes = body.permissions;
        }
    }

    validate() {
        if (this.name !== undefined && !this.name) {
            throw new ValidationError('Tên vai trò không được để trống');
        }
        return this;
    }
}

module.exports = {
    CreateRoleDTO,
    UpdateRoleDTO
};
