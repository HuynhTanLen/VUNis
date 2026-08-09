import api from "./api";

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
}

export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
}

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
}

export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
}

export const updateUserRole = async (userId, role) => {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
}

export const updateUserStatus = async (userId, status) => {
    const isBlocked = typeof status === 'boolean' ? status : (status === 'suspended' || status === 'blocked');
    const response = await api.patch(`/users/${userId}/block`, { isBlocked, status });
    return response.data;
}

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
}

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
}

export const resetPassword = async (email, token, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, token, newPassword });
    return response.data;
}

export const logoutUser = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
}

export const getRoles = async () => {
    const response = await api.get('/auth/roles');
    return response.data;
}

export const getSystemStats = async () => {
    const response = await api.get('/system/stats');
    return response.data;
}
