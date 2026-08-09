const toSprintResponse = (sprint) => {
    if (!sprint) return null;
    return {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        project: sprint.project,
        status: sprint.status,
        createdAt: sprint.createdAt,
        updatedAt: sprint.updatedAt
    };
};

const toSprintListResponse = (sprints) => {
    if (!Array.isArray(sprints)) return [];
    return sprints.map(toSprintResponse);
};

module.exports = { toSprintResponse, toSprintListResponse };
