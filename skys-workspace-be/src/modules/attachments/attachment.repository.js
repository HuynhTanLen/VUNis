/**
 * @file attachment.repository.js
 * @description Repository layer cho module Attachment.
 */
const prisma = require('../../config/prisma');

const findByTaskId = (taskId) => {
    return prisma.attachment.findMany({
        where: { taskId: taskId },
        include: {
            uploader: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const findById = (id) => {
    return prisma.attachment.findUnique({
        where: { id },
        include: {
            uploader: { select: { id: true, name: true, email: true } }
        }
    });
};

const create = async (data) => {
    const newAtt = await prisma.attachment.create({ data });
    return prisma.attachment.findUnique({
        where: { id: newAtt.id },
        include: {
            uploader: { select: { id: true, name: true, email: true } }
        }
    });
};

const remove = (id) => {
    return prisma.attachment.delete({
        where: { id }
    });
};

const edit = (id, data) => {
    return prisma.attachment.update({
        where: { id },
        data,
        include: {
            uploader: { select: { id: true, name: true, email: true } }
        }
    });
};

const findAll = () => {
    return prisma.attachment.findMany();
};

module.exports = {
    findByTaskId,
    findById,
    create,
    remove,
    edit,
    findAll
};
