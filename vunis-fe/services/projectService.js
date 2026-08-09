import api from "./api"

export const getProjects = async () => {
    const response = await api.get(`/projects?t=${Date.now()}`);
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
    const response = await api.get(`/projects/admin/all?t=${Date.now()}`);
    return response.data;
}

export const deleteProjectAdmin = async (projectId) => {
    const response = await api.delete(`/projects/admin/${projectId}`);
    return response.data;
}

export const getProjectMembers = async (projectId) => {
    const response = await api.get(`/projects/${projectId}/members?t=${Date.now()}`);
    return response.data;
}

export const addProjectMember = async (projectId, email, role = 'MEMBER') => {
    const response = await api.post('/project-members', { projectId, email, role });
    return response.data;
}

export const updateProjectMemberRole = async (memberId, role) => {
    const response = await api.put(`/project-members/${memberId}/role`, { role });
    return response.data;
}

export const removeProjectMember = async (memberId) => {
    const response = await api.delete(`/project-members/${memberId}`);
    return response.data;
}

/**
 * Lấy dữ liệu Gantt Chart dạng Tree Structure từ backend
 * @param {string} projectId
 */
export const getGanttData = async (projectId) => {
    const response = await api.get(`/projects/${projectId}/gantt`);
    return response.data;
};

/**
 * Lấy tổng chi phí dự án từ các TaskAssignment
 * @param {string} projectId
 */
export const getProjectTotalCost = async (projectId) => {
    const response = await api.get(`/projects/${projectId}/cost`);
    return response.data;
};
