/**
 * @file projectMember.mapper.js
 * @description Format ProjectMember entity sang Response DTO.
 */

const toProjectMemberResponse = (member) => {
    if (!member) return null;

    return {
        id: member._id,
        user: member.user && typeof member.user === 'object' && member.user._id ? {
            id: member.user._id,
            name: member.user.name,
            email: member.user.email
        } : member.user,
        projectId: member.project?._id || member.project,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt || member.createdAt
    };
};

const toProjectMemberListResponse = (members) => {
    if (!Array.isArray(members)) return [];
    return members.map(toProjectMemberResponse);
};

module.exports = {
    toProjectMemberResponse,
    toProjectMemberListResponse
};
