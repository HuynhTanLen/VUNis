/**
 * @file projectMember.schema.js
 * @description Mongoose Schema cho bảng ProjectMember.
 * Quản lý thành viên và vai trò trong từng dự án cụ thể.
 */
const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Thành viên phải liên kết với một tài khoản người dùng']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Thành viên phải thuộc về một dự án']
    },
    role: {
        type: String,
        enum: [
            'PROJECT_MANAGER',

            'FRONTEND_LEAD',
            'FRONTEND_MEMBER',

            'BACKEND_LEAD',
            'BACKEND_MEMBER',

            'QA_LEAD',
            'QA_TESTER',

            'DEVOPS_LEAD',
            'DEVOPS_MEMBER',

            'DESIGNER_LEAD',
            'DESIGNER-MEMBER',

            'BUSINESS-ANALYST',
            'MEMBER'
        ],
        default: 'MEMBER'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Đảm bảo mỗi cặp (user, project) là duy nhất
projectMemberSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
