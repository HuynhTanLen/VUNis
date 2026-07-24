/**
 * @file role.seed.js
 * @description Dữ liệu mặc định cho bảng Permission và Role.
 * Chạy khi khởi động server để đảm bảo hệ thống luôn có đầy đủ
 * các quyền hạn cơ bản và vai trò mặc định.
 * 
 * ┌──────────────┬───────┬────────────────────────────────────────────┐
 * │ Role         │ Level │ Permissions                                │
 * ├──────────────┼───────┼────────────────────────────────────────────┤
 * │ super_admin  │  100  │ TẤT CẢ (toàn quyền, isSystem = true)     │
 * │ admin        │   50  │ Quản lý user, project, task, role (trừ    │
 * │              │       │ role:delete và thao tác lên super_admin)   │
 * │ manager      │   30  │ Quản lý project, task, sprint, comment    │
 * │ user         │   10  │ Chỉ đọc + tạo/sửa project & task cá nhân │
 * └──────────────┴───────┴────────────────────────────────────────────┘
 */
const Permission = require('../permissions/permission.schema');
const Role = require('./role.schema');

/**
 * Danh sách toàn bộ permissions trong hệ thống.
 * Format: { code, displayName, description, resource, action }
 */
const ALL_PERMISSIONS = [
    // ── User Management ──
    { code: 'user:read', displayName: 'Xem người dùng', description: 'Xem danh sách và chi tiết người dùng', resource: 'user', action: 'read' },
    { code: 'user:create', displayName: 'Tạo người dùng', description: 'Tạo tài khoản người dùng mới', resource: 'user', action: 'create' },
    { code: 'user:update', displayName: 'Sửa người dùng', description: 'Chỉnh sửa thông tin người dùng', resource: 'user', action: 'update' },
    { code: 'user:delete', displayName: 'Xóa người dùng', description: 'Xóa tài khoản người dùng', resource: 'user', action: 'delete' },

    // ── Project Management ──
    { code: 'project:read', displayName: 'Xem dự án', description: 'Xem danh sách và chi tiết dự án', resource: 'project', action: 'read' },
    { code: 'project:create', displayName: 'Tạo dự án', description: 'Khởi tạo dự án mới', resource: 'project', action: 'create' },
    { code: 'project:update', displayName: 'Sửa dự án', description: 'Chỉnh sửa thông tin dự án', resource: 'project', action: 'update' },
    { code: 'project:delete', displayName: 'Xóa dự án', description: 'Xóa dự án và toàn bộ dữ liệu liên quan', resource: 'project', action: 'delete' },

    // ── Task Management ──
    { code: 'task:read', displayName: 'Xem công việc', description: 'Xem danh sách và chi tiết công việc', resource: 'task', action: 'read' },
    { code: 'task:create', displayName: 'Tạo công việc', description: 'Thêm công việc mới vào dự án', resource: 'task', action: 'create' },
    { code: 'task:update', displayName: 'Sửa công việc', description: 'Chỉnh sửa nội dung và trạng thái công việc', resource: 'task', action: 'update' },
    { code: 'task:delete', displayName: 'Xóa công việc', description: 'Xóa công việc khỏi dự án', resource: 'task', action: 'delete' },

    // ── Role & Permission ──
    { code: 'role:read', displayName: 'Xem vai trò', description: 'Xem danh sách vai trò và quyền hạn', resource: 'role', action: 'read' },
    { code: 'role:create', displayName: 'Tạo vai trò', description: 'Tạo vai trò mới trong hệ thống', resource: 'role', action: 'create' },
    { code: 'role:update', displayName: 'Sửa vai trò', description: 'Chỉnh sửa quyền hạn của vai trò', resource: 'role', action: 'update' },
    { code: 'role:delete', displayName: 'Xóa vai trò', description: 'Xóa vai trò (không áp dụng cho role hệ thống)', resource: 'role', action: 'delete' },
    { code: 'role:assign', displayName: 'Gán vai trò', description: 'Gán vai trò cho người dùng', resource: 'role', action: 'assign' },

    // ── Sprint Management ──
    { code: 'sprint:read', displayName: 'Xem Sprint', description: 'Xem danh sách Sprint', resource: 'sprint', action: 'read' },
    { code: 'sprint:create', displayName: 'Tạo Sprint', description: 'Tạo Sprint mới', resource: 'sprint', action: 'create' },
    { code: 'sprint:update', displayName: 'Sửa Sprint', description: 'Chỉnh sửa thông tin Sprint', resource: 'sprint', action: 'update' },
    { code: 'sprint:delete', displayName: 'Xóa Sprint', description: 'Xóa Sprint', resource: 'sprint', action: 'delete' },

    // ── Comment ──
    { code: 'comment:read', displayName: 'Xem bình luận', description: 'Xem bình luận trên công việc', resource: 'comment', action: 'read' },
    { code: 'comment:create', displayName: 'Viết bình luận', description: 'Thêm bình luận mới', resource: 'comment', action: 'create' },
    { code: 'comment:delete', displayName: 'Xóa bình luận', description: 'Xóa bình luận', resource: 'comment', action: 'delete' },

    // ── Notification ──
    { code: 'notification:read', displayName: 'Xem thông báo', description: 'Xem và đánh dấu đã đọc thông báo', resource: 'notification', action: 'read' },

    // ── ActivityLog ──
    { code: 'log:read', displayName: 'Xem nhật ký', description: 'Xem nhật ký hoạt động dự án', resource: 'log', action: 'read' },
];

