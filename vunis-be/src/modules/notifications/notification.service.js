/**
 * @file notification.service.js
 * @description Tầng Service cho module Notification.
 */
const notifRepo = require('./notification.repository');
const notifMapper = require('./notification.mapper');
const prisma = require('../../config/prisma');
const { NotificationNotFoundError } = require('./notification.error');

const getUserNotifications = async (userId) => {
    const list = await notifRepo.findByReceiver(userId);
    return notifMapper.toNotificationListResponse(list);
};

const sendNotification = async (dto) => {
    const notif = await notifRepo.create({
        message: dto.message,
        title: dto.title || dto.type || 'Notification',
        receiverId: dto.receiverId,
        link: dto.link || null
    });
    return notifMapper.toNotificationResponse(notif);
};

const sendNotificationBulk = async (projectId, senderId, message, type) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true }
    });
    if (!project) throw new Error('ProjectNotFoundError');
    
    const receiverIds = new Set();
    if (project.ownerId) receiverIds.add(project.ownerId);

    if (Array.isArray(project.members)) {
        project.members.forEach(m => {
            const memberId = m.userId;
            if (memberId) receiverIds.add(memberId);
        });
    }

    receiverIds.delete(senderId);

    const notifDocs = Array.from(receiverIds).map(receiverId => ({
        message: message,
        title: type || 'Notification',
        receiverId: receiverId,
        isRead: false
    }));

    if (notifDocs.length > 0) {
        await notifRepo.createMany(notifDocs);
    }
    
    return { message: `Đã gửi thông báo đến ${notifDocs.length} thành viên trong dự án.` };
};

const markRead = async (id) => {
    const updated = await notifRepo.markAsRead(id);
    if (!updated) throw new NotificationNotFoundError();
    return notifMapper.toNotificationResponse(updated);
};

const markAllRead = async (userId) => {
    await notifRepo.markAllAsRead(userId);
    return { message: 'Đã đánh dấu đọc tất cả thông báo' };
};

const removeNotification = async (id) => {
    const notif = await notifRepo.findById(id);
    if (!notif) throw new NotificationNotFoundError();
    await notifRepo.remove(id);
    return { message: 'Đã xóa thông báo' };
};

module.exports = {
    getUserNotifications,
    sendNotification,
    markRead,
    markAllRead,
    removeNotification,
    sendNotificationBulk
};
