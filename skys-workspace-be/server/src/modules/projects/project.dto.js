const { ValidationError } = require('../../shared/errors/AppError');

class CreateProjectDTO {
    constructor(body) {
        this.name = body.name?.trim();
        this.description = body.description?.trim() || '';
        this.budget = body.budget !== undefined ? Number(body.budget) : 0;
        this.durationWeeks = body.durationWeeks !== undefined ? Number(body.durationWeeks) : null;
        this.startDate = body.startDate ? new Date(body.startDate) : null;
        this.priority = body.priority?.trim() || 'Medium';

        // Tự động tính endDate từ startDate + durationWeeks
        if (this.startDate && this.durationWeeks) {
            const end = new Date(this.startDate);
            end.setDate(end.getDate() + this.durationWeeks * 7);
            this.endDate = end;
        } else {
            this.endDate = body.endDate ? new Date(body.endDate) : null;
        }
    }

    validate() {
        if (!this.name) {
            throw new ValidationError('Tên dự án là bắt buộc');
        }
        if (isNaN(this.budget) || this.budget < 0) {
            throw new ValidationError('Ngân sách dự án phải là số không âm');
        }
        if (this.durationWeeks !== null && (isNaN(this.durationWeeks) || this.durationWeeks <= 0)) {
            throw new ValidationError('Số tuần dự án phải là số nguyên dương');
        }
        if (this.startDate && this.endDate && this.endDate < this.startDate) {
            throw new ValidationError('Ngày kết thúc phải sau ngày bắt đầu dự án');
        }
        return this;
    }
}

class UpdateProjectDTO {
    constructor(body) {
        if (body.name !== undefined) this.name = body.name?.trim();
        if (body.description !== undefined) this.description = body.description?.trim();
        if (body.budget !== undefined) this.budget = Number(body.budget);
        if (body.durationWeeks !== undefined) this.durationWeeks = body.durationWeeks !== null ? Number(body.durationWeeks) : null;
        if (body.startDate !== undefined) this.startDate = body.startDate ? new Date(body.startDate) : null;
        if (body.endDate !== undefined) this.endDate = body.endDate ? new Date(body.endDate) : null;
        if (body.status !== undefined) this.status = body.status?.trim();
        if (body.priority !== undefined) this.priority = body.priority?.trim();

        // Nếu cập nhật startDate + durationWeeks => tự tính endDate
        if (this.startDate && this.durationWeeks) {
            const end = new Date(this.startDate);
            end.setDate(end.getDate() + this.durationWeeks * 7);
            this.endDate = end;
        }
    }

    validate() {
        if (this.name !== undefined && !this.name) {
            throw new ValidationError('Tên dự án không được để trống');
        }
        if (this.budget !== undefined && (isNaN(this.budget) || this.budget < 0)) {
            throw new ValidationError('Ngân sách dự án phải là số không âm');
        }
        if (this.durationWeeks !== undefined && this.durationWeeks !== null && (isNaN(this.durationWeeks) || this.durationWeeks <= 0)) {
            throw new ValidationError('Số tuần dự án phải là số nguyên dương');
        }
        if (this.status !== undefined && !['active', 'paused', 'done'].includes(this.status)) {
            throw new ValidationError('Trạng thái dự án không hợp lệ');
        }
        if (this.priority !== undefined && !['Low', 'Medium', 'High'].includes(this.priority)) {
            throw new ValidationError('Độ ưu tiên dự án không hợp lệ');
        }
        if (this.startDate && this.endDate && this.endDate < this.startDate) {
            throw new ValidationError('Ngày kết thúc phải sau ngày bắt đầu dự án');
        }
        return this;
    }
}

module.exports = { CreateProjectDTO, UpdateProjectDTO };

