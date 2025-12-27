const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const ctrl = require('../controllers/equipment.controller');

// Public listing
router.get('/', ctrl.listEquipment);
router.get('/:id', ctrl.getEquipment);
router.get('/:id/requests', ctrl.getEquipmentRequests);
router.get('/:id/autofill', ctrl.autofill);
router.get('/:id/open-requests-count', ctrl.openRequestsCount);

// Protected create (manager/admin)
router.post('/', auth, checkRole(['ADMIN','MANAGER']), ctrl.createEquipment);

module.exports = router;
