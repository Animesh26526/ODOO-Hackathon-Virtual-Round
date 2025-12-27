const prisma = require('../prismaClient');

async function listTeams(req, res) {
  try {
    const teams = await prisma.maintenanceTeam.findMany({ include: { members: { include: { user: true } }, equipment: true } });
    res.json(teams);
  } catch (err) {
    console.error('listTeams', err);
    res.status(500).json({ error: 'Failed to list teams' });
  }
}

async function getTeam(req, res) {
  try {
    const id = Number(req.params.id);
    const team = await prisma.maintenanceTeam.findUnique({ where: { id }, include: { members: { include: { user: true } }, equipment: true } });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error('getTeam', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
}

async function createTeam(req, res) {
  try {
    const { name, company } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const team = await prisma.maintenanceTeam.create({ data: { name, company } });
    res.status(201).json(team);
  } catch (err) {
    console.error('createTeam', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
}

async function updateTeam(req, res) {
  try {
    const id = Number(req.params.id);
    const data = {};
    const { name, company } = req.body;
    if (name) data.name = name;
    if (company) data.company = company;
    const updated = await prisma.maintenanceTeam.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error('updateTeam', err);
    res.status(500).json({ error: 'Failed to update team' });
  }
}

async function deleteTeam(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.maintenanceTeam.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteTeam', err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
}

// members management
async function listMembers(req, res) {
  try {
    const teamId = Number(req.params.id);
    const members = await prisma.teamMember.findMany({ where: { teamId }, include: { user: true } });
    res.json(members.map(m => m.user));
  } catch (err) {
    console.error('listMembers', err);
    res.status(500).json({ error: 'Failed to list members' });
  }
}

async function addMember(req, res) {
  try {
    const teamId = Number(req.params.id);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const exists = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: Number(userId) } } }).catch(() => null);
    if (exists) return res.status(409).json({ error: 'User already member' });
    const added = await prisma.teamMember.create({ data: { teamId, userId: Number(userId) } });
    res.status(201).json(added);
  } catch (err) {
    console.error('addMember', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
}

async function removeMember(req, res) {
  try {
    const teamId = Number(req.params.id);
    const userId = Number(req.params.userId);
    await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
    res.json({ ok: true });
  } catch (err) {
    console.error('removeMember', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}

module.exports = { listTeams, getTeam, createTeam, updateTeam, deleteTeam, listMembers, addMember, removeMember };
