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
const {getRolesByTeamType} = require('../../shared/constants/teamRoles');
const sendEmail = require('../../shared/utils/sendEmail');
const Notification = require('../notifications/notification.schema');

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
        role: dto.role || 'MEMBER',
        status: 'accepted'
    });

    await Notification.create({
         message: `Bạn vừa được thêm vào dự án "${projectExists.name}" với vai trò ${member.role}.`,
        type: 'project_invitation',
        receiver: targetUser._id,
        relatedProject: dto.projectId
    })
     try {
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                <h2 style="color: #2563eb;">🎉 Chào mừng bạn đến với dự án "${projectExists.name}"!</h2>
                <p>Xin chào <b>${targetUser.name}</b>,</p>
                <p>Bạn vừa được ban quản trị thêm vào dự án <b>${projectExists.name}</b> trên hệ thống <b>KS Platform</b>.</p>
                <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0;">
                    <p style="margin: 5px 0;"><b>Tên dự án:</b> ${projectExists.name}</p>
                    <p style="margin: 5px 0;"><b>Vai trò của bạn:</b> <span style="color: #059669; font-weight: bold;">${member.role}</span></p>
                </div>
                <p>Đăng nhập ngay để xem danh sách công việc được phân công!</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #64748b;">Đây là email tự động từ hệ thống KS Platform, vui lòng không phản hồi email này.</p>
            </div>
        `;
        await sendEmail({
            email: targetUser.email,
            subject: `[KS Platform] Bạn vừa được thêm vào dự án ${projectExists.name}`,
            html: emailHtml
        });
    } catch (emailError) {
        console.error('Lỗi khi gửi email thông báo mời tham gia dự án:', emailError.message);
    }

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

const getTeamMembers = async(projectId, teamType) => {
    const projectExists = await Project.findById(projectId);
    if(!projectExists) throw new NotFoundError('Dự án');
    const rolesArray = getRolesByTeamType(teamType)
    const member = await memberRepo.findByRoles(
        projectId, rolesArray)

    return {
        teamType: teamType || 'ALL',
        teamSize: members.length,
        members: memberMapper.toProjectMemberListResponse(members)
    }
}

module.exports = {
    getMembersByProject,
    addMemberToProject,
    updateMemberRole,
    removeMember,
    getTeamMembers
};
