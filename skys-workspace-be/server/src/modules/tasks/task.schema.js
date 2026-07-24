/**
 * @file task.schema.js
 * @description Mongoose Schema cho bảng Task.
 */
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Tên công việc là bắt buộc'],
        trim: true
    },
    description: { type: String, default: '' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', default: null },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { 
        type: String, 
        enum: ['Todo', 'InProgress', 'Review', 'Done'], 
        default: 'Todo' 
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    durationDays: { type: Number, default: 1 },
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    subtasks: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }  
    }]
}, {
    timestamps: true
});

taskSchema.index({ projectId: 1, status: 1 });
module.exports = mongoose.model('Task', taskSchema);

