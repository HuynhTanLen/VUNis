/**
 * @file sprint.schema.js
 * @description Mongoose Schema cho bảng Sprint.
 */
const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên Sprint là bắt buộc'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Ngày bắt đầu là bắt buộc']
    },
    endDate: {
        type: Date,
        required: [true, 'Ngày kết thúc là bắt buộc']
    },
    goal:{type: String, default: ''},
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    status: {
        type: String,
        enum: ['PLANNING', 'ACTIVE', 'CLOSED'],
        default: 'PLANNING'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sprint', sprintSchema);
