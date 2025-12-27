const prisma = require('../prismaClient');

async function listEquipment(req, res) {
  try {
    const { page = 1, perPage = 25, department, teamId } = req.query;
    const skip = (Number(page) - 1) * Number(perPage);
    const where = {};
    if (department) where.department = department;
    if (teamId) where.teamId = Number(teamId);

    const items = await prisma.equipment.findMany({
      where,
      include: { category: true, team: true, technician: true },
      skip,
      take: Number(perPage),
      orderBy: { id: 'desc' }
    });
    res.json(items);
  } catch (err) {
    console.error('listEquipment', err);
    res.status(500).json({ error: 'Failed to list equipment' });
  }
}

async function getEquipment(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await prisma.equipment.findUnique({
      where: { id },
      include: { category: true, team: true, technician: true }
    });
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json(item);
  } catch (err) {
    console.error('getEquipment', err);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
}

async function createEquipment(req, res) {
  try {
    const { name, serialNumber, categoryId, teamId, technicianId, department, location } = req.body;
    if (!name || !serialNumber || !categoryId || !teamId) return res.status(400).json({ error: 'Missing required fields' });

    const existing = await prisma.equipment.findUnique({ where: { serialNumber } });
    if (existing) return res.status(409).json({ error: 'serialNumber already exists' });

    const created = await prisma.equipment.create({ data: {
      name,
      serialNumber,
      categoryId: Number(categoryId),
      teamId: Number(teamId),
      technicianId: technicianId ? Number(technicianId) : null,
      department,
      location
    }});
    res.status(201).json(created);
  } catch (err) {
    console.error('createEquipment', err);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
}

async function getEquipmentRequests(req, res) {
  try {
    const id = Number(req.params.id);
    const requests = await prisma.maintenanceRequest.findMany({
      where: { equipmentId: id },
      include: { technician: true, team: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    console.error('getEquipmentRequests', err);
    res.status(500).json({ error: 'Failed to fetch equipment requests' });
  }
}

async function autofill(req, res) {
  try {
    const id = Number(req.params.id);
    const equipment = await prisma.equipment.findUnique({ where: { id }, include: { team: true, technician: true, category: true } });
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ teamId: equipment.teamId, technicianId: equipment.technicianId || null, category: equipment.category.name });
  } catch (err) {
    console.error('autofill', err);
    res.status(500).json({ error: 'Autofill failed' });
  }
}

async function openRequestsCount(req, res) {
  try {
    const id = Number(req.params.id);
    const count = await prisma.maintenanceRequest.count({ where: { equipmentId: id, status: { notIn: ['REPAIRED','SCRAP'] } } });
    res.json({ equipmentId: id, openRequests: count });
  } catch (err) {
    console.error('openRequestsCount', err);
    res.status(500).json({ error: 'Failed to fetch open requests count' });
  }
}

module.exports = { listEquipment, getEquipment, createEquipment, getEquipmentRequests, autofill, openRequestsCount };

