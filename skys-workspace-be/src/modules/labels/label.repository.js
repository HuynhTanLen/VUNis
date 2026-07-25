/**
 * @file label.repository.js
 * @description Tầng Repository cho module Label.
 */
const Label = require('./label.schema');

const findByProjectId = (projectId) => {
    return Label.find({ project: projectId }).sort({ name: 1 });
};

const findById = (id) => {
    return Label.findById(id);
};

const create = (data) => {
    return Label.create(data);
};

const update = (id, data) => {
    return Label.findByIdAndUpdate(id, { $set: data }, { new: true });
};

const remove = (id) => {
    return Label.findByIdAndDelete(id);
};

module.exports = {
    findByProjectId,
    findById,
    create,
    update,
    remove
};
