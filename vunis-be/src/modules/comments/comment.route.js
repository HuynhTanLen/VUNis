/**
 * @file comment.route.js
 * @description Định tuyến API cho module Comment.
 * Base path: /api/comments
 */
const express = require('express');
const router = express.Router();
const {
    getCommentsByTask,
    createComment,
    updateComment,
    deleteComment
} = require('./comment.controller');
const { protect } = require('../../middleware/auth.middleware');
const { checkProjectPermission } = require('../../middleware/rbac.middleware');

// Lấy tất cả bình luận theo Task ID — mọi thành viên dự án được xem
router.get('/task/:taskId', protect, checkProjectPermission(), getCommentsByTask);

// Tạo bình luận mới — mọi thành viên dự án được bình luận
router.post('/', protect, checkProjectPermission(), createComment);

// Cập nhật bình luận theo ID — quyền tác giả/admin được xử lý trong service, ở đây chỉ chặn người ngoài dự án
router.put('/:id', protect, checkProjectPermission(), updateComment);

// Xóa bình luận theo ID
router.delete('/:id', protect, checkProjectPermission(), deleteComment);

module.exports = router;
