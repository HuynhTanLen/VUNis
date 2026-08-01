/**
 * @file comment.repository.js
 * @description Tầng Repository cho module Comment.
 * Chứa tất cả các truy vấn trực tiếp tới Database qua Prisma.
 */
const prisma = require('../../config/prisma');

const findCommentByTaskId = (taskId) => {
    return prisma.comment.findMany({
        where: { taskId: taskId },
        include: {
            author: { select: { id: true, name: true, email: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const findById = (commentId) => {
    return prisma.comment.findUnique({
        where: { id: commentId },
        include: {
            author: { select: { id: true, name: true, email: true, avatar: true } }
        }
    });
};

const createComment = async (data) => {
    const newComment = await prisma.comment.create({ data });
    return prisma.comment.findUnique({
        where: { id: newComment.id },
        include: {
            author: { select: { id: true, name: true, email: true, avatar: true } }
        }
    });
};

const update = (commentId, content) => {
    return prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
            author: { select: { id: true, name: true, email: true, avatar: true } }
        }
    });
};

const removeComment = (commentId) => {
    return prisma.comment.delete({
        where: { id: commentId }
    });
};

module.exports = {
    findCommentByTaskId,
    findById,
    createComment,
    update,
    removeComment
};
