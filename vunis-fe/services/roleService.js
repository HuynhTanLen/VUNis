import api from "./api";

export const getRoles = async () => {
    const response = await api.get('/roles');
    return response.data;
}

export const getRoleById = async (roleId) => {
    const response = await api.get(`/roles/${roleId}`);
    return response.data;
}

export const createRole = async (roleData) => {
    const response = await api.post('/roles', roleData);
    return response.data;
}

export const updateRole = async (roleId, roleData) => {
    const response = await api.put(`/roles/${roleId}`, roleData);
    return response.data;
}

export const deleteRole = async (roleId) => {
    const response = await api.delete(`/roles/${roleId}`);
    return response.data;
}

export const getAllPermissions = async () => {
    const response = await api.get('/permissions');
    return response.data;
}
