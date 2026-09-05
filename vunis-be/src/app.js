/**
 * @file app.js
 * @description Cấu hình ứng dụng Express.
 * Tách biệt việc cấu hình app (middleware, routes) khỏi việc khởi động server.
 * Giúp dễ dàng viết test mà không cần khởi động server thật.
 */
const express = require('express');
const cors = require('cors');

// Middleware
const { logger } = require('./middleware/logger.middleware');
const { notFound, errorHandler } = require('./middleware/error.middleware');

// Module Routes
const authRoutes = require('./modules/auth/auth.route');
const userRoutes = require('./modules/users/user.route');
const projectRoutes = require('./modules/projects/project.route');
const taskRoutes = require('./modules/tasks/task.route');
const sprintRoutes = require('./modules/sprints/sprint.route');
const commentRoutes = require('./modules/comments/comment.route');
const notificationRoutes = require('./modules/notifications/notification.route');
const activityLogRoutes = require('./modules/activityLogs/activityLog.route');
const attachmentRoutes = require('./modules/attachments/attachment.route');
const labelRoutes = require('./modules/labels/label.route');
const projectMemberRoutes = require('./modules/projectMembers/projectMember.route');
const roleRoutes = require('./modules/roles/role.route');
const permissionRoutes = require('./modules/permissions/permission.route');
const projectPhaseRoutes = require('./modules/projectPhases/projectPhase.route');

const app = express();

const path = require('path');
const cookieParser = require('cookie-parser');
const { globalLimiter } = require('./middleware/rateLimit.middleware');

app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true                 
}));
app.use(logger);
app.use(globalLimiter);

// ─── API Routes ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/project-members', projectMemberRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/project-phases', projectPhaseRoutes);


// ─── Health & System Stats ─────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'VUNIS API is running',
        timestamp: new Date().toISOString()
    });
});

const os = require('os');

const {protect} = require('./middleware/auth.middleware');
const {authorize} = require('./middleware/rbac.middleware');

app.get('/api/system/stats', protect, authorize('SUPER_ADMIN'), (req, res) => {
    const memory = process.memoryUsage();
    const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
    const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const cpuPct = Math.min(Math.round((loadAvg[0] || 0.15) * 100 / cpus.length), 99);

    const uptimeSec = Math.floor(process.uptime());
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const uptimeStr = days > 0 ? `${days} ngày ${hours} giờ` : `${hours} giờ ${mins} phút`;

    res.json({
        ramUsed: `${heapUsedMB} MB`,
        ramTotal: `${totalMemGB} GB`,
        cpuLoad: `${cpuPct}%`,
        uptime: uptimeStr,
        dbConnections: 1,
        dbName: 'PostgreSQL'
    });
});

// ─── Error Handling (đặt cuối cùng) ────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
