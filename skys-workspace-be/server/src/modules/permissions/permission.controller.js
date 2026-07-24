/**
 * @file permission.controller.js
 * @description Controller layer cho module Permission.
 */
const permService = require('./permission.service');
const { CreatePermissionDTO, UpdatePermissionDTO } = require('./permission.dto');

const getPermissions = async (req, res) => {
    try {
        const perms = await permService.getAllPermissions();
        res.status(200).json(perms);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const createPermission = async (req, res) => {
    try {
        const dto = new CreatePermissionDTO(req.body).validate();
        const perm = await permService.createPermission(dto);
        res.status(201).json(perm);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const updatePermission = async (req, res) => {
    try {
        const dto = new UpdatePermissionDTO(req.body).validate();
        const updated = await permService.updatePermission(req.params.id, dto);
        res.status(200).json(updated);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const deletePermission = async (req, res) => {
    try {
        const result = await permService.removePermission(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

module.exports = {
    getPermissions,
    createPermission,
    updatePermission,
    deletePermission
};
