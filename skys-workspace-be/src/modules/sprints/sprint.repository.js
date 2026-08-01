const prisma = require('../../config/prisma');

const findSprintsByProject = (projectId) => {
    return prisma.sprint.findMany({
        where: { projectId: projectId },
        orderBy: { createdAt: 'desc' }
    });
};

const findSprintById = (sprintId) => {
    return prisma.sprint.findUnique({
        where: { id: sprintId }
    });
};

const createSprint = (sprintData) => {
    return prisma.sprint.create({
        data: sprintData
    });
};

const updateSprintStatus = (sprintId, status) => {
    return prisma.sprint.update({
        where: { id: sprintId },
        data: { status: status }
    });
};

module.exports = {
    findSprintsByProject,
    findSprintById,
    createSprint,
    updateSprintStatus
};
