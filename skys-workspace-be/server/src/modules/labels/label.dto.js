/**
 * @file label.dto.js
 * @description DTO cho module Label.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreateLabelDTO {
    constructor(body) {
        this.name = body.name?.trim() || '';
        this.color = body.color?.trim() || '#2563eb';
        this.projectId = body.projectId || body.project || null;
    }

    validate() {
        if (!this.name) {
            throw new ValidationError('Tên nhãn không được để trống');
        }
        if (!this.projectId) {
            throw new ValidationError('Mã dự án (projectId) là bắt buộc');
        }
        return this;
    }
}

class UpdateLabelDTO {
    constructor(body) {
        this.name = body.name?.trim();
        this.color = body.color?.trim();
    }

    validate() {
        if (!this.name && !this.color) {
            throw new ValidationError('Cần cung cấp tên hoặc màu nhãn để cập nhật');
        }
        return this;
    }
}

module.exports = {
    CreateLabelDTO,
    UpdateLabelDTO
};
