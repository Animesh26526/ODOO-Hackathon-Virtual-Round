const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');

// public listing of users (supports ?role=TECHNICIAN)
router.get('/', ctrl.listUsers);

module.exports = router;
