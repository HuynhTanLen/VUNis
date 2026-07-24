/**
 * @file comment.mapper.js
 * @description Chuyển đổi Entity Comment sang Response DTO an toàn cho Frontend.
 */

const toCommentResponse = (comment) => {
    if (!comment) return null;

    return {
        id: comment._id,
        content: comment.content,
        taskId: comment.task?._id || comment.task,
        author: comment.author && typeof comment.author === 'object' && comment.author._id ? {
            id: comment.author._id,
            name: comment.author.name,
            email: comment.author.email
        } : comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
    };
};

const toCommentListResponse = (comments) => {
    if (!Array.isArray(comments)) return [];
    return comments.map(toCommentResponse);
};

module.exports = {
    toCommentResponse,
    toCommentListResponse
};
