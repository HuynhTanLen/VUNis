const roleService = require('./role.service');
const { CreateRoleDTO, UpdateRoleDTO } = require('./role.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getRoles = asyncHandler(async (req, res) => {
    const roles = await roleService.getAllRoles();
    res.status(200).json(roles);
});

const getRoleById = asyncHandler(async (req, res) => {
    const role = await roleService.getRoleById(req.params.id);
    res.status(200).json(role);
});

const createRole = asyncHandler(async (req, res) => {
    const dto = new CreateRoleDTO(req.body).validate();
    const newRole = await roleService.createCustomRole(dto);
    res.status(201).json(newRole);
});

const updateRole = asyncHandler(async (req, res) => {
    const dto = new UpdateRoleDTO(req.body).validate();
    const updated = await roleService.updateCustomRole(req.params.id, dto);
    res.status(200).json(updated);
});

const deleteRole = asyncHandler(async (req, res) => {
    const result = await roleService.removeCustomRole(req.params.id);
    res.status(200).json(result);
});

module.exports = {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};
