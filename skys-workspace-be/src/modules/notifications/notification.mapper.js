/**
 * @file notification.mapper.js
 * @description Transfer Notification entity sang Response DTO.
 */

const toNotificationResponse = (notif) => {
    if (!notif) return null;

    return {
        id: notif._id,
        message: notif.message,
        type: notif.type,
        receiver: notif.receiver && typeof notif.receiver === 'object' && notif.receiver._id ? {
            id: notif.receiver._id,
            name: notif.receiver.name,
            email: notif.receiver.email
        } : notif.receiver,
        relatedProject: notif.relatedProject,
        relatedTask: notif.relatedTask,
        isRead: notif.isRead,
        createdAt: notif.createdAt
    };
};

const toNotificationListResponse = (notifs) => {
    if (!Array.isArray(notifs)) return [];
    return notifs.map(toNotificationResponse);
};

module.exports = {
    toNotificationResponse,
    toNotificationListResponse
};
