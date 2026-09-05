import api from './api';

export const getTasksByProject = async (projectId) => {
    const response = await api.get(`/tasks/${projectId}`);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}`, { status });
    return response.data;
};

export const updateTask = async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
};

/**
 * Lấy lịch sử phân công (TaskAssignment) của một task
 * @param {string} taskId
 */
export const getTaskAssignmentsHistory = async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/assignments`);
    return response.data;
};

export const addSubtask = async (taskId, title) => {
    const response = await api.post(`/tasks/${taskId}/subtasks`, { title });
    return response.data;
};

export const toggleSubtask = async (taskId, subtaskId) => {
    const response = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
    return response.data;
};

export const editSubtask = async (taskId, subtaskId, title) => {
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, { title });
    return response.data;
};

export const removeSubtask = async (taskId, subtaskId) => {
    const response = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
    return response.data;
};