/**
 * Cấu hình vai trò mặc định kèm danh sách permission codes.
 */
const DEFAULT_ROLES = [
    {
        name: 'super_admin',
        displayName: 'Quản trị viên tối cao',
        description: 'Toàn quyền hệ thống, không thể bị xóa hoặc hạ cấp',
        isSystem: true,
        level: 100,
        permissionCodes: ALL_PERMISSIONS.map(p => p.code) // Toàn bộ
    },
    {
        name: 'admin',
        displayName: 'Quản trị viên',
        description: 'Quản lý người dùng, dự án và vai trò (trừ super_admin)',
        isSystem: false,
        level: 50,
        permissionCodes: [
            'user:read', 'user:create', 'user:update', 'user:delete',
            'project:read', 'project:create', 'project:update', 'project:delete',
            'task:read', 'task:create', 'task:update', 'task:delete',
            'role:read', 'role:assign',
            'sprint:read', 'sprint:create', 'sprint:update', 'sprint:delete',
            'comment:read', 'comment:create', 'comment:delete',
            'notification:read', 'log:read'
        ]
    },
    {
        name: 'Project Manager',
        displayName: 'Quản lý dự án',
        description: 'Quản lý dự án và công việc, quản lý thành viên',
        isSystem: false,
        level: 30,
        permissionCodes: [
            'user:read',
            'project:read', 'project:create', 'project:update',
            'task:read', 'task:create', 'task:update', 'task:delete',
            'sprint:read', 'sprint:create', 'sprint:update',
            'comment:read', 'comment:create',
            'notification:read', 'log:read'
        ]
    },
    {
        name: 'user',
        displayName: 'Người dùng',
        description: 'Quyền cơ bản: xem và tạo dự án, công việc cá nhân',
        isSystem: false,
        level: 10,
        permissionCodes: [
            'project:read', 'project:create',
            'task:read', 'task:create', 'task:update',
            'sprint:read',
            'comment:read', 'comment:create',
            'notification:read', 'log:read'
        ]
    }
];

/**
 * Seed toàn bộ Permissions và Roles vào database.
 * Sử dụng upsert để không bị trùng lặp khi chạy nhiều lần.
 */
const seedRolesAndPermissions = async () => {
    try {
        // ── Bước 1: Upsert tất cả Permissions ──
        const permissionDocs = [];
        for (const perm of ALL_PERMISSIONS) {
            const doc = await Permission.findOneAndUpdate(
                { code: perm.code },
                { $set: perm },
                { upsert: true, new: true }
            );
            permissionDocs.push(doc);
        }
        console.log(`  Đã đồng bộ ${permissionDocs.length} permissions`);

        // Tạo map code → ObjectId để gán vào Role
        const permMap = {};
        permissionDocs.forEach(doc => { permMap[doc.code] = doc._id; });

        // ── Bước 2: Upsert tất cả Roles ──
        for (const roleDef of DEFAULT_ROLES) {
            const permissionIds = roleDef.permissionCodes
                .map(code => permMap[code])
                .filter(Boolean);

            await Role.findOneAndUpdate(
                { name: roleDef.name },
                {
                    $set: {
                        displayName: roleDef.displayName,
                        description: roleDef.description,
                        isSystem: roleDef.isSystem,
                        level: roleDef.level,
                        permissions: permissionIds
                    }
                },
                { upsert: true, new: true }
            );
        }
        console.log(`   Đã đồng bộ ${DEFAULT_ROLES.length} roles (super_admin, admin, manager, user)`);

    } catch (error) {
        console.error('  Lỗi khi seed Roles & Permissions:', error.message);
    }
};

module.exports = { seedRolesAndPermissions, ALL_PERMISSIONS, DEFAULT_ROLES };
