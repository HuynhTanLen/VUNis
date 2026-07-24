/**
 * @file comment.dto.js
 * @description Data Transfer Objects (DTO) và hàm validation cho module Comment.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class CreateCommentDTO {
    constructor(body) {
        this.content = body.content?.trim() || '';
        this.taskId = body.taskId || body.task || null;
    }

    validate() {
        if (!this.content) {
            throw new ValidationError('Nội dung bình luận không được để trống');
        }
        if (!this.taskId) {
            throw new ValidationError('Mã công việc (taskId) là bắt buộc');
        }
        return this;
    }
}

class UpdateCommentDTO {
    constructor(body) {
        this.content = body.content?.trim() || '';
    }

    validate() {
        if (!this.content) {
            throw new ValidationError('Nội dung bình luận không được để trống');
        }
        return this;
    }
}

module.exports = {
    CreateCommentDTO,
    UpdateCommentDTO
};
