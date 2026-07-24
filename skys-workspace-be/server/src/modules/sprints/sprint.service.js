const sprintRepo = require('./sprint.repository');
const sprintMapper = require('./sprint.mapper');
const { SprintNotFoundError } = require('./sprint.error');

const getByProject = async (projectId) => {
    const sprints = await sprintRepo.findSprintsByProject(projectId);
    return sprintMapper.toSprintListResponse(sprints);
};

const create = async (projectId, dto) => {
    const sprintData = {
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        goal:dto.goal,
        projectId: projectId,
        status: 'PLANNING'
    };
    const newSprint = await sprintRepo.createSprint(sprintData);
    return sprintMapper.toSprintResponse(newSprint);
};

const complete = async (sprintId) => {
    const updatedSprint = await sprintRepo.updateSprintStatus(sprintId, 'COMPLETED');
    if (!updatedSprint) {
        throw new SprintNotFoundError();
    }
    return sprintMapper.toSprintResponse(updatedSprint);
};

const startSprint = async (sprintId) =>{
    const startSprint = await sprintRepo.updateSprintStatus(sprintId, 'ACTIVE');
    if(!startSprint) {
        throw new SprintNotFoundError();
    }
    return sprintMapper.toSprintResponse(startSprint);
}
module.exports = { getByProject, create, complete,startSprint };
