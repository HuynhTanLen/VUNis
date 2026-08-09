/**
 * @file comment.error.js
 * @description Lớp lỗi tùy chỉnh cho module Comment.
 */
const { NotFoundError, ForbiddenError } = require('../../shared/errors/AppError');

class CommentNotFoundError extends NotFoundError {
    constructor() {
        super('Bình luận');
    }
}

class CommentPermissionError extends ForbiddenError {
    constructor(message = 'Bạn không có quyền chỉnh sửa hoặc xóa bình luận này') {
        super(message);
    }
}

module.exports = {
    CommentNotFoundError,
    CommentPermissionError
};
