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

// Lấy tất cả bình luận theo Task ID
router.get('/task/:taskId', protect, getCommentsByTask);

// Tạo bình luận mới
router.post('/', protect, createComment);

// Cập nhật bình luận theo ID
router.put('/:id', protect, updateComment);

// Xóa bình luận theo ID
router.delete('/:id', protect, deleteComment);

module.exports = router;
