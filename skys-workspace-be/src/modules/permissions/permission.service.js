/**
 * @file permission.service.js
 * @description Service layer cho module Permission.
 */
const permRepo = require('./permission.repository');
const permMapper = require('./permission.mapper');
const { PermissionNotFoundError } = require('./permission.error');
const { ConflictError } = require('../../shared/errors/AppError');

const getAllPermissions = async () => {
    const list = await permRepo.findAll();
    return permMapper.toPermissionListResponse(list);
};

const createPermission = async (dto) => {
    const existing = await permRepo.findByCode(dto.code);
    if (existing) {
        throw new ConflictError(`Quyền hạn với mã "${dto.code}" đã tồn tại`);
    }

    const perm = await permRepo.create({
        code: dto.code,
        displayName: dto.displayName,
        description: dto.description,
        resource: dto.resource,
        action: dto.action
    });

    return permMapper.toPermissionResponse(perm);
};

const updatePermission = async (id, dto) => {
    const perm = await permRepo.findById(id);
    if (!perm) throw new PermissionNotFoundError();

    const updated = await permRepo.update(id, {
        ...(dto.displayName && { displayName: dto.displayName }),
        ...(dto.description !== undefined && { description: dto.description })
    });

    return permMapper.toPermissionResponse(updated);
};

const removePermission = async (id) => {
    const perm = await permRepo.findById(id);
    if (!perm) throw new PermissionNotFoundError();

    await permRepo.remove(id);
    return { message: 'Đã xóa quyền hạn thành công' };
};

module.exports = {
    getAllPermissions,
    createPermission,
    updatePermission,
    removePermission
};
