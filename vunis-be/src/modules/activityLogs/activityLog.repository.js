/**
 * @file activityLog.repository.js
 * @description Tầng Repository cho module ActivityLog.
 */
const prisma = require('../../config/prisma');

const findByProjectId = (projectId) => {
    return prisma.activityLog.findMany({
        where: { projectId: projectId },
        include: {
            user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    });
};

const create = async (data) => {
    const newLog = await prisma.activityLog.create({ data });
    return prisma.activityLog.findUnique({
        where: { id: newLog.id },
        include: {
            user: { select: { id: true, name: true, email: true } }
        }
    });
};

module.exports = {
    findByProjectId,
    create
};
