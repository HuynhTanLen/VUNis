/**
 * @file role.service.js
 * @description Service layer cho module Role.
 */
const roleRepo = require('./role.repository');
const roleMapper = require('./role.mapper');
const { RoleNotFoundError } = require('./role.error');
const { ConflictError, ForbiddenError } = require('../../shared/errors/AppError');

const getAllRoles = async () => {
    const list = await roleRepo.findAll();
    return roleMapper.toRoleListResponse(list);
};

const createRole = async (dto) => {
    const existing = await roleRepo.findByName(dto.name);
    if (existing) {
        throw new ConflictError(`Vai trò với tên "${dto.name}" đã tồn tại`);
    }

    const role = await roleRepo.create({
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        permissions: dto.permissions,
        level: dto.level,
        isSystem: false
    });

    return roleMapper.toRoleResponse(role);
};

const updateRole = async (id, dto) => {
    const role = await roleRepo.findById(id);
    if (!role) throw new RoleNotFoundError();

    if (role.isSystem) {
        throw new ForbiddenError('Không thể sửa vai trò hệ thống mặc định');
    }

    const updated = await roleRepo.update(id, {
        ...(dto.displayName && { displayName: dto.displayName }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.permissions !== undefined && { permissions: dto.permissions }),
        ...(dto.level !== undefined && { level: dto.level })
    });

    return roleMapper.toRoleResponse(updated);
};

const removeRole = async (id) => {
    const role = await roleRepo.findById(id);
    if (!role) throw new RoleNotFoundError();

    if (role.isSystem) {
        throw new ForbiddenError('Không thể xóa vai trò hệ thống mặc định');
    }

    await roleRepo.remove(id);
    return { message: 'Đã xóa vai trò thành công' };
};

module.exports = {
    getAllRoles,
    createRole,
    updateRole,
    removeRole
};
