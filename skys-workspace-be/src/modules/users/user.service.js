/**
 * @file user.service.js
 * @description Business Logic cho module Users độc lập (Sử dụng PostgreSQL & Prisma ORM).
 */
const userRepo = require('./user.repository');
const userMapper = require('./user.mapper');
const prisma = require('../../config/prisma');

const getAllUsers = async (queryFilter = {}) => {
    const filter = {};
    if (queryFilter.status) filter.status = queryFilter.status;
    if (queryFilter.role) filter.role = queryFilter.role;
    if (queryFilter.isBlocked !== undefined) filter.isBlocked = queryFilter.isBlocked === 'true';

    const users = await userRepo.findAllUsers(filter);
    return userMapper.toUserListResponse(users);
};

const getUserById = async (userId) => {
    const user = await userRepo.findUserById(userId);
    if (!user) {
        const error = new Error('Người dùng không tồn tại');
        error.statusCode = 404;
        throw error;
    }
    return userMapper.toUserResponse(user);
};

const updateProfile = async (currentUserId, targetUserId, dto) => {
    const currentUser = await userRepo.findUserById(currentUserId);
    const isSelf = currentUserId.toString() === targetUserId.toString();
    const isAdmin = ['SUPER_ADMIN', 'USER_ADMIN'].includes(currentUser?.role);

    if (!isSelf && !isAdmin) {
        const error = new Error('Bạn không có quyền chỉnh sửa thông tin người dùng này');
        error.statusCode = 403;
        throw error;
    }

    const updateData = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.jobTitle !== undefined) updateData.jobTitle = dto.jobTitle;
    if (dto.department !== undefined) updateData.department = dto.department;
    if (dto.company !== undefined) updateData.company = dto.company;

    const updatedUser = await userRepo.updateUserProfile(targetUserId, updateData);
    return userMapper.toUserResponse(updatedUser);
};

const changeUserRole = async (currentUserId, targetUserId, newRole) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        const error = new Error('Không thể tự thay đổi vai trò của chính mình');
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await userRepo.findUserById(targetUserId);
    if (!targetUser) {
        const error = new Error('Người dùng không tồn tại');
        error.statusCode = 404;
        throw error;
    }

    const updatedUser = await userRepo.updateUserRole(targetUserId, newRole);

    // Ghi log trạng thái sang PostgreSQL UserStatusLog
    await prisma.userStatusLog.create({
        data: {
            userId: targetUserId,
            status: 'ROLE_CHANGED',
            reason: `Role changed to ${newRole}`
        }
    }).catch(() => {});

    return userMapper.toUserResponse(updatedUser);
};

const toggleBlockUser = async (currentUserId, targetUserId, isBlocked) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        const error = new Error('Không thể tự khóa tài khoản của chính mình');
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await userRepo.findUserById(targetUserId);
    if (!targetUser) {
        const error = new Error('Người dùng không tồn tại');
        error.statusCode = 404;
        throw error;
    }

    if (targetUser.role === 'SUPER_ADMIN') {
        const error = new Error('Không thể khóa tài khoản SUPER_ADMIN hệ thống');
        error.statusCode = 403;
        throw error;
    }

    const updatedUser = await userRepo.toggleBlockUser(targetUserId, isBlocked);

    // Ghi log trạng thái sang PostgreSQL UserStatusLog
    await prisma.userStatusLog.create({
        data: {
            userId: targetUserId,
            status: isBlocked ? 'BLOCKED' : 'UNBLOCKED',
            reason: isBlocked ? 'Blocked by Admin' : 'Unblocked by Admin'
        }
    }).catch(() => {});

    return userMapper.toUserResponse(updatedUser);
};

const removeUser = async (currentUserId, targetUserId) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        const error = new Error('Không thể tự xóa chính mình');
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await userRepo.findUserById(targetUserId);
    if (!targetUser) {
        const error = new Error('Người dùng không tồn tại');
        error.statusCode = 404;
        throw error;
    }

    if (targetUser.role === 'SUPER_ADMIN') {
        const error = new Error('Không thể xóa tài khoản SUPER_ADMIN hệ thống');
        error.statusCode = 403;
        throw error;
    }

    await userRepo.deleteUser(targetUserId);
    return { message: 'Xóa người dùng thành công' };
};

const getUserLogs = async (userId) => {
    return await prisma.userStatusLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
};

const getStatusLogsStats = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs = await prisma.userStatusLog.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, status: true }
    });
    return logs;
};

module.exports = {
    getAllUsers,
    getUserById,
    updateProfile,
    changeUserRole,
    toggleBlockUser,
    removeUser,
    getUserLogs,
    getStatusLogsStats
};
