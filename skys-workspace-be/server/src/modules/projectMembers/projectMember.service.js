/**
 * @file projectMember.service.js
 * @description Tầng Service cho module ProjectMember.
 */
const memberRepo = require('./projectMember.repository');
const memberMapper = require('./projectMember.mapper');
const { ProjectMemberNotFoundError } = require('./projectMember.error');
const Project = require('../projects/project.schema');
const User = require('../auth/auth.schema');
const { NotFoundError, ConflictError } = require('../../shared/errors/AppError');

const getMembersByProject = async (projectId) => {
    const projectExists = await Project.findById(projectId);
    if (!projectExists) throw new NotFoundError('Dự án');

    const members = await memberRepo.findByProjectId(projectId);
    return memberMapper.toProjectMemberListResponse(members);
};

const addMemberToProject = async (dto) => {
    const projectExists = await Project.findById(dto.projectId);
    if (!projectExists) throw new NotFoundError('Dự án');

    const targetUser = await User.findOne({ email: dto.email });
    if (!targetUser) throw new NotFoundError(`Người dùng có email "${dto.email}"`);

    const existingMember = await memberRepo.findByUserAndProject(targetUser._id, dto.projectId);
    if (existingMember) {
        throw new ConflictError('Thành viên này đã tham gia vào dự án');
    }

    const member = await memberRepo.create({
        user: targetUser._id,
        project: dto.projectId,
        role: dto.role,
        status: 'accepted'
    });

    return memberMapper.toProjectMemberResponse(member);
};

const updateMemberRole = async (id, dto) => {
    const member = await memberRepo.findById(id);
    if (!member) throw new ProjectMemberNotFoundError();

    const updated = await memberRepo.updateRole(id, dto.role);
    return memberMapper.toProjectMemberResponse(updated);
};

const removeMember = async (id) => {
    const member = await memberRepo.findById(id);
    if (!member) throw new ProjectMemberNotFoundError();

    await memberRepo.remove(id);
    return { message: 'Đã xóa thành viên khỏi dự án' };
};

module.exports = {
    getMembersByProject,
    addMemberToProject,
    updateMemberRole,
    removeMember
};
