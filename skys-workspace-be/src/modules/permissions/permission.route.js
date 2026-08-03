/**
 * @file permission.route.js
 * @description Định tuyến API cho module Permission (Base path: /api/permissions).
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { getAllPerm } = require('./permission.controller');

router.get('/', protect, getAllPerm);

module.exports = router;
