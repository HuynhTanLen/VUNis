import api from './api';

export const getSprintsByProject = async (projectId) => {
    const response = await api.get(`/sprints/project/${projectId}`);
    return response.data;
};

export const createSprint = async (projectId, sprintData) => {
    const response = await api.post(`/sprints/project/${projectId}`, sprintData);
    return response.data;
};

export const completeSprint = async (sprintId) => {
    const response = await api.put(`/sprints/${sprintId}/complete`);
    return response.data;
};

export const startSprint = async (sprintId) => {
    const response = await api.patch(`/sprints/${sprintId}/start`);
    return response.data;
};
