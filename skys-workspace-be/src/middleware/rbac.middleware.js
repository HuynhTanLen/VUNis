/**
 * @file rbac.middleware.js
 * @description Middleware Phân quyền Hệ thống (System RBAC) & Phân quyền Dự án (Project-Scoped RBAC).
 */
const prisma = require('../config/prisma');

/**
 * Middleware Phân quyền Hệ thống (System-Level RBAC) theo chuẩn Google Workspace.
 * - SUPER_ADMIN luôn vượt qua mọi kiểm tra.
 * - Các vai trò khác (USER_ADMIN, GROUPS_ADMIN, SERVICE_ADMIN, HELP_DESK_ADMIN, USER) so sánh trực tiếp với allowedRoles.
 * 
 * @param {...string} allowedRoles - Danh sách các Admin level được phép truy cập
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực, vui lòng đăng nhập' });
        }

        // SUPER_ADMIN luôn có full quyền hệ thống
        if (req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        // Kiểm tra xem role của user thuộc danh sách permitted roles không
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({
            message: `Truy cập bị từ chối. Chức năng này yêu cầu quyền: ${allowedRoles.join(', ')}`
        });
    };
};

/**
 * Middleware kiểm tra quyền thành viên trong một dự án cụ thể.
 * - SUPER_ADMIN và SERVICE_ADMIN hệ thống có thể xem/truy cập mọi dự án.
 * - Owner dự án luôn có toàn quyền trong dự án đó.
 * - Thành viên khác được kiểm tra qua ProjectMember.
 * 
 * @param {...string} allowedProjectRoles - Danh sách vai trò dự án được phép (VD: 'Leader', 'Member', 'Viewer')
 */
const checkProjectPermission = (...allowedProjectRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Chưa xác thực, vui lòng đăng nhập' });
            }

            // SUPER_ADMIN và SERVICE_ADMIN được phép quản trị toàn bộ dự án
            if (['SUPER_ADMIN', 'SERVICE_ADMIN'].includes(req.user.role)) {
                return next();
            }

            // Tự động tìm projectId
            let projectId = req.params.projectId || req.body.projectId || req.query.projectId;
            if (!projectId && req.params.id) {
                const projectExists = await prisma.project.findUnique({ where: { id: req.params.id } });
                if (projectExists) {
                    projectId = req.params.id;
                } else {
                    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
                    if (task) projectId = task.projectId;
                }
            }

            if (!projectId) {
                return res.status(400).json({ message: 'Không tìm thấy ID dự án tương ứng' });
            }

            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project) {
                return res.status(404).json({ message: 'Không tìm thấy dự án' });
            }

            const userIdStr = (req.user.id || req.user.userId).toString();

            // Nếu người dùng hiện tại là Owner dự án -> Cho phép truy cập ngay
            const ownerId = project.ownerId || project.owner;
            if (ownerId && ownerId.toString() === userIdStr) {
                req.currentProject = project;
                return next();
            }

            // Tìm thông tin member qua bảng ProjectMember
            const member = await prisma.projectMember.findFirst({
                where: {
                    projectId: projectId,
                    userId: userIdStr
                }
            });

            if (!member) {
                return res.status(403).json({ message: 'Bạn không có quyền truy cập dự án này' });
            }

            if (allowedProjectRoles.length > 0 && !allowedProjectRoles.includes(member.role)) {
                return res.status(403).json({
                    message: `Vai trò '${member.role}' trong dự án không đủ quyền thực hiện hành động này`
                });
            }

            req.projectMember = member;
            req.currentProject = project;
            next();
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi kiểm tra quyền dự án: ' + error.message });
        }
    };
};

module.exports = { authorize, checkProjectPermission };
