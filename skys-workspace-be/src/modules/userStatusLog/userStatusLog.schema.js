const mongoose = require('mongoose');
const UserStatusLogSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true, index: true},
    action:{type: String, enum:['LOGIN','LOGOUT','ROLE_CHANGED','BLOCKED','UNBLOCKED'], index: true},
    timestamp:{type: Date, default: Date.now},
    ipAddress:{type: String, default: null},
    userAgent: {type: String, default: null}
});

UserStatusLogSchema.index({timestamp: 1},{expireAfterSeconds: 60 * 60 * 24 * 365 * 5})

module.exports = mongoose.model('UserStatusLog', UserStatusLogSchema)