/**
 * @file attachment.repository.js
 * @description Repository layer cho module Attachment.
 */
const Attachment = require('./attachment.schema');

const findByTaskId = (taskId) => {
    return Attachment.find({ task: taskId })
        .populate('uploader', 'name email')
        .sort({ createdAt: -1 });
};

const findById = (id) => {
    return Attachment.findById(id).populate('uploader', 'name email');
};

const create = async (data) => {
    const newAtt = await Attachment.create(data);
    return Attachment.findById(newAtt._id).populate('uploader', 'name email');
};

const remove = (id) => {
    return Attachment.findByIdAndDelete(id);
};

const edit = (id, data) =>{
    return Attachment.findByIdAndUpdate(id, {$set: data}, {new: true})
    .populate('uploader', 'name email')
}

module.exports = {
    findByTaskId,
    findById,
    create,
    remove,
    edit
};
