/**
 * @file notification.controller.js
 * @description Tầng Controller cho module Notification.
 */
const notifService = require('./notification.service');
const { CreateNotificationDTO } = require('./notification.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getNotifications = asyncHandler( async (req, res) => {
        const notifs = await notifService.getUserNotifications(req.user.id);
        res.status(200).json(notifs);
});

const createNotification = asyncHandler(async (req, res) => {
        const dto = new CreateNotificationDTO(req.body).validate();
        const notif = await notifService.sendNotification(dto);
        res.status(201).json(notif);
});

const createNotificationBuik = asyncHandler(async (req, res) => {
    const { message, type } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Nội dung thông báo là bắt buộc' });
    }
    const result = await notifService.sendNotificationBulk(
        req.params.projectId,
        req.user.id,
        message,
        type
    )
    res.status(201).json(result);
})

const markNotificationAsRead = asyncHandler(async (req, res) => {
        const notif = await notifService.markRead(req.params.id);
        res.status(200).json(notif);
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
        const result = await notifService.markAllRead(req.user.id);
        res.status(200).json(result);
});

const deleteNotification = asyncHandler(async (req, res) => {
        const result = await notifService.removeNotification(req.params.id);
        res.status(200).json(result);
});

module.exports = {
    getNotifications,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createNotificationBuik
};
