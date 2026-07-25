const toUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'USER',
    status: user.status || 'offline',
    isBlocked: Boolean(user.isBlocked),
    avatar: user.avatar || null,
    phone: user.phone || null,
    jobTitle: user.jobTitle || 'Software Engineer',
    department: user.department || 'Engineering',
    company: user.company || 'Skys Organization',
    lastActiveAt: user.lastActiveAt || user.updatedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

const toUserListResponse = (users) => {
    if (!Array.isArray(users)) return [];
    return users.map(toUserResponse);
};
module.exports = { toUserResponse, toUserListResponse };