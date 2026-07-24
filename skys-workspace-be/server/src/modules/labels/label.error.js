/**
 * @file label.error.js
 * @description Lớp lỗi tùy chỉnh cho module Label.
 */
const { NotFoundError } = require('../../shared/errors/AppError');

class LabelNotFoundError extends NotFoundError {
    constructor() {
        super('Nhãn phân loại');
    }
}

module.exports = {
    LabelNotFoundError
};
