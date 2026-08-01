/**
 * @file activityLog.service.js
 * @description Tầng Service cho module ActivityLog.
 */
const logRepo = require('./activityLog.repository');
const logMapper = require('./activityLog.mapper');
const prisma = require('../../config/prisma');
const { NotFoundError } = require('../../shared/errors/AppError');

const getLogsByProject = async (projectId) => {
    const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
    if (!projectExists) {
        throw new NotFoundError('Dự án');
    }

    const logs = await logRepo.findByProjectId(projectId);
    return logMapper.toActivityLogListResponse(logs);
};

const createLog = async (dto, userId) => {
    const projectExists = await prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!projectExists) {
        throw new NotFoundError('Dự án');
    }

    const newLog = await logRepo.create({
        action: dto.action,
        details: dto.details || dto.type || '',
        userId: userId,
        projectId: dto.projectId
    });

    return logMapper.toActivityLogResponse(newLog);
};

module.exports = {
    getLogsByProject,
    createLog
};
