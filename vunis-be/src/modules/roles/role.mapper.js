/**
 * @file role.mapper.js
 * @description Format Role entity sang Response DTO cho Frontend.
 */

const toRoleResponse = (role) => {
    if (!role) return null;
    return {
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description || '',
        isSystem: !!role.isSystem,
        permissions: Array.isArray(role.permissions)
            ? role.permissions.map(p => p.permission?.code || p.permissionId || p)
            : [],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
    };
};

const toRoleListResponse = (roles) => {
    if (!Array.isArray(roles)) return [];
    return roles.map(toRoleResponse);
};

module.exports = {
    toRoleResponse,
    toRoleListResponse
};
