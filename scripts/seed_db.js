const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function getConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL not set in .env');
  return mysql.createConnection({ uri: databaseUrl });
}

async function getOrCreate(conn, table, uniqueField, value, data) {
  const [rows] = await conn.execute(`SELECT * FROM \`${table}\` WHERE \`${uniqueField}\` = ? LIMIT 1`, [value]);
  if (rows.length) return rows[0].id;
  const cols = Object.keys(data).map(k => `\`${k}\``).join(',');
  const placeholders = Object.keys(data).map(_ => '?').join(',');
  const vals = Object.values(data);
  const [res] = await conn.execute(`INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`, vals);
  return res.insertId;
}

async function run() {
  const conn = await getConnection();
  try {
    console.log('Seeding database...');

    // Team
    const teamId = await getOrCreate(conn, 'maintenanceteam', 'team_name', 'Team Alpha', { team_name: 'Team Alpha', company: 'Acme Co' });

    // Users
    async function createUser(name, email, password, role = 'USER', teamIdRef = null) {
      const hash = await bcrypt.hash(password, 10);
      const data = { name, email, password: hash, role, teamId: teamIdRef };
      const id = await getOrCreate(conn, 'user', 'email', email, data);
      return id;
    }

    const adminId = await createUser('Admin User', 'admin@example.com', 'password123', 'ADMIN', teamId);
    const managerId = await createUser('Manager User', 'manager@example.com', 'password123', 'MANAGER', teamId);
    const techId = await createUser('Tech One', 'tech1@example.com', 'password123', 'TECHNICIAN', teamId);

    // TeamMember
    await conn.execute('INSERT IGNORE INTO `teammember` (team_id, user_id) VALUES (?, ?)', [teamId, managerId]);
    await conn.execute('INSERT IGNORE INTO `teammember` (team_id, user_id) VALUES (?, ?)', [teamId, techId]);

    // Category
    const categoryId = await getOrCreate(conn, 'equipmentcategory', 'name', 'Heavy Machinery', { name: 'Heavy Machinery', responsible_user_id: managerId, company: 'Acme Co' });

    // WorkCenter
    const workCenterId = await getOrCreate(conn, 'workcenter', 'code', 'WC-01', { name: 'Main Line', code: 'WC-01', cost_per_hour: 50.0, capacity: 5, oee_target: 85.0 });

    // Equipment
    const equipmentId = await getOrCreate(conn, 'equipment', 'serial_number', 'EQ-0001', {
      name: 'Hydraulic Press',
      serial_number: 'EQ-0001',
      employee_name: 'Operator A',
      department: 'Manufacturing',
      location: 'Plant 1',
      purchase_date: '2020-01-15',
      warranty_end: '2025-01-15',
      category_id: categoryId,
      team_id: teamId,
      technician_id: techId,
      is_scrapped: 0,
      company: 'Acme Co',
      workCenterId: workCenterId
    });

    // MaintenanceRequest
    const [reqRows] = await conn.execute('SELECT id FROM `maintenancerequest` WHERE subject = ? AND equipmentId = ? LIMIT 1', ['Fix hydraulic leak', equipmentId]);
    let requestId;
    if (reqRows.length) requestId = reqRows[0].id;
    else {
      const [res] = await conn.execute(`INSERT INTO \`maintenancerequest\` (subject, type, status, equipmentId, teamId, technicianId, scheduled_date, duration_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Fix hydraulic leak', 'CORRECTIVE', 'NEW', equipmentId, teamId, techId, null, null]);
      requestId = res.insertId;
    }

    // MaintenanceLog
    await conn.execute(`INSERT INTO \`maintenancelog\` (request_id, action, from_status, to_status, performed_by_id, notes, duration_hours) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [requestId, 'Created request', null, 'NEW', managerId, 'Initial request created for testing', 0]);

    console.log('Seeding finished.');
    // show counts
    const [tables] = await conn.query("SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = database() AND table_name IN ('maintenanceteam','user','equipmentcategory','workcenter','equipment','maintenancerequest','maintenancelog','teammember')");
    console.table(tables.map(t => ({ table: t.TABLE_NAME || t.table_name, rows: t.TABLE_ROWS || t.table_rows })));
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(2);
  }
}

run();