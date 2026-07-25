/**
 * @file notification.controller.js
 * @description Tầng Controller cho module Notification.
 */
const notifService = require('./notification.service');
const { CreateNotificationDTO } = require('./notification.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getNotifications = async (req, res) => {
    try {
        const notifs = await notifService.getUserNotifications(req.user.userId);
        res.status(200).json(notifs);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const createNotification = async (req, res) => {
    try {
        const dto = new CreateNotificationDTO(req.body).validate();
        const notif = await notifService.sendNotification(dto);
        res.status(201).json(notif);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const createNotificationBuik = asyncHandler(async (req, res) => {
    const { message, type } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Nội dung thông báo là bắt buộc' });
    }
    const result = await notifService.sendNotificationBulk(
        req.params.projectId,
        req.user.userId,
        message,
        type
    )
    res.status(201).json(result);
})

const markNotificationAsRead = async (req, res) => {
    try {
        const notif = await notifService.markRead(req.params.id);
        res.status(200).json(notif);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await notifService.markAllRead(req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const result = await notifService.removeNotification(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

module.exports = {
    getNotifications,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createNotificationBuik
};
