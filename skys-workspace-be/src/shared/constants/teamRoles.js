/**
 * @file teamRoles.js
 * @description Quản lý Bảng ánh xạ các Đội nhóm chuyên môn cho TOÀN HỆ THỐNG.
 */

const TEAM_MAP = {
    'FRONTEND_LEAD': 'FRONTEND_LEAD',
    'FRONTEND_DEVELOPER': 'FRONTEND_DEVELOPER',
    'FRONTEND_MEMBER': 'FRONTEND_DEVELOPER', // 👈 Quy đổi alias
    'BACKEND_LEAD': 'BACKEND_LEAD',
    'BACKEND_DEVELOPER': 'BACKEND_DEVELOPER',
    'BACKEND_MEMBER': 'BACKEND_DEVELOPER',
    'DESIGN_LEAD': 'DESIGN_LEAD',
    'DESIGNER_LEAD': 'DESIGN_LEAD',
    'UI_UX_DESIGNER': 'UI_UX_DESIGNER',
    'QA_LEAD': 'QA_LEAD',
    'QA_TESTER': 'QA_TESTER',
    'DEVOPS_LEAD': 'DEVOPS_LEAD',
    'DEVOPS_ENGINEER': 'DEVOPS_ENGINEER',
    'PROJECT_MANAGER': 'PROJECT_MANAGER'
};

const getRolesByTeamType = (teamType) => {
    return TEAM_MAP[teamType] || [];
}

const getTeamTypeByRole = (userRole) => {
    for(const [teamType, roles] of Object.entries(TEAM_MAP)){
        if(roles.includes(userRole)) return teamType;
    }
    return 'ALL'
};

module.exports = {
    TEAM_MAP,
    getRolesByTeamType,
    getTeamTypeByRole
}
