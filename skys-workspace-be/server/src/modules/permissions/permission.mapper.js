/**
 * @file permission.mapper.js
 * @description Format Permission entity sang Response DTO.
 */

const toPermissionResponse = (perm) => {
    if (!perm) return null;

    return {
        id: perm._id,
        code: perm.code,
        displayName: perm.displayName,
        description: perm.description,
        resource: perm.resource,
        action: perm.action,
        createdAt: perm.createdAt
    };
};

const toPermissionListResponse = (perms) => {
    if (!Array.isArray(perms)) return [];
    return perms.map(toPermissionResponse);
};

module.exports = {
    toPermissionResponse,
    toPermissionListResponse
};
