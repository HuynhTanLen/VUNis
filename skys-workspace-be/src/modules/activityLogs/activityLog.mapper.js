/**
 * @file activityLog.mapper.js
 * @description Format dữ liệu ActivityLog sang Response DTO.
 */

const toActivityLogResponse = (log) => {
    if (!log) return null;

    return {
        id: log._id,
        action: log.action,
        type: log.type,
        user: log.user && typeof log.user === 'object' && log.user._id ? {
            id: log.user._id,
            name: log.user.name,
            email: log.user.email
        } : log.user,
        projectId: log.project?._id || log.project,
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
