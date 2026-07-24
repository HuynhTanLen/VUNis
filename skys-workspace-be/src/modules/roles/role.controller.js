/**
 * @file role.controller.js
 * @description Controller layer cho module Role.
 */
const roleService = require('./role.service');
const { CreateRoleDTO, UpdateRoleDTO } = require('./role.dto');

const getRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const createRole = async (req, res) => {
    try {
        const dto = new CreateRoleDTO(req.body).validate();
        const role = await roleService.createRole(dto);
        res.status(201).json(role);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const updateRole = async (req, res) => {
    try {
        const dto = new UpdateRoleDTO(req.body).validate();
        const updated = await roleService.updateRole(req.params.id, dto);
        res.status(200).json(updated);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const deleteRole = async (req, res) => {
    try {
        const result = await roleService.removeRole(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole
};
