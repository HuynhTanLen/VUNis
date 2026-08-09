/**
 * @file projectMember.repository.js
 * @description Tầng Repository cho module ProjectMember.
 */
const prisma = require('../../config/prisma');

const findByProjectId = (projectId) => {
    return prisma.projectMember.findMany({
        where: { projectId },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { joinedAt: 'desc' }
    });
};

const findByUserAndProject = (userId, projectId) => {
    return prisma.projectMember.findFirst({
        where: { userId, projectId },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
    });
};

const findById = (id) => {
    return prisma.projectMember.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
    });
};

const create = async (data) => {
    return prisma.projectMember.create({
        data,
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
    });
};

const updateRole = (id, role) => {
    return prisma.projectMember.update({
        where: { id },
        data: { role },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
    });
};

const remove = (id) => {
    return prisma.projectMember.delete({ where: { id } });
};

const findByRoles = (projectId, rolesArray) => {
    const whereClause = { projectId };
    if (rolesArray && rolesArray.length > 0) {
        whereClause.role = { in: rolesArray };
    }
    
    return prisma.projectMember.findMany({
        where: whereClause,
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { joinedAt: 'desc' }
    });
};

module.exports = {
    findByProjectId,
    findByUserAndProject,
    findById,
    create,
    updateRole,
    remove,
    findByRoles
};
