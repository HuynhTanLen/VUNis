/**
 * @file permission.service.js
 * @description Tầng Service xử lý Business Logic cho module Permission.
 */
const permRepo = require('./permission.repository');
const permMapper = require('./permission.mapper');

const getAllPermissions = async () => {
    const list = await permRepo.findAll();
    return permMapper.toPermissionListResponse(list);
}

module.exports = {
    getAllPermissions
};
