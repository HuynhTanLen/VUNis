import api from "./api"

export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
}

export const createProject = async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
}

export const delProject = async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
}
export const updProject = async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
}

export const getAllProjectsAdmin = async () => {
    const response = await api.get('/projects/admin/all');
    return response.data; ///
}

export const deleteProjectAdmin = async (projectId) => {
    const response = await api.delete(`/projects/admin/${projectId}`);
    return response.data;
}

export const getProjectMembers = async (projectId) => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
}

export const addProjectMember = async (projectId, email) => {
    const response = await api.post(`/projects/${projectId}/members`, { email });
    return response.data;
}
