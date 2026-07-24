/**
 * @file notification.route.js
 * @description Route định tuyến cho module Notification.
 * Base path: /api/notifications
 */
const express = require('express');
const router = express.Router();
const {
    getNotifications,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require('./notification.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/', protect, getNotifications);
router.post('/', protect, createNotification);
router.patch('/read-all', protect, markAllNotificationsAsRead);
router.patch('/:id/read', protect, markNotificationAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
