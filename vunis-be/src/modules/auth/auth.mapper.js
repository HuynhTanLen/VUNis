/**
 * @file auth.mapper.js
 * @description Chuyển đổi dữ liệu từ Database Entity sang Response DTO.
 * Đảm bảo KHÔNG BAO GIỜ trả password, __v, hay các field nhạy cảm ra client.
 */

const toUserResponse = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'USER',
    status: user.status || 'offline',
    isBlocked: Boolean(user.isBlocked),
    phone: user.phone || null,
    jobTitle: user.jobTitle || null,
    department: user.department || null,
    company: user.company || null,
    avatar: user.avatar || null,
    hourlyRate: user.hourlyRate ?? 0,
    lastActiveAt: user.lastActiveAt || user.updatedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

const toLoginResponse = (user, token) => ({
    token,
    user: toUserResponse(user)
});

module.exports = { toUserResponse, toLoginResponse };

