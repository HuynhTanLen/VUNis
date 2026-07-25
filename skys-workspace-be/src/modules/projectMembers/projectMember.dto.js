/**
 * @file projectMember.dto.js
 * @description DTO cho module ProjectMember.
 */
const { ValidationError } = require('../../shared/errors/AppError');

class AddProjectMemberDTO {
    constructor(body) {
        this.email = body.email?.trim() || '';
        this.projectId = body.projectId || body.project || null;
        this.role = body.role?.trim() || 'MEMBER';
    }

    validate() {
        if (!this.email) {
            throw new ValidationError('Email thành viên là bắt buộc');
        }
        if (!this.projectId) {
            throw new ValidationError('Mã dự án (projectId) là bắt buộc');
        }
        return this;
    }
}

class UpdateMemberRoleDTO {
    constructor(body) {
        this.role = body.role?.trim();
    }

    validate() {
        if (!this.role) {
            throw new ValidationError('Vai trò dự án mới (role) là bắt buộc');
        }
        return this;
    }
}

module.exports = {
    AddProjectMemberDTO,
    UpdateMemberRoleDTO
};
