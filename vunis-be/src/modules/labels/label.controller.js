/**
 * @file label.controller.js
 * @description Tầng Controller cho module Label.
 */
const labelService = require('./label.service');
const { CreateLabelDTO, UpdateLabelDTO } = require('./label.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');


const getProjectLabels = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId || req.params.id;
    const labels = await labelService.getByProject(projectId);
    res.status(200).json(labels);
});

const createLabel = asyncHandler(async (req, res) => {
    const dto = new CreateLabelDTO(req.body).validate();
    const lbl = await labelService.createLabel(dto);
    res.status(201).json(lbl);
});

const updateLabel = asyncHandler(async (req, res) => {
    const dto = new UpdateLabelDTO(req.body).validate();
    const updated = await labelService.updateLabel(req.params.id, dto);
    res.status(200).json(updated);
});

const deleteLabel = asyncHandler(async (req, res) => {
    const result = await labelService.removeLabel(req.params.id);
    res.status(200).json(result);
});

module.exports = {
    getProjectLabels,
    createLabel,
    updateLabel,
    deleteLabel
};
