/**
 * @file label.repository.js
 * @description Tầng Repository cho module Label.
 */
const prisma = require('../../config/prisma');

const findByProjectId = (projectId) => {
    return prisma.label.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
    });
};

const findById = (id) => {
    return prisma.label.findUnique({ where: { id } });
};

const create = (data) => {
    return prisma.label.create({ data });
};

const update = (id, data) => {
    return prisma.label.update({
        where: { id },
        data
    });
};

const remove = (id) => {
    return prisma.label.delete({ where: { id } });
};

module.exports = {
    findByProjectId,
    findById,
    create,
    update,
    remove
};
