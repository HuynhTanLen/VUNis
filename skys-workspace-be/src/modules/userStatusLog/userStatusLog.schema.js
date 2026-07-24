const mongoose = require('mongoose');
const userStatusLogSchema = require('../activityLogs/userStatusLog.schema');

const UserStatusLogSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true, index: true},
    action:{type: String, enum:['LOGIN','LOGOUT','ROLE_CHANGED','BLOCKED','UNBLOCKED'], index: true},
    timestamp:{type: Date, default: Date.now}
});

userStatusLogSchema.index({timestamp: 1},{expireAfterSeconds: 60 * 60 * 24 * 365 * 5})

module.exports = mongoose.model('UserStatusLog', userStatusLogSchema)