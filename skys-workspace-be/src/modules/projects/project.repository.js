const Project = require('./project.schema');

const findProjectsByOwner = (userId) => {
    return Project.find({
        $or: [
            { owner: userId },
            { members: userId }
        ]
    })
     .select('name description budget durationWeeks startDate endDate status priority owner members createdAt')
    .populate('owner', 'name email role')
    .populate('members', 'name email avatar jobTitle')
    .lean();
};

const findProjectById = (projectId) => {
    return Project.findById(projectId)
    .populate('owner', 'name email role')
    .populate('members', 'name email role')
    .lean();
};

const createProject = (projectData) => {
    return Project.create(projectData);
};

const updateProject = (projectId, updateData) => {
    return Project.findByIdAndUpdate(
        projectId,
        { $set: updateData },
        { new: true }
    ).populate('owner', 'name email role').populate('members', 'name email role');
};

const deleteProject = (projectId) => {
    return Project.findByIdAndDelete(projectId);
};

const findAllProjects = () => {
    return Project.find()
    .populate('owner', 'name email role')
    .populate('members', 'name email role')
    .lean();
};

const findRootProjects = () =>{
    return Project.find({parentId: null})
           .populate('owner', 'name email avatar')
           .sort({createdAt: -1})
}

const findSubProjects = (parentProjectId) =>{
    return Project.find({parentId: parentProjectId}).populate('owner', 'name email avatar').sort({createdAt: -1})
}

module.exports = {
    findProjectsByOwner,
    findProjectById,
    createProject,
    updateProject,
    deleteProject,
    findAllProjects,
    findRootProjects,
    findSubProjects
};
