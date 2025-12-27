const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const ctrl = require('../controllers/request.controller');

// create request (authenticated)
router.post('/', auth, ctrl.createRequest);

// list requests (optional filters)
router.get('/', auth, ctrl.listRequests);

// assign technician (manager/admin)
router.patch('/:id/assign', auth, checkRole(['ADMIN','MANAGER']), ctrl.assignRequest);

// change status (technician or manager)
router.patch('/:id/status', auth, checkRole(['ADMIN','MANAGER','TECHNICIAN']), ctrl.changeStatus);

module.exports = router;
