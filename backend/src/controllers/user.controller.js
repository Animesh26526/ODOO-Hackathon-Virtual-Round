const prisma = require('../prismaClient');

async function listUsers(req, res) {
  try {
    const { role } = req.query;
    const where = {};
    if (role) where.role = role;
    const users = await prisma.user.findMany({ where, select: { id: true, name: true, email: true, role: true } });
    res.json(users);
  } catch (err) {
    console.error('listUsers', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
}

module.exports = { listUsers };
