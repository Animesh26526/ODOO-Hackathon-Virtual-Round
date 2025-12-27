const prisma = require('../prismaClient');

// Create a maintenance request (any authenticated user)
async function createRequest(req, res) {
  try {
    const { subject, type, equipmentId, scheduledDate } = req.body;
    const requesterId = req.user?.id || null;
    console.log('createRequest body:', { subject, type, equipmentId, scheduledDate, user: req.user })
    if (!subject || !type || !equipmentId) return res.status(400).json({ error: 'Missing required fields' });

    // load equipment to determine team
    const equipment = await prisma.equipment.findUnique({ where: { id: Number(equipmentId) } });
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });

    // normalize enum values (backend accepts PREVENTIVE/CORRECTIVE)
    const normalizedType = typeof type === 'string' ? type.toUpperCase() : type

    const reqData = {
      subject,
      type: normalizedType,
      equipmentId: Number(equipmentId),
      teamId: equipment.teamId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
    };
    console.log('createRequest reqData:', reqData)

    const created = await prisma.maintenanceRequest.create({ data: reqData });

    // create initial log
    await prisma.maintenanceLog.create({ data: { requestId: created.id, action: 'CREATE', toStatus: created.status, performedById: requesterId } });

    res.status(201).json(created);
  } catch (err) {
    console.error('createRequest', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
}

// List requests with optional filters
async function listRequests(req, res) {
  try {
    const { page = 1, perPage = 25, type, status, teamId } = req.query;
    const skip = (Number(page) - 1) * Number(perPage);
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (teamId) where.teamId = Number(teamId);

    const items = await prisma.maintenanceRequest.findMany({
      where,
      include: { equipment: true, technician: true, team: true },
      skip,
      take: Number(perPage),
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (err) {
    console.error('listRequests', err);
    res.status(500).json({ error: 'Failed to list requests' });
  }
}

// Assign technician to request
async function assignRequest(req, res) {
  try {
    const id = Number(req.params.id);
    const { technicianId } = req.body;
    if (!technicianId) return res.status(400).json({ error: 'technicianId required' });

    const reqRow = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!reqRow) return res.status(404).json({ error: 'Request not found' });

    const updated = await prisma.maintenanceRequest.update({ where: { id }, data: { technicianId: Number(technicianId) } });
    await prisma.maintenanceLog.create({ data: { requestId: id, action: 'ASSIGN', performedById: req.user?.id, notes: `Assigned to ${technicianId}` } });
    res.json(updated);
  } catch (err) {
    console.error('assignRequest', err);
    res.status(500).json({ error: 'Failed to assign request' });
  }
}

// Change status (validate transitions)
const ALLOWED_TRANSITIONS = {
  NEW: ['IN_PROGRESS','SCRAP'],
  IN_PROGRESS: ['REPAIRED','SCRAP'],
  REPAIRED: [],
  SCRAP: []
};

async function changeStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status required' });

    const reqRow = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!reqRow) return res.status(404).json({ error: 'Request not found' });

    const allowed = ALLOWED_TRANSITIONS[reqRow.status];
    if (!allowed.includes(status)) return res.status(400).json({ error: `Invalid transition from ${reqRow.status} to ${status}` });

    const updated = await prisma.maintenanceRequest.update({ where: { id }, data: { status } });
    await prisma.maintenanceLog.create({ data: { requestId: id, action: 'STATUS_CHANGE', fromStatus: reqRow.status, toStatus: status, performedById: req.user?.id } });
    // if moved to SCRAP, mark equipment scrapped
    if (status === 'SCRAP') {
      await prisma.equipment.update({ where: { id: reqRow.equipmentId }, data: { isScrapped: true, scrapDate: new Date() } });
    }

    res.json(updated);
  } catch (err) {
    console.error('changeStatus', err);
    res.status(500).json({ error: 'Failed to change status' });
  }
}

module.exports = { createRequest, listRequests, assignRequest, changeStatus };
