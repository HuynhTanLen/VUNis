/**
 * @file notification.service.js
 * @description Tầng Service cho module Notification.
 */
const notifRepo = require('./notification.repository');
const notifMapper = require('./notification.mapper');
const Project = require('../projects/project.schema')
const { NotificationNotFoundError } = require('./notification.error');

const getUserNotifications = async (userId) => {
    const list = await notifRepo.findByReceiver(userId);
    return notifMapper.toNotificationListResponse(list);
};

const sendNotification = async (dto) => {
    const notif = await notifRepo.create({
        message: dto.message,
        type: dto.type,
        receiver: dto.receiverId,
        relatedProject: dto.relatedProject,
        relatedTask: dto.relatedTask
    });
    return notifMapper.toNotificationResponse(notif);
};

const sendNotificationBulk = async(notifArray) =>{
    const project = await Project.findById(projectId);
    if(!project) throw new ProjectNotFoundError();
    
    const receiverId = new Set();
    if(project.owner) receiverId.add(project.owner.toString());

    if(Array.isArray(project.members)){
        project.members.forEach( m =>{
            const memberId = m.userId ? m.userId.toString() : m.toString();
            if(memberId) receiverId.add(memberId);
        });
    }

    receiverId.delete(senderId.toString());

    const notifDocs = Array.from(receiverId).map(receiverId =>({
        message,
        type,
        receiver: receiverId,
        relatedProject: projectId,
        isRead: false
    }));

    if(notifDocs.length > 0){
        await notifRepo.createMany(notifDocs);
    }
    
    return {message: `Đã gửi thông báo đến ${notifDocs.length} thành viên trong dự án.`};
}

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
