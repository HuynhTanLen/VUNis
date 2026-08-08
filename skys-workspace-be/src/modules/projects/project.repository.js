const prisma = require('../../config/prisma');

const findProjectsByOwner = (userId) => {
    return prisma.project.findMany({
        where: {
            OR: [
                { ownerId: userId },
                { members: { some: { userId } } }
            ]
        },
        select: {
            id: true, name: true, description: true, budget: true, durationWeeks: true, startDate: true, endDate: true, status: true, priority: true, modelType: true, ownerId: true, createdAt: true,
            owner: { select: { id: true, name: true, email: true, role: true } },
            members: { select: { user: { select: { id: true, name: true, email: true, avatar: true, jobTitle: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const findProjectById = (projectId) => {
    return prisma.project.findUnique({
        where: { id: projectId },
        include: {
            owner: { select: { id: true, name: true, email: true, role: true, avatar: true } },
            members: {
                include: {
                    user: { select: { id: true, name: true, email: true, role: true, avatar: true } }
                }
            }
        }
    });
};

const createProject = (projectData) => {
    return prisma.project.create({ data: projectData });
};

const updateProject = (projectId, updateData) => {
    return prisma.project.update({
        where: { id: projectId },
        data: updateData,
        include: {
            owner: { select: { id: true, name: true, email: true, role: true } },
            members: { select: { user: { select: { id: true, name: true, email: true, role: true } } } }
        }
    });
};

const deleteProject = (projectId) => {
    return prisma.project.delete({ where: { id: projectId } });
};

const findAllProjects = () => {
    return prisma.project.findMany({
        include: {
            owner: { select: { id: true, name: true, email: true, role: true } },
            members: { select: { user: { select: { id: true, name: true, email: true, role: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const findRootProjects = () => {
    return prisma.project.findMany({
        where: { parentId: null },
        include: { owner: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

const findSubProjects = (parentProjectId) => {
    return prisma.project.findMany({
        where: { parentId: parentProjectId },
        include: { owner: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

module.exports = {
    findProjectsByOwner,
    findProjectById,
    createProject,
    updateProject,
    deleteProject,
    findAllProjects,
    findRootProjects,
    findSubProjects
};
