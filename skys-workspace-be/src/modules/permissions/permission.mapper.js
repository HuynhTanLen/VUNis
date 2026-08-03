/**
 * @file permission.mapper.js
 * @description Format Permission entity sang Response DTO.
 */

const toPermissionResponse = (perm) => {
    if (!perm) return null;
    return {
        id: perm.id,
        name: perm.name,
        code: perm.code,
        module: perm.module,
        createdAt: perm.createdAt
    };
};

const toPermissionListResponse = (permissions) => {
    if (!Array.isArray(permissions)) return [];
    return permissions.map(toPermissionResponse);
};

module.exports = {
    toPermissionResponse,
    toPermissionListResponse
};
