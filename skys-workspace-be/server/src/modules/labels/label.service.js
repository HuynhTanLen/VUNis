/**
 * @file label.service.js
 * @description Tầng Service cho module Label.
 */
const labelRepo = require('./label.repository');
const labelMapper = require('./label.mapper');
const { LabelNotFoundError } = require('./label.error');
const Project = require('../projects/project.schema');
const { NotFoundError } = require('../../shared/errors/AppError');

const getByProject = async (projectId) => {
    const projectExists = await Project.findById(projectId);
    if (!projectExists) throw new NotFoundError('Dự án');

    const list = await labelRepo.findByProjectId(projectId);
    return labelMapper.toLabelListResponse(list);
};

const createLabel = async (dto) => {
    const projectExists = await Project.findById(dto.projectId);
    if (!projectExists) throw new NotFoundError('Dự án');

    const lbl = await labelRepo.create({
        name: dto.name,
        color: dto.color,
        project: dto.projectId
    });

    return labelMapper.toLabelResponse(lbl);
};

const updateLabel = async (id, dto) => {
    const lbl = await labelRepo.findById(id);
    if (!lbl) throw new LabelNotFoundError();

    const updated = await labelRepo.update(id, {
        ...(dto.name && { name: dto.name }),
        ...(dto.color && { color: dto.color })
    });

    return labelMapper.toLabelResponse(updated);
};

const removeLabel = async (id) => {
    const lbl = await labelRepo.findById(id);
    if (!lbl) throw new LabelNotFoundError();

    await labelRepo.remove(id);
    return { message: 'Đã xóa nhãn thành công' };
};

module.exports = {
    getByProject,
    createLabel,
    updateLabel,
    removeLabel
};
