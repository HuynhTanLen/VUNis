const roleRepo = require('./role.repository');
const roleMapper = require('./role.mapper');
const { RoleNotFoundError, SystemRoleProtectedError, RoleCodeExistsError } = require('./role.error');

const getAllRoles = async () => {
    const list = await roleRepo.findAll();
    return roleMapper.toRoleListResponse(list);
};

const getRoleById = async (id) => {
    const role = await roleRepo.findById(id);
    if (!role) throw new RoleNotFoundError();
    return roleMapper.toRoleResponse(role);
};

const createCustomRole = async (dto) => {
    const existing = await roleRepo.findByCode(dto.code);
    if (existing) throw new RoleCodeExistsError();

    const newRole = await roleRepo.create(
        {
            name: dto.name,
            code: dto.code,
            description: dto.description,
            isSystem: false
        },
        dto.permissionCodes
    );

    return roleMapper.toRoleResponse(newRole);
};

const updateCustomRole = async (id, dto) => {
    const role = await roleRepo.findById(id);
    if (!role) throw new RoleNotFoundError();

    if (role.isSystem) {
        throw new SystemRoleProtectedError();
    }

    const updated = await roleRepo.update(
        id,
        {
            ...(dto.name && { name: dto.name }),
            ...(dto.description !== undefined && { description: dto.description })
        },
        dto.permissionCodes
    );

    return roleMapper.toRoleResponse(updated);
};

const removeCustomRole = async (id) => {
    const role = await roleRepo.findById(id);
    if (!role) throw new RoleNotFoundError();

    if (role.isSystem) {
        throw new SystemRoleProtectedError();
    }

    await roleRepo.remove(id);
    return { message: 'Đã xóa vai trò thành công' };
};

module.exports = {
    getAllRoles,
    getRoleById,
    createCustomRole,
    updateCustomRole,
    removeCustomRole
};
