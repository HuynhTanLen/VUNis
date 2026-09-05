/**
 * @file projectPhase.dto.js
 * @description DTO cho module ProjectPhase.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreateProjectPhaseDTO {
    constructor(body) {
        this.projectId = body.projectId || null;
        this.name = body.name?.trim() || '';
        this.order = body.order !== undefined && !isNaN(Number(body.order)) ? Number(body.order) : 0;
        this.startDate = body.startDate ? new Date(body.startDate) : null;
        this.endDate = body.endDate ? new Date(body.endDate) : null;
        this.estimatedCost = body.estimatedCost !== undefined && !isNaN(Number(body.estimatedCost)) ? Number(body.estimatedCost) : 0;
    }

    validate() {
        if (!this.projectId) {
            throw new ValidationError('Mã dự án (projectId) là bắt buộc');
        }
        if (!this.name) {
            throw new ValidationError('Tên giai đoạn không được để trống');
        }
        if (this.startDate && this.endDate && this.endDate < this.startDate) {
            throw new ValidationError('Ngày kết thúc phải sau ngày bắt đầu giai đoạn');
        }
        return this;
    }
}

class UpdateProjectPhaseDTO {
    constructor(body) {
        if (body.name !== undefined) this.name = body.name?.trim();
        if (body.order !== undefined) this.order = !isNaN(Number(body.order)) ? Number(body.order) : undefined;
        if (body.startDate !== undefined) this.startDate = body.startDate ? new Date(body.startDate) : null;
        if (body.endDate !== undefined) this.endDate = body.endDate ? new Date(body.endDate) : null;
        if (body.estimatedCost !== undefined) this.estimatedCost = !isNaN(Number(body.estimatedCost)) ? Number(body.estimatedCost) : undefined;
        if (body.actualCost !== undefined) this.actualCost = !isNaN(Number(body.actualCost)) ? Number(body.actualCost) : undefined;
    }

    validate() {
        if (this.name !== undefined && !this.name) {
            throw new ValidationError('Tên giai đoạn không được để trống');
        }
        if (this.startDate && this.endDate && this.endDate < this.startDate) {
            throw new ValidationError('Ngày kết thúc phải sau ngày bắt đầu giai đoạn');
        }
        return this;
    }
}

module.exports = {
    CreateProjectPhaseDTO,
    UpdateProjectPhaseDTO
};
