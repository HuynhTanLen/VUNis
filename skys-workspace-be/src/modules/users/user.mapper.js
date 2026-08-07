/**
 * @file user.mapper.js
 * @description Format dữ liệu User Response DTO cho Client (Hỗ trợ PostgreSQL & Prisma).
 */

const checkIsOnline = (user) => {
    if (!user || user.status !== 'online') return false;
    if (!user.lastActiveAt) return false;

    const lastActive = new Date(user.lastActiveAt).getTime();
    if (isNaN(lastActive)) return false;

    const FIVE_MINUTES = 5 * 60 * 1000;
    return (Date.now() - lastActive) < FIVE_MINUTES;
};

const toUserResponse = (user) => {
    if (!user) return null;
    const isSuspended = Boolean(user.isBlocked || user.status === 'suspended');

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'USER',
        status: isSuspended ? 'suspended' : 'active',
        isBlocked: isSuspended,
        isOnline: !isSuspended && checkIsOnline(user),
        avatar: user.avatar || null,
        phone: user.phone || null,
        jobTitle: user.jobTitle ,
        department: user.department,
        company: user.company,
        lastActiveAt: user.lastActiveAt || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

const toUserListResponse = (users) => {
    if (!Array.isArray(users)) return [];
    return users.map(toUserResponse);
};

const toUserSalaryResponse = (user) =>{
    if(!user) return null;
    const baseResponse = toUserResponse(user);
    return{
        ...baseResponse,
        hourlyRate: user.hourlyRate || 0
    }
}

module.exports = { toUserResponse, toUserListResponse, toUserSalaryResponse };