const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const ctrl = require('../controllers/team.controller');

// list (public) and create (manager/admin)
router.get('/', ctrl.listTeams);
router.post('/', auth, checkRole(['ADMIN','MANAGER']), ctrl.createTeam);

// single team read (public); write restricted
router.get('/:id', ctrl.getTeam);
router.patch('/:id', auth, checkRole(['ADMIN','MANAGER']), ctrl.updateTeam);
router.delete('/:id', auth, checkRole(['ADMIN','MANAGER']), ctrl.deleteTeam);

// members: list visible to any authenticated, modifications restricted
router.get('/:id/members', auth, ctrl.listMembers);
router.post('/:id/members', auth, checkRole(['ADMIN','MANAGER']), ctrl.addMember);
router.delete('/:id/members/:userId', auth, checkRole(['ADMIN','MANAGER']), ctrl.removeMember);

module.exports = router;
