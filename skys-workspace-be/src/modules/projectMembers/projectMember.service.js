/**
 * @file projectMember.service.js
 * @description Tầng Service cho module ProjectMember.
 */
const memberRepo = require('./projectMember.repository');
const memberMapper = require('./projectMember.mapper');
const { ProjectMemberNotFoundError } = require('./projectMember.error');
const prisma = require('../../config/prisma');
const { NotFoundError, ConflictError } = require('../../shared/errors/AppError');
const {getRolesByTeamType} = require('../../shared/constants/teamRoles');
const sendEmail = require('../../shared/utils/sendEmail');

const getMembersByProject = async (projectId) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { owner: { select: { id: true, name: true, email: true, avatar: true } } }
    });
    if (!project) throw new NotFoundError('Dự án');

    let members = await memberRepo.findByProjectId(projectId);
    members = (members || []).filter(m => m && m.user && m.user.id);

    if (project.owner) {
        const ownerInMembers = members.some(m => (m.userId === project.owner.id || m.user?.id === project.owner.id));
        if (!ownerInMembers) {
            members.unshift({
                id: `owner-${project.owner.id}`,
                userId: project.owner.id,
                projectId: project.id,
                role: 'PROJECT_MANAGER',
                status: 'accepted',
                user: project.owner,
                joinedAt: project.createdAt
            });
        }
    }

    return memberMapper.toProjectMemberListResponse(members);
};

const addMemberToProject = async (dto) => {
    const projectExists = await prisma.project.findUnique({
        where: { id: dto.projectId },
        include: { owner: true }
    });
    if (!projectExists) throw new NotFoundError('Dự án');

    const targetUser = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!targetUser) throw new NotFoundError(`Không tìm thấy tài khoản có email "${dto.email}" trong hệ thống`);

    if (projectExists.ownerId === targetUser.id || projectExists.owner?.id === targetUser.id) {
        throw new ConflictError('Người dùng này chính là Chủ sở hữu của dự án');
    }

    const existingMember = await memberRepo.findByUserAndProject(targetUser.id, dto.projectId);
    if (existingMember) {
        throw new ConflictError('Thành viên này đã có trong danh sách dự án');
    }

    await memberRepo.create({
        userId: targetUser.id,
        projectId: dto.projectId,
        role: dto.role || 'MEMBER',
        status: 'accepted'
    });

    await prisma.notification.create({
        data: {
            title: 'Lời mời dự án',
            message: `Bạn vừa được thêm vào dự án "${projectExists.name}".`,
            receiverId: targetUser.id,
            link: `/projects/${dto.projectId}`
        }
    });

    try {
        const sendEmail = require('../../shared/utils/sendEmail');
        if (typeof sendEmail === 'function') {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                    <h2 style="color: #2563eb;">🎉 Chào mừng bạn đến với dự án "${projectExists.name}"!</h2>
                    <p>Xin chào <b>${targetUser.name}</b>,</p>
                    <p>Bạn vừa được ban quản trị thêm vào dự án <b>${projectExists.name}</b> trên hệ thống <b>KS Platform</b>.</p>
                </div>
            `;
            await sendEmail({
                email: targetUser.email,
                subject: `[KS Platform] Bạn vừa được thêm vào dự án ${projectExists.name}`,
                html: emailHtml
            });
        }
    } catch (emailError) {
        // Ignore optional email sending error
    }

    return await getMembersByProject(dto.projectId);
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
    const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
    if(!projectExists) throw new NotFoundError('Dự án');
    
    const rolesArray = getRolesByTeamType(teamType);
    const members = await memberRepo.findByRoles(projectId, rolesArray);

    return {
        teamType: teamType || 'ALL',
        teamSize: members.length,
        members: memberMapper.toProjectMemberListResponse(members)
    };
};

module.exports = {
    getMembersByProject,
    addMemberToProject,
    updateMemberRole,
    removeMember,
    getTeamMembers
};
