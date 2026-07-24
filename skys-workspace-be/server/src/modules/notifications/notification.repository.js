/**
 * @file notification.repository.js
 * @description Tầng Repository cho module Notification.
 */
const Notification = require('./notification.schema');

const findByReceiver = (receiverId) => {
    return Notification.find({ receiver: receiverId })
        .sort({ createdAt: -1 })
        .limit(50);
};

const findById = (id) => {
    return Notification.findById(id);
};

const create = async (data) => {
    return Notification.create(data);
};

const markAsRead = (id) => {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

const markAllAsRead = (receiverId) => {
    return Notification.updateMany({ receiver: receiverId, isRead: false }, { isRead: true });
};

const remove = (id) => {
    return Notification.findByIdAndDelete(id);
};

module.exports = {
    findByReceiver,
    findById,
    create,
    markAsRead,
    markAllAsRead,
    remove
};
