const toProjectResponse = (project, hideBudget = false) => {
    if (!project) return null;

    // Tính tổng số ngày dự án nếu có đủ dữ liệu
    let totalDays = null;
    if (project.startDate && project.endDate) {
        const diffMs = new Date(project.endDate) - new Date(project.startDate);
        totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    } else if (project.durationWeeks) {
        totalDays = project.durationWeeks * 7;
    }

    return {
        id: project._id,
        name: project.name,
        description: project.description,
        budget: hideBudget ? undefined : (project.budget ? Number(project.budget.toString()) : 0),
        durationWeeks: project.durationWeeks,
        startDate: project.startDate,
        endDate: project.endDate,
        totalDays,
        status: project.status,
        priority: project.priority,
        owner: project.owner && typeof project.owner === 'object' && project.owner._id ? {
            id: project.owner._id,
            name: project.owner.name,
            email: project.owner.email,
            role: project.owner.role
        } : project.owner,
        members: Array.isArray(project.members) ? project.members.map(m => {
            if (m && typeof m === 'object' && m._id) {
                return {
                    id: m._id,
                    name: m.name,
                    email: m.email,
                    role: m.role
                };
            }
            return m;
        }) : [],
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
    };
};

const toProjectListResponse = (projects, hideBudget = false) => {
    if (!Array.isArray(projects)) return [];
    return projects.map(p => toProjectResponse(p, hideBudget));
};

module.exports = { toProjectResponse, toProjectListResponse };
