import api from "./api";

export const getProjectPhases = async (projectId) => {
    const response = await api.get(`/project-phases/project/${projectId}`);
    return response.data;
};

export const createPhase = async (phaseData) => {
    const response = await api.post('/project-phases', phaseData);
    return response.data;
};

export const updatePhase = async (phaseId, phaseData) => {
    const response = await api.put(`/project-phases/${phaseId}`, phaseData);
    return response.data;
};

export const deletePhase = async (phaseId) => {
    const response = await api.delete(`/project-phases/${phaseId}`);
    return response.data;
};

export const seedProjectPhases = async (projectId) => {
    const response = await api.post(`/project-phases/project/${projectId}/seed`);
    return response.data;
};
