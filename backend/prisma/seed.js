require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // create teams
  // ensure teams exist (use find/create because `name` is not unique in schema)
  let team1 = await prisma.maintenanceTeam.findFirst({ where: { name: 'IT Support' } });
  if (!team1) {
    team1 = await prisma.maintenanceTeam.create({ data: { name: 'IT Support', company: 'Default Co' } });
  }

  let team2 = await prisma.maintenanceTeam.findFirst({ where: { name: 'Mechanics' } });
  if (!team2) {
    team2 = await prisma.maintenanceTeam.create({ data: { name: 'Mechanics', company: 'Default Co' } });
  }

  // create users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice', email: 'alice@example.com', password: 'password', role: 'MANAGER' }
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob', email: 'bob@example.com', password: 'password', role: 'TECHNICIAN' }
  });

  // team membership
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team1.id, userId: alice.id } },
    update: {},
    create: { teamId: team1.id, userId: alice.id }
  }).catch(() => {});

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team1.id, userId: bob.id } },
    update: {},
    create: { teamId: team1.id, userId: bob.id }
  }).catch(() => {});

  // categories
  const cat = await prisma.equipmentCategory.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: { name: 'Laptops', company: 'Default Co' }
  });

  // equipment
  const eq = await prisma.equipment.upsert({
    where: { serialNumber: 'SN-001' },
    update: {},
    create: {
      name: 'Laptop 001',
      serialNumber: 'SN-001',
      categoryId: cat.id,
      teamId: team1.id,
      technicianId: bob.id
    }
  });

  // sample request
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'Battery not charging',
      type: 'CORRECTIVE',
      equipmentId: eq.id,
      teamId: team1.id,
      technicianId: bob.id,
      status: 'NEW'
    }
  });

  console.log('Seeding finished');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
