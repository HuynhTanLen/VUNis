const sprintService = require('./sprint.service');
const { CreateSprintDTO } = require('./sprint.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getSprints = asyncHandler(async (req, res) => {
        const sprints = await sprintService.getByProject(req.params.projectId);
        res.status(200).json(sprints);
});

const createSprint = asyncHandler(async (req, res) => {
        const dto = new CreateSprintDTO(req.body).validate();
        const sprint = await sprintService.create(req.params.projectId, dto);
        res.status(201).json(sprint);
});

const completeSprint = asyncHandler(async (req, res) => {
        const sprint = await sprintService.complete(req.params.id);
        res.status(200).json(sprint);
});

const startSprint = asyncHandler(async (req, res) => {
        const sprint = await sprintService.startSprint(req.params.id);
        res.status(200).json(sprint);
});
module.exports = { getSprints, createSprint, completeSprint, startSprint };
