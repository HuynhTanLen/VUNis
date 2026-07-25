/**
 * @file teamRoles.js
 * @description Quản lý Bảng ánh xạ các Đội nhóm chuyên môn cho TOÀN HỆ THỐNG.
 */

const TEAM_MAP = {
    FRONTEND: ['FRONTEND_LEAD', 'FRONTEND_DEVELOPER'],
    BACKEND:  ['BACKEND_LEAD', 'BACKEND_DEVELOPER'],
    DESIGN:   ['DESIGN_LEAD', 'UI_UX_DESIGNER'],
    QA:       ['QA_LEAD', 'QA_TESTER'],
    DEVOPS:   ['DEVOPS_LEAD', 'DEVOPS_ENGINEER']
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
