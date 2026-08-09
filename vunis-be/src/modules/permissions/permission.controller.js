/**
 * @file permission.controller.js
 * @description Tầng Controller cho module Permission.
 */
const permService = require('./permission.service');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getAllPerm = asyncHandler(async (req, res, next) => {
    const permissions = await permService.getAllPermissions();
    res.status(200).json(permissions)
});

module.exports = {
    getAllPerm
};
