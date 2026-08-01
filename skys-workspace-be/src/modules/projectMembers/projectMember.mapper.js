/**
 * @file projectMember.mapper.js
 * @description Format ProjectMember entity sang Response DTO.
 */

const {getTeamTypeByRole} = require('../../shared/constants/teamRoles');

const toProjectMemberResponse = (member) => {
    if (!member) return null;

    const userObj = member.user && typeof member.user === 'object' ? member.user : {};

    return {
        id: userObj.id || member.userId || member.id,
        memberId: member.id,
        userId: userObj.id || member.userId,
        name: userObj.name || 'Thành viên',
        email: userObj.email || '',
        avatar: userObj.avatar || '',
        user: userObj,
        projectId: member.project?.id || member.projectId,
        role: member.role || 'MEMBER',
        teamType: getTeamTypeByRole(member.role || 'MEMBER'),
        status: member.status || 'accepted',
        joinedAt: member.joinedAt || member.createdAt
    };
};

const toProjectMemberListResponse = (members) => {
    if (!Array.isArray(members)) return [];
    return members.map(toProjectMemberResponse);
};


module.exports = {
    toProjectMemberResponse,
    toProjectMemberListResponse,
};
