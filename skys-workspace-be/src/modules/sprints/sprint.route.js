/**
 * @file sprint.route.js
 * @description Định tuyến API cho module Sprint.
 * Base path: /api/sprints
 */
const express = require('express');
const router = express.Router();
const { getSprints, createSprint, completeSprint,startSprint } = require('./sprint.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.route('/project/:projectId')
    .get(getSprints)
    .post(createSprint);

router.route('/:id/complete')
    .put(completeSprint);

router.patch('/:id/start',startSprint)

module.exports = router;
