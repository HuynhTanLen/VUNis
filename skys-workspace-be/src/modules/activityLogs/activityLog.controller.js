/**
 * @file activityLog.controller.js
 * @description Tầng Controller cho module ActivityLog.
 */
const logService = require('./activityLog.service');
const { CreateActivityLogDTO } = require('./activityLog.dto');

const getProjectActivityLogs = async (req, res) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        const logs = await logService.getLogsByProject(projectId);
        res.status(200).json(logs);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const logActivity = async (req, res) => {
    try {
        const dto = new CreateActivityLogDTO(req.body).validate();
        const log = await logService.createLog(dto, req.user.userId);
        res.status(201).json(log);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

module.exports = {
    getProjectActivityLogs,
    logActivity
};
