/**
 * @file activityLog.service.js
 * @description Tầng Service cho module ActivityLog.
 */
const logRepo = require('./activityLog.repository');
const logMapper = require('./activityLog.mapper');
const Project = require('../projects/project.schema');
const { NotFoundError } = require('../../shared/errors/AppError');

const getLogsByProject = async (projectId) => {
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
        throw new NotFoundError('Dự án');
    }

    const logs = await logRepo.findByProjectId(projectId);
    return logMapper.toActivityLogListResponse(logs);
};

const createLog = async (dto, userId) => {
    const projectExists = await Project.findById(dto.projectId);
    if (!projectExists) {
        throw new NotFoundError('Dự án');
    }

    const newLog = await logRepo.create({
        action: dto.action,
        type: dto.type,
        user: userId,
        project: dto.projectId
    });

    return logMapper.toActivityLogResponse(newLog);
};

module.exports = {
    getLogsByProject,
    createLog
};
