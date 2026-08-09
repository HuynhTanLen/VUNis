/**
 * @file activityLog.mapper.js
 * @description Format dữ liệu ActivityLog sang Response DTO.
 */

const toActivityLogResponse = (log) => {
    if (!log) return null;

    return {
        id: log.id,
        action: log.action,
        type: log.details || log.type,
        user: log.user && typeof log.user === 'object' && log.user.id ? {
            id: log.user.id,
            name: log.user.name,
            email: log.user.email
        } : log.user,
        projectId: log.projectId || log.project,
        createdAt: log.createdAt
    };
};

const toActivityLogListResponse = (logs) => {
    if (!Array.isArray(logs)) return [];
    return logs.map(toActivityLogResponse);
};

module.exports = {
    toActivityLogResponse,
    toActivityLogListResponse
};
