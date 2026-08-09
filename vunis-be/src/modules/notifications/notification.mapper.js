/**
 * @file notification.mapper.js
 * @description Transfer Notification entity sang Response DTO.
 */

const toNotificationResponse = (notif) => {
    if (!notif) return null;

    return {
        id: notif.id,
        message: notif.message,
        title: notif.title,
        receiverId: notif.receiverId,
        link: notif.link,
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
