/**
 * @file projectPhase.error.js
 * @description Lớp lỗi tùy chỉnh cho module ProjectPhase.
 */
const { NotFoundError } = require('../../shared/errors/AppError');

class ProjectPhaseNotFoundError extends NotFoundError {
    constructor() {
        super('Giai đoạn dự án');
    }
}

module.exports = {
    ProjectPhaseNotFoundError
};
