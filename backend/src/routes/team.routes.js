const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const ctrl = require('../controllers/team.controller');

// list and create
router.get('/', auth, checkRole(['ADMIN','MANAGER']), ctrl.listTeams);
router.post('/', auth, checkRole(['ADMIN','MANAGER']), ctrl.createTeam);

// single team CRUD
router.get('/:id', auth, checkRole(['ADMIN','MANAGER']), ctrl.getTeam);
router.patch('/:id', auth, checkRole(['ADMIN','MANAGER']), ctrl.updateTeam);
router.delete('/:id', auth, checkRole(['ADMIN','MANAGER']), ctrl.deleteTeam);

// members
router.get('/:id/members', auth, checkRole(['ADMIN','MANAGER']), ctrl.listMembers);
router.post('/:id/members', auth, checkRole(['ADMIN','MANAGER']), ctrl.addMember);
router.delete('/:id/members/:userId', auth, checkRole(['ADMIN','MANAGER']), ctrl.removeMember);

module.exports = router;
