/**
 * @file permission.schema.js
 * @description Mongoose Schema cho bảng Permission.
 * Định nghĩa từng quyền hạn cụ thể trong hệ thống.
 * 
 * Mỗi Permission đại diện cho MỘT hành động trên MỘT tài nguyên.
 * Format mã quyền: "resource:action"
 * 
 * Ví dụ:
 *   { code: 'user:delete',    resource: 'user',    action: 'delete', displayName: 'Xóa người dùng' }
 *   { code: 'project:create', resource: 'project', action: 'create', displayName: 'Tạo dự án mới' }
 *   { code: 'task:update',    resource: 'task',    action: 'update', displayName: 'Chỉnh sửa công việc' }
 */
const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    /**
     * Mã quyền duy nhất (unique key), format: "resource:action".
     * VD: 'user:read', 'project:delete', 'task:update', 'role:assign'
     */
    code: {
        type: String,
        required: [true, 'Mã quyền là bắt buộc'],
        unique: true,
        trim: true,
        lowercase: true
    },

    /**
     * Tên hiển thị trên UI.
     * VD: 'Xem danh sách người dùng', 'Xóa dự án'
     */
    displayName: {
        type: String,
        required: [true, 'Tên hiển thị quyền là bắt buộc'],
        trim: true
    },

    /**
     * Mô tả chi tiết quyền hạn (hiển thị tooltip trong trang quản trị).
     */
    description: {
        type: String,
        default: '',
        trim: true
    },

    /**
     * Nhóm tài nguyên mà quyền này tác động.
     * Dùng để phân nhóm hiển thị trên UI quản trị.
     * VD: 'user', 'project', 'task', 'role', 'sprint', 'comment', 'notification'
     */
    resource: {
        type: String,
        required: [true, 'Nhóm tài nguyên là bắt buộc'],
        trim: true,
        lowercase: true
    },

    /**
     * Hành động cụ thể trên tài nguyên.
     * VD: 'create', 'read', 'update', 'delete', 'assign', 'export'
     */
    action: {
        type: String,
        required: [true, 'Hành động là bắt buộc'],
        trim: true,
        lowercase: true
    }
}, {
    timestamps: true
});

// Index để truy vấn nhanh theo nhóm tài nguyên
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ code: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
