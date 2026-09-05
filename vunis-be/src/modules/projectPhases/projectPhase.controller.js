/**
 * @file projectPhase.controller.js
 * @description Tầng Controller cho module ProjectPhase.
 */
const phaseService = require('./projectPhase.service');
const { CreateProjectPhaseDTO, UpdateProjectPhaseDTO } = require('./projectPhase.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getProjectPhases = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId;
    const phases = await phaseService.getByProject(projectId);
    res.status(200).json(phases);
});

const createProjectPhase = asyncHandler(async (req, res) => {
    const dto = new CreateProjectPhaseDTO(req.body).validate();
    const phase = await phaseService.createPhase(dto);
    res.status(201).json(phase);
});

const updateProjectPhase = asyncHandler(async (req, res) => {
    const dto = new UpdateProjectPhaseDTO(req.body).validate();
    const updated = await phaseService.updatePhase(req.params.id, dto);
    res.status(200).json(updated);
});

const deleteProjectPhase = asyncHandler(async (req, res) => {
    const result = await phaseService.removePhase(req.params.id);
    res.status(200).json(result);
});

const seedProjectPhases = asyncHandler(async (req, res) => {
    const phases = await phaseService.seedDefaultPhases(req.params.projectId);
    res.status(201).json(phases);
});

module.exports = {
    getProjectPhases,
    createProjectPhase,
    updateProjectPhase,
    deleteProjectPhase,
    seedProjectPhases
};
