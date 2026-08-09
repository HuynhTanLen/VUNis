/**
 * @file projectMember.error.js
 * @description Lớp lỗi tùy chỉnh cho module ProjectMember.
 */
const { NotFoundError } = require('../../shared/errors/AppError');

class ProjectMemberNotFoundError extends NotFoundError {
    constructor() {
        super('Project Member');
    }
}

module.exports = {
    ProjectMemberNotFoundError
};
