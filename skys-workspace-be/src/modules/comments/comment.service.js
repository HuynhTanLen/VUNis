/**
 * @file comment.service.js
 * @description Tầng Service cho module Comment.
 * Chứa toàn bộ Business Logic cho bình luận công việc.
 */
const commentRepo = require('./comment.repository');
const commentMapper = require('./comment.mapper');
const { CommentNotFoundError, CommentPermissionError } = require('./comment.error');
const Task = require('../tasks/task.schema');
const { NotFoundError } = require('../../shared/errors/AppError');

const getCommentByTask = async (taskId) => {
    const taskExists = await Task.findById(taskId);
    if (!taskExists) {
        throw new NotFoundError('Công việc');
    }

    const comments = await commentRepo.findCommentByTaskId(taskId);
    return commentMapper.toCommentListResponse(comments);
};

const create = async (dto, userId) => {
    const taskExists = await Task.findById(dto.taskId);
    if (!taskExists) {
        throw new NotFoundError('Công việc');
    }

    const newComment = await commentRepo.createComment({
        content: dto.content,
        taskId: dto.taskId,
        userId: userId,
        parentId: dto.parentId || null
    });

    return commentMapper.toCommentResponse(newComment);
};

const update = async (commentId, dto, currentUserId, userRoleName) => {
    const comment = await commentRepo.findById(commentId);
    if (!comment) {
        throw new CommentNotFoundError();
    }

    const isAuthor = comment.userId?._id?.toString() === currentUserId.toString();
    const isAdmin = userRoleName === 'admin' || userRoleName === 'super_admin';

    if (!isAuthor && !isAdmin) {
        throw new CommentPermissionError('Bạn chỉ có thể chỉnh sửa bình luận của chính mình');
    }

    const updated = await commentRepo.update(commentId, dto.content);
    return commentMapper.toCommentResponse(updated);
};

const remove = async (commentId, currentUserId, userRoleName) => {
    const comment = await commentRepo.findById(commentId);
    if (!comment) {
        throw new CommentNotFoundError();
    }

    const isAuthor = comment.userId?._id?.toString() === currentUserId.toString();
    const isAdmin = ['SUPER_ADMIN', 'USER_ADMIN'].includes(userRoleName);

    if (!isAuthor && !isAdmin) {
        throw new CommentPermissionError('Bạn chỉ có thể xóa bình luận của chính mình');
    }

    await commentRepo.removeComment(commentId);
    return { message: 'Xóa bình luận thành công' };
};

module.exports = {
    getCommentByTask,
    create,
    update,
    remove
};
