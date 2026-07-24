/**
 * @file role.mapper.js
 * @description Format Role entity sang Response DTO.
 */

const toRoleResponse = (role) => {
    if (!role) return null;

    return {
        id: role._id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isSystem: role.isSystem || false,
        level: role.level || 10,
        permissions: Array.isArray(role.permissions) ? role.permissions.map(p => {
            if (p && typeof p === 'object' && p._id) {
                return {
                    id: p._id,
                    code: p.code,
                    displayName: p.displayName,
                    resource: p.resource,
                    action: p.action
                };
            }
            return p;
        }) : [],
        createdAt: role.createdAt
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
