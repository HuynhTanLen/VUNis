/**
 * @file user.repository.js
 * @description Tầng Repository cho module Users sử dụng PostgreSQL (Prisma ORM).
 */
const prisma = require('../../config/prisma');

const findAllUsers = async (filter = {}) => {
    const where = {};
    if (filter.status) where.status = filter.status;
    if (filter.role) where.role = filter.role;
    if (filter.isBlocked !== undefined) where.isBlocked = filter.isBlocked === true || filter.isBlocked === 'true';

    return await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            isBlocked: true,
            jobTitle: true,
            department: true,
            avatar: true,
            phone: true,
            hourlyRate: true,
            lastActiveAt: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            isBlocked: true,
            jobTitle: true,
            department: true,
            avatar: true,
            phone: true,
            hourlyRate: true,
            lastActiveAt: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email }
    });
};

const updateUserProfile = async (userId, updateData) => {
    return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            isBlocked: true,
            jobTitle: true,
            department: true,
            avatar: true,
            phone: true,
            hourlyRate: true,
            lastActiveAt: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

const updateUserRole = async (userId, role) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            isBlocked: true,
            lastActiveAt: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

const toggleBlockUser = async (userId, isBlocked) => {
    const status = isBlocked ? 'suspended' : 'active';
    return await prisma.user.update({
        where: { id: userId },
        data: { isBlocked, status },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            isBlocked: true,
            lastActiveAt: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

const deleteUser = async (userId) => {
    return await prisma.user.delete({
        where: { id: userId }
    });
};

module.exports = {
    findAllUsers,
    findUserById,
    findUserByEmail,
    updateUserProfile,
    updateUserRole,
    toggleBlockUser,
    deleteUser
};
