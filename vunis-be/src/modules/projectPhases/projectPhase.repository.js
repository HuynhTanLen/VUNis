/**
 * @file projectPhase.repository.js
 * @description Tầng Repository cho module ProjectPhase.
 */
const prisma = require('../../config/prisma');

const findByProjectId = (projectId) => {
    return prisma.projectPhase.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
        include: { tasks: { select: { id: true } } }
    });
};

const findById = (id) => {
    return prisma.projectPhase.findUnique({ where: { id } });
};

const create = (data) => {
    return prisma.projectPhase.create({ data });
};

const update = (id, data) => {
    return prisma.projectPhase.update({
        where: { id },
        data
    });
};

const remove = (id) => {
    return prisma.projectPhase.delete({ where: { id } });
};

const createMany = (projectId, phases) => {
    return prisma.projectPhase.createMany({
        data: phases.map((p, i) => ({
            projectId,
            name: p.name,
            order: p.order ?? i + 1,
            estimatedCost: 0,
            actualCost: 0
        }))
    });
};

module.exports = {
    findByProjectId,
    findById,
    create,
    update,
    remove,
    createMany
};
