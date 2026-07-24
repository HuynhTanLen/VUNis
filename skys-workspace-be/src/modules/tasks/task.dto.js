const { ValidationError } = require('../../shared/errors/AppError');

class CreateTaskDTO {
    constructor(body) {
        this.title = body.title?.trim();
        this.status = body.status?.trim() || 'Todo';
        this.priority = body.priority?.trim() || 'medium';
        this.subtasks = Array.isArray(body.subtasks) ? body.subtasks : [];
        this.role = body.role?.trim();
        this.assigneeId = body.assigneeId || null;
        this.projectId = body.projectId;
        this.sprintId = body.sprintId || null;
        this.startDate = body.startDate ? new Date(body.startDate) : null;
        this.endDate = body.endDate ? new Date(body.endDate) : null;
        this.estimatedCost = body.estimatedCost !== undefined ? Number(body.estimatedCost) : 0;
        this.actualCost = body.actualCost !== undefined ? Number(body.actualCost) : 0;
    }

    validate() {
        if (!this.title) {
            throw new ValidationError('Tiêu đề công việc là bắt buộc');
        }
        if (!['Todo', 'InProgress', 'Done'].includes(this.status)) {
            throw new ValidationError('Trạng thái công việc không hợp lệ');
        }
        if (!['low', 'medium', 'high', 'urgent'].includes(this.priority)) {
            throw new ValidationError('Độ ưu tiên không hợp lệ');
        }
        if (!this.projectId) {
            throw new ValidationError('ID dự án là bắt buộc');
        }
        if (isNaN(this.estimatedCost) || this.estimatedCost < 0) {
            throw new ValidationError('Chi phí ước tính không hợp lệ hoặc không được âm');
        }
        if (isNaN(this.actualCost) || this.actualCost < 0) {
            throw new ValidationError('Chi phí thực tế không hợp lệ hoặc không được âm');
        }
        if (this.startDate && this.endDate && this.endDate < this.startDate) {
            throw new ValidationError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
        }
        return this;
    }
}

class UpdateTaskDTO {
    constructor(body) {
        if (body.title !== undefined) this.title = body.title?.trim();
        if (body.status !== undefined) this.status = body.status?.trim();
        if (body.priority !== undefined) this.priority = body.priority?.trim();
        if (body.subtasks !== undefined && Array.isArray(body.subtasks)) this.subtasks = body.subtasks;
        if (body.role !== undefined) this.role = body.role?.trim();
        if (body.sprintId !== undefined) this.sprint = body.sprintId || null;
        if (body.assigneeId !== undefined) this.assigneeId = body.assigneeId || null;
        if (body.startDate !== undefined) this.startDate = body.startDate ? new Date(body.startDate) : null;
        if (body.endDate !== undefined) this.endDate = body.endDate ? new Date(body.endDate) : null;
        if (body.estimatedCost !== undefined) this.estimatedCost = Number(body.estimatedCost);
        if (body.actualCost !== undefined) this.actualCost = Number(body.actualCost);
    }

    validate() {
        if (this.title !== undefined && !this.title) {
            throw new ValidationError('Tiêu đề công việc không được để trống');
        }
        if (this.status !== undefined && !['Todo', 'InProgress', 'Done'].includes(this.status)) {
            throw new ValidationError('Trạng thái công việc không hợp lệ');
        }
        if (this.priority !== undefined && !['low', 'medium', 'high', 'urgent'].includes(this.priority)) {
            throw new ValidationError('Độ ưu tiên không hợp lệ');
        }
        if (this.estimatedCost !== undefined && (isNaN(this.estimatedCost) || this.estimatedCost < 0)) {
            throw new ValidationError('Chi phí ước tính không được âm');
        }
        if (this.actualCost !== undefined && (isNaN(this.actualCost) || this.actualCost < 0)) {
            throw new ValidationError('Chi phí thực tế không được âm');
        }
        
        const start = this.startDate;
        const end = this.endDate;
        if (start && end && end < start) {
            throw new ValidationError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
        }
        return this;
    }
}

module.exports = { CreateTaskDTO, UpdateTaskDTO };
