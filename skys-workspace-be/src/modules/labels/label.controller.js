/**
 * @file label.controller.js
 * @description Tầng Controller cho module Label.
 */
const labelService = require('./label.service');
const { CreateLabelDTO, UpdateLabelDTO } = require('./label.dto');

const getProjectLabels = async (req, res) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        const labels = await labelService.getByProject(projectId);
        res.status(200).json(labels);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const createLabel = async (req, res) => {
    try {
        const dto = new CreateLabelDTO(req.body).validate();
        const lbl = await labelService.createLabel(dto);
        res.status(201).json(lbl);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const updateLabel = async (req, res) => {
    try {
        const dto = new UpdateLabelDTO(req.body).validate();
        const updated = await labelService.updateLabel(req.params.id, dto);
        res.status(200).json(updated);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const deleteLabel = async (req, res) => {
    try {
        const result = await labelService.removeLabel(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

module.exports = {
    getProjectLabels,
    createLabel,
    updateLabel,
    deleteLabel
};
