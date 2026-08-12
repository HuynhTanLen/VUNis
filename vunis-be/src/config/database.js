/**
 * @file database.js
 * @description Kết nối PostgreSQL bằng Prisma và Seeding dữ liệu mặc định.
 * Tách riêng logic kết nối DB ra khỏi server.js để dễ bảo trì.
 */
const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('Kết nối PostgreSQL thành công');
        
        // Chạy seed admin tài khoản mặc định
        await seedDefaultData();
    } catch (error) {
        console.error('Lỗi kết nối PostgreSQL:', error.message);
        process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
    }
};

/**
 * Tự động tạo dữ liệu mặc định (Super Admin account) nếu chưa có.
 */
const seedDefaultData = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@ks.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

        const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await prisma.user.create({
                data: {
                    name: 'System Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'SUPER_ADMIN',
                    status: 'offline',
                    isBlocked: false
                }
            });
            console.log(`Đã tạo tài khoản Super Admin từ môi trường env (${adminEmail})`);
        } else {
            console.log('Tài khoản Admin hệ thống đã tồn tại.');
        }
        await seedRolesAndPermissions();
    } catch (error) {
        console.error('Lỗi khi seed dữ liệu mặc định:', error.message);
    }
};

/**
 * Tự động tạo danh sách Quyền hạn (Permissions) và Vai trò (Roles) tiêu chuẩn.
 */
const seedRolesAndPermissions = async () => {
    try {
        // 1. Danh sách Permissions hệ thống
        const defaultPermissions = [
            { code: 'PROJECT_VIEW', name: 'Xem thông tin dự án', module: 'PROJECT' },
            { code: 'PROJECT_EDIT', name: 'Chỉnh sửa thông tin dự án', module: 'PROJECT' },
            { code: 'PROJECT_DELETE', name: 'Xóa dự án', module: 'PROJECT' },

            { code: 'MEMBER_VIEW', name: 'Xem danh sách thành viên', module: 'MEMBER' },
            { code: 'MEMBER_INVITE', name: 'Mời thành viên vào dự án', module: 'MEMBER' },
            { code: 'MEMBER_ROLE_CHANGE', name: 'Thay đổi vai trò thành viên', module: 'MEMBER' },
            { code: 'MEMBER_REMOVE', name: 'Xóa thành viên khỏi dự án', module: 'MEMBER' },

            { code: 'TASK_VIEW', name: 'Xem danh sách công việc', module: 'TASK' },
            { code: 'TASK_CREATE', name: 'Tạo công việc mới', module: 'TASK' },
            { code: 'TASK_EDIT', name: 'Chỉnh sửa công việc', module: 'TASK' },
            { code: 'TASK_DELETE', name: 'Xóa công việc', module: 'TASK' },
            { code: 'TASK_ASSIGN', name: 'Gán người thực hiện công việc', module: 'TASK' },

            { code: 'SPRINT_VIEW', name: 'Xem danh sách Sprint', module: 'SPRINT' },
            { code: 'SPRINT_CREATE', name: 'Tạo Sprint mới', module: 'SPRINT' },
            { code: 'SPRINT_START', name: 'Bắt đầu Sprint', module: 'SPRINT' },
            { code: 'SPRINT_COMPLETE', name: 'Hoàn thành Sprint', module: 'SPRINT' },

            { code: 'COMMENT_VIEW', name: 'Xem bình luận', module: 'COMMENT' },
            { code: 'COMMENT_CREATE', name: 'Viết bình luận', module: 'COMMENT' },
            { code: 'COMMENT_DELETE', name: 'Xóa bình luận', module: 'COMMENT' },

            { code: 'ATTACHMENT_VIEW', name: 'Xem tệp đính kèm', module: 'ATTACHMENT' },
            { code: 'ATTACHMENT_UPLOAD', name: 'Tải tệp đính kèm lên', module: 'ATTACHMENT' },
            { code: 'ATTACHMENT_DELETE', name: 'Xóa tệp đính kèm', module: 'ATTACHMENT' },
        ];

        for (const perm of defaultPermissions) {
            await prisma.permission.upsert({
                where: { code: perm.code },
                update: { name: perm.name, module: perm.module },
                create: perm
            });
        }

        // 2. Danh sách Roles mặc định
        const defaultRoles = [
            { code: 'PROJECT_MANAGER', name: 'Chủ dự án / Project Manager', description: 'Quản lý toàn bộ dự án', isSystem: true },
            { code: 'FRONTEND_LEAD', name: 'Trưởng nhóm Frontend', description: 'Quản lý mảng giao diện Frontend', isSystem: true },
            { code: 'BACKEND_LEAD', name: 'Trưởng nhóm Backend', description: 'Quản lý mảng dữ liệu Backend', isSystem: true },
            { code: 'BA_LEAD', name: 'Trưởng nhóm Phân tích', description: 'Quản lý mảng Yêu cầu & Nghiệp vụ', isSystem: true },
            { code: 'DESIGN_LEAD', name: 'Trưởng nhóm Thiết kế', description: 'Quản lý mảng UI/UX', isSystem: true },
            { code: 'QA_LEAD', name: 'Trưởng nhóm QA/Tester', description: 'Quản lý Kiểm thử & Chất lượng', isSystem: true },
            { code: 'DEVOPS_LEAD', name: 'Trưởng nhóm DevOps', description: 'Quản lý Hạ tầng & Triển khai', isSystem: true },
            { code: 'BUSINESS_ANALYST', name: 'Chuyên viên Phân tích (BA)', description: 'Khảo sát nghiệp vụ & viết tài liệu SRS', isSystem: true },
            { code: 'FRONTEND_DEVELOPER', name: 'Lập trình viên Frontend', description: 'Phát triển giao diện web', isSystem: true },
            { code: 'BACKEND_DEVELOPER', name: 'Lập trình viên Backend', description: 'Phát triển API & Database', isSystem: true },
            { code: 'UI_UX_DESIGNER', name: 'Thiết kế UI/UX', description: 'Thiết kế giao diện & trải nghiệm', isSystem: true },
            { code: 'QA_TESTER', name: 'Kiểm thử viên (QA/Tester)', description: 'Kiểm thử phần mềm & viết Testcase', isSystem: true },
            { code: 'DEVOPS_ENGINEER', name: 'Kỹ sư DevOps', description: 'Vận hành hệ thống & CI/CD', isSystem: true },
            { code: 'MEMBER', name: 'Thành viên Dự án', description: 'Thành viên tham gia thực hiện công việc', isSystem: true },
        ];

        for (const roleData of defaultRoles) {
            await prisma.role.upsert({
                where: { code: roleData.code },
                update: { name: roleData.name, description: roleData.description, isSystem: roleData.isSystem },
                create: roleData
            });
        }

        console.log('Đã khởi tạo thành công dữ liệu mặc định cho Permissions và Roles!');
    } catch (err) {
        console.error('Lỗi khi seed Permissions & Roles:', err.message);
    }
};


module.exports = connectDatabase;
