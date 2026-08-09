/**
 * @file gantt.route.js
 * @description Định tuyến API cho module Gantt.
 * Base path: /api/gantt
 */

 const express = require('express');
 const router = express.Router({mergeParams: true});
 const {
    getGantt,
 } = require('../gantt/gantt.controller')
const {checkProjectPermission} = require('../../middleware/rbac.middleware');

router.get('/', checkProjectPermission(), getGantt);

module.exports = router;
