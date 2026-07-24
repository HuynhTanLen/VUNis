import api from "./api";

export const getCommentsByTask = async (taskId) => {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
};

export const createComment = async (taskId, content) => {
    const response = await api.post('/comments', { taskId, content });
    return response.data;
};

export const updateComment = async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
};

export const deleteComment = async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
};
