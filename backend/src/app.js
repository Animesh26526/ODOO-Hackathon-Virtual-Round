require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const prisma = require('./prismaClient');
const authRoutes = require('./routes/auth.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const requestRoutes = require('./routes/request.routes');
const teamRoutes = require('./routes/team.routes');
const userRoutes = require('./routes/user.routes');

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);

// basic equipment list (public for now)
app.get('/api/equipment', async (req, res) => {
  const items = await prisma.equipment.findMany({ take: 50 });
  res.json(items);
});

app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
