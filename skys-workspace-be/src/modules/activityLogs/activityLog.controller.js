/**
 * @file activityLog.controller.js
 * @description Tầng Controller cho module ActivityLog.
 */
const logService = require('./activityLog.service');
const { CreateActivityLogDTO } = require('./activityLog.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getProjectActivityLogs = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId || req.params.id;
    const logs = await logService.getLogsByProject(projectId);
    res.status(200).json(logs);
});

const logActivity = asyncHandler(async (req, res) => {
    const dto = new CreateActivityLogDTO(req.body).validate();
    const log = await logService.createLog(dto, req.user.userId);
    res.status(201).json(log);
});

module.exports = {
    getProjectActivityLogs,
    logActivity
};
