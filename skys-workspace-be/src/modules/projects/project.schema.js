/**
 * @file project.schema.js
 * @description Mongoose Schema cho bảng Project.
 * Sử dụng nhúng subdocument mảng members thay vì bảng phụ ProjectMember.
 */
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name:{ type: String, required: true, trim: true},

    code:{type: String, unique: true, uppercase:true},

    parentId:{type: mongoose.Schema.Types.ObjectId, ref: 'Project', default:null},

    scale:{
        type: String,
        enum: ['SMALL','MEDIUM','LARGE', 'ENTERPRISE'],
        default: 'MEDIUM'
    },
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},

    members: [{
        userId:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
        roles:{type: String,
               enum:[
                'PROJECT_MANAGER', 
                'FRONTEND_LEAD', 
                'BACKEND_LEAD', 
                'DESIGN_LEAD', 
                'QA_LEAD', 
                'DEVELOPER', 
                'TESTER'
               ]}
    }],
    department:{type: String, default: 'Engineering'},
    joinedAt: {type: Date, default: Date.now}
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);


