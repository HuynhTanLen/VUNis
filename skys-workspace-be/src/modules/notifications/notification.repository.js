/**
 * @file notification.repository.js
 * @description Tầng Repository cho module Notification.
 */
const prisma = require('../../config/prisma');

const findByReceiver = (receiverId) => {
    return prisma.notification.findMany({
        where: { receiverId: receiverId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
};

const findById = (id) => {
    return prisma.notification.findUnique({
        where: { id }
    });
};

const create = async (data) => {
    return prisma.notification.create({ data });
};

const markAsRead = (id) => {
    return prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
};

const markAllAsRead = (receiverId) => {
    return prisma.notification.updateMany({
        where: { receiverId: receiverId, isRead: false },
        data: { isRead: true }
    });
};

const remove = (id) => {
    return prisma.notification.delete({
        where: { id }
    });
};

const createMany = (notifArray) => {
    return prisma.notification.createMany({
        data: notifArray
    });
};

module.exports = {
    findByReceiver,
    findById,
    create,
    markAsRead,
    markAllAsRead,
    remove,
    createMany
};
