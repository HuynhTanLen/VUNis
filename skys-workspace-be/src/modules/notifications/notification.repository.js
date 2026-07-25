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
    return Notification.findByIdAndUpdate(id, { $set: { isRead: true } }, { new: true });
};

const markAllAsRead = (receiverId) => {
    return Notification.updateMany({ receiver: receiverId, isRead: false }, {$set: { isRead: true }});
};

const remove = (id) => {
    return Notification.findByIdAndDelete(id);
};

const createMany = (notifArray) =>{
    return Notification.insertMany(notifArray);
}

module.exports = {
    findByReceiver,
    findById,
    create,
    markAsRead,
    markAllAsRead,
    remove,
    createMany
};
