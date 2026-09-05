import api from './api';

export const getTaskAttachments = async (taskId) => {
    const response = await api.get(`/attachments/task/${taskId}`);
    return response.data;
};

export const addAttachment = async ({ taskId, filename, originalName, url, size = 0, mimeType }) => {
    const response = await api.post('/attachments', { taskId, filename, originalName, url, size, mimeType });
    return response.data;
};

export const deleteAttachment = async (attachmentId) => {
    const response = await api.delete(`/attachments/${attachmentId}`);
    return response.data;
};
