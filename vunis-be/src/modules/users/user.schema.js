/**
 * @file user.schema.js
 * @description Định nghĩa các Hằng số & Enum cho User trong kiến trúc PostgreSQL Prisma.
 * LƯU Ý: Đã loại bỏ hoàn toàn Mongoose. Mô hình Cơ sở dữ liệu hiện tại được quản lý trong prisma/schema.prisma.
 */

const ADMIN_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    USER_ADMIN: 'USER_ADMIN',
    GROUPS_ADMIN: 'GROUPS_ADMIN',
    SERVICE_ADMIN: 'SERVICE_ADMIN',
    HELP_DESK_ADMIN: 'HELP_DESK_ADMIN',
    USER: 'USER'
};

const USER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    SUSPENDED: 'suspended'
};

module.exports = {
    ADMIN_ROLES,
    USER_STATUS
};
