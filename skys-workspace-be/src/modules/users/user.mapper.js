/**
 * @file user.mapper.js
 * @description Format dữ liệu User Response DTO cho Client.
 * Quy tắc Online tuyệt đối:
 * Chỉ tài khoản nào đang có user.status === 'online' VÀ lastActiveAt < 5 phút mới tính là isOnline: true.
 * Tất cả tài khoản khác mặc định là isOnline: false (Offline).
 */

const checkIsOnline = (user) => {
    // Nếu DB không ghi nhận status === 'online' -> Chắc chắn 100% là Offline
    if (user.status !== 'online') return false;
    if (!user.lastActiveAt) return false;

    const lastActive = new Date(user.lastActiveAt).getTime();
    if (isNaN(lastActive)) return false;

    const FIVE_MINUTES = 5 * 60 * 1000;
    return (Date.now() - lastActive) < FIVE_MINUTES;
};

const toUserResponse = (user) => {
    const isSuspended = Boolean(user.isBlocked || user.status === 'suspended');

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'USER',
        status: isSuspended ? 'suspended' : 'active',
        isBlocked: isSuspended,
        isOnline: !isSuspended && checkIsOnline(user),
        avatar: user.avatar || null,
        phone: user.phone || null,
        jobTitle: user.jobTitle || 'Software Engineer',
        department: user.department || 'Engineering',
        company: user.company || 'KS Organization',
        lastActiveAt: user.lastActiveAt || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

const toUserListResponse = (users) => {
    if (!Array.isArray(users)) return [];
    return users.map(toUserResponse);
};

module.exports = { toUserResponse, toUserListResponse };