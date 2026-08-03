/**
 * @file comment.service.js
 * @description Tầng Service cho module Comment.
 * Chứa toàn bộ Business Logic cho bình luận công việc.
 */
const commentRepo = require('./comment.repository');
const commentMapper = require('./comment.mapper');
const { CommentNotFoundError, CommentPermissionError } = require('./comment.error');
const prisma = require('../../config/prisma');
const { NotFoundError } = require('../../shared/errors/AppError');
const { getIo } = require('../../config/socket');

const builCommenTree = (comments = []) => {
    if (!Array.isArray(comments) || comments.length === 0) return [];

    const map = {};
    const rootComments = [];

    comments.forEach(comment => {
        const cId = comment.id || comment._id;
        map[cId] = { ...comment, replies: Array.isArray(comment.replies) ? [...comment.replies] : [] };
    });

    comments.forEach(comment => {
        const cId = comment.id || comment._id;
        if (comment.parentId) {
            if (map[comment.parentId]) {
                map[comment.parentId].replies.push(map[cId]);
            }
        } else {
            rootComments.push(map[cId]);
        }
    });
    return rootComments;
};

const getCommentByTask = async (taskId) => {
    const taskExists = await prisma.task.findUnique({ where: { id: taskId } });
    if (!taskExists) {
        throw new NotFoundError('Công việc');
    }

    const comments = await commentRepo.findCommentByTaskId(taskId);
    const formatted = commentMapper.toCommentListResponse(comments);
    return builCommenTree(formatted);
};

const create = async (dto, userId) => {
    const taskExists = await prisma.task.findUnique({ where: { id: dto.taskId } });
    if (!taskExists) {
        throw new NotFoundError('Công việc');
    }

    const newComment = await commentRepo.createComment({
        content: dto.content,
        taskId: dto.taskId,
        authorId: userId,
        parentId: dto.parentId || null
    });

    const commentRespo = commentMapper.toCommentResponse(newComment);

    getIo().to(`task:${dto.taskId}`).emit('new_comment', commentRespo);

    return commentRespo;
};

const update = async (commentId, dto, currentUserId, userRoleName) => {
    const comment = await commentRepo.findById(commentId);
    if (!comment) {
        throw new CommentNotFoundError();
    }

    const isAuthor = comment.authorId === currentUserId || comment.author?.id === currentUserId;
    const isAdmin = ['SUPER_ADMIN', 'USER_ADMIN'].includes(userRoleName);

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

    const isAuthor = comment.author?.id === currentUserId;
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
    remove,
    builCommenTree
};
