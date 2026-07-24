const { ValidationError } = require('../../shared/errors/AppError');

class CreateSprintDTO {
    constructor(body) {
        this.name = body.name?.trim();
        this.startDate = body.startDate;
        this.endDate = body.endDate;
    }

    validate() {
        if (!this.name) {
            throw new ValidationError('Tên Sprint là bắt buộc');
        }
        if (!this.startDate) {
            throw new ValidationError('Ngày bắt đầu là bắt buộc');
        }
        if (!this.endDate) {
            throw new ValidationError('Ngày kết thúc là bắt buộc');
        }
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new ValidationError('Ngày bắt đầu hoặc ngày kết thúc không hợp lệ');
        }
        if (start >= end) {
            throw new ValidationError('Ngày bắt đầu phải trước ngày kết thúc');
        }
        return this;
    }
}

module.exports = { CreateSprintDTO };
