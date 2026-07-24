const Sprint = require('./sprint.schema');

const findSprintsByProject = (projectId) => {
    return Sprint.find({ projectId: projectId }).sort({ createdAt: -1 });
};

const findSprintById = (sprintId) => {
    return Sprint.findById(sprintId);
};

const createSprint = (sprintData) => {
    return Sprint.create(sprintData);
};

const updateSprintStatus = (sprintId, status) => {
    return Sprint.findByIdAndUpdate(
        sprintId,
        { $set: {status} },
        { new: true }
    );
};

module.exports = {
    findSprintsByProject,
    findSprintById,
    createSprint,
    updateSprintStatus
};
