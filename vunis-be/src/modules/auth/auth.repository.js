/**
 * @file auth.repository.js
 * @description Tầng Repository cho module Auth.
 * CHỈ chứa các truy vấn Database đơn giản, hiệu năng cao không cần populate.
 */
const prisma = require('../../config/prisma');

const USER_SELECT_SAFE = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    isBlocked: true,
    lastActiveAt: true,
    avatar: true,
    phone: true,
    jobTitle: true,
    department: true,
    company: true,
    hourlyRate: true,
    createdAt: true,
    updatedAt: true,
};

const findByEmail = (email) => {
    return prisma.user.findUnique({ where: { email } });
};

const findById = (id) => {
    return prisma.user.findUnique({ where: { id }, select: USER_SELECT_SAFE });
};

const createUser = (data) => {
    return prisma.user.create({ data });
};

const findAllUsers = () => {
    return prisma.user.findMany({ select: USER_SELECT_SAFE, orderBy: { createdAt: 'desc' } });
};

const updateUserRole = (userId, role) => {
    return prisma.user.update({ where: { id: userId }, data: { role }, select: USER_SELECT_SAFE });
};

const toggleBlockUser = (userId, isBlocked) => {
    return prisma.user.update({ where: { id: userId }, data: { isBlocked }, select: USER_SELECT_SAFE });
};

const deleteUser = (userId) => {
    return prisma.user.delete({ where: { id: userId } });
};

const countUsers = () => {
    return prisma.user.count();
};

const setResetToken = (userId, hashedToken, expireDate) => {
    return prisma.user.update({
        where: { id: userId },
        data: { resetPasswordToken: hashedToken, resetPasswordExpire: expireDate }
    });
};

const findByValidResetToken = (hashedToken) => {
    return prisma.user.findFirst({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { gt: new Date() }
        }
    });
};

const updatePassword = (userId, hashedPassword) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpire: null
        }
    });
};

module.exports = { 
    findByEmail, 
    findById, 
    createUser, 
    findAllUsers, 
    updateUserRole, 
    toggleBlockUser, 
    deleteUser,
    countUsers,
    setResetToken,
    findByValidResetToken,
    updatePassword
};
