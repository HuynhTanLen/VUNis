/**
 * @file label.schema.js
 * @description Mongoose Schema cho bảng Label.
 * Lưu nhãn phân loại công việc trong dự án.
 */
const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên nhãn là bắt buộc'],
        trim: true
    },
    color: {
        type: String,
        default: '#6366f1' // Indigo default color code
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Nhãn phải thuộc về một dự án']
    }
}, {
    timestamps: true
});

// Mỗi tên nhãn trong một dự án là duy nhất
labelSchema.index({ name: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('Label', labelSchema);
