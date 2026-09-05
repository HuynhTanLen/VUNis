/**
 * @file projectPhase.mapper.js
 * @description Format ProjectPhase entity sang Response DTO.
 */

const toProjectPhaseResponse = (phase) => {
    if (!phase) return null;

    return {
        id: phase.id,
        projectId: phase.projectId,
        name: phase.name,
        order: phase.order,
        startDate: phase.startDate,
        endDate: phase.endDate,
        estimatedCost: phase.estimatedCost ? Number(phase.estimatedCost) : 0,
        actualCost: phase.actualCost ? Number(phase.actualCost) : 0,
        taskCount: Array.isArray(phase.tasks) ? phase.tasks.length : undefined
    };
};

const toProjectPhaseListResponse = (phases) => {
    if (!Array.isArray(phases)) return [];
    return phases.map(toProjectPhaseResponse);
};

module.exports = {
    toProjectPhaseResponse,
    toProjectPhaseListResponse
};
