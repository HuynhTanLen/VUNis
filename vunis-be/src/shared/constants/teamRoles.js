/**
 * @file teamRoles.js
 * @description Quản lý Bảng ánh xạ các Đội nhóm chuyên môn cho TOÀN HỆ THỐNG.
 */

const TEAM_MAP = {
    'FRONTEND': ['FRONTEND_LEAD', 'FRONTEND_DEVELOPER', 'FRONTEND_MEMBER'],
    'BACKEND': ['BACKEND_LEAD', 'BACKEND_DEVELOPER', 'BACKEND_MEMBER'],
    'DESIGN': ['DESIGN_LEAD', 'DESIGNER_LEAD', 'UI_UX_DESIGNER'],
    'QA': ['QA_LEAD', 'QA_TESTER'],
    'DEVOPS': ['DEVOPS_LEAD', 'DEVOPS_ENGINEER'],
    'BA': ['BA_LEAD', 'BUSINESS_ANALYST', 'BA'],
    'MANAGEMENT': ['PROJECT_MANAGER', 'Owner']
};

const LEAD_ROLES = [
    'PROJECT_MANAGER', 
    'FRONTEND_LEAD', 
    'BACKEND_LEAD', 
    'DESIGN_LEAD', 
    'QA_LEAD', 
    'DEVOPS_LEAD',
    'BA_LEAD'
];

const getRolesByTeamType = (teamType) => {
    if (!teamType || teamType === 'ALL') return [];
    return TEAM_MAP[teamType.toUpperCase()] || [teamType];
};

const getTeamTypeByRole = (userRole) => {
    if (!userRole) return 'ALL';
    for (const [teamType, roles] of Object.entries(TEAM_MAP)) {
        if (Array.isArray(roles) && roles.includes(userRole)) {
            return teamType;
        }
    }
    return 'ALL';
};

module.exports = {
    TEAM_MAP,
    LEAD_ROLES,
    getRolesByTeamType,
    getTeamTypeByRole
}
