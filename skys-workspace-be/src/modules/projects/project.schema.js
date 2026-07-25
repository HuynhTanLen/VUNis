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
                'FRONTEND_DEVELOPER',
                'BACKEND_LEAD', 
                'BACKEND_DEVELOPER',
                'DESIGN_LEAD', 
                'UI_UX_DESIGNER',
                'QA_LEAD', 
                'QA_TESTER',
                'DEVOPS_LEAD',
                'DEVOPS_ENGINEER',
                'DEVELOPER', 
                'TESTER',
                'MEMBER'
               ]}
    }],
    department:{type: String, default: 'Engineering'},
    joinedAt: {type: Date, default: Date.now}
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);


