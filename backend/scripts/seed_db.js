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
  const seedSqlPath = path.resolve(__dirname, '..', 'sql', 'seed_data.sql');
  let lines = [];
  try {
    console.log('Seeding database...');

    // Team
    const teamId = await getOrCreate(conn, 'maintenanceteam', 'team_name', 'Team Alpha', { team_name: 'Team Alpha', company: 'Acme Co' });

    // Users
    async function createUser(name, email, password, role = 'USER', teamIdRef = null) {
      const hash = await bcrypt.hash(password, 10);
      const data = { name, email, password: hash, role, teamId: teamIdRef };
      const id = await getOrCreate(conn, 'user', 'email', email, data);
      return { id, hash, name, email };
    }

    const admin = await createUser('Admin User', 'admin@example.com', 'password123', 'ADMIN', teamId);
    const manager = await createUser('Manager User', 'manager@example.com', 'password123', 'MANAGER', teamId);
    const tech = await createUser('Tech One', 'tech1@example.com', 'password123', 'TECHNICIAN', teamId);
    const adminId = admin.id, managerId = manager.id, techId = tech.id;

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

    // Also write a SQL seed file mirroring the inserted data (uses SELECT subqueries to resolve FKs)
    try {
      lines.push('-- Generated seed data - safe to run after schema creation');
      lines.push("INSERT IGNORE INTO MaintenanceTeam (team_name, company) VALUES ('Team Alpha','Acme Co');");

      // users with hashed passwords
      lines.push(`INSERT IGNORE INTO \`User\` (name,email,password,role,teamId) VALUES ('${admin.name}','${admin.email}','${admin.hash}','ADMIN',(SELECT id FROM MaintenanceTeam WHERE team_name='Team Alpha' LIMIT 1));`);
      lines.push(`INSERT IGNORE INTO \`User\` (name,email,password,role,teamId) VALUES ('${manager.name}','${manager.email}','${manager.hash}','MANAGER',(SELECT id FROM MaintenanceTeam WHERE team_name='Team Alpha' LIMIT 1));`);
      lines.push(`INSERT IGNORE INTO \`User\` (name,email,password,role,teamId) VALUES ('${tech.name}','${tech.email}','${tech.hash}','TECHNICIAN',(SELECT id FROM MaintenanceTeam WHERE team_name='Team Alpha' LIMIT 1));`);

      lines.push("INSERT IGNORE INTO TeamMember (team_id, user_id) VALUES ((SELECT id FROM MaintenanceTeam WHERE team_name='Team Alpha' LIMIT 1),(SELECT id FROM `User` WHERE email='manager@example.com' LIMIT 1));");
      lines.push("INSERT IGNORE INTO TeamMember (team_id, user_id) VALUES ((SELECT id FROM MaintenanceTeam WHERE team_name='Team Alpha' LIMIT 1),(SELECT id FROM `User` WHERE email='tech1@example.com' LIMIT 1));");

      lines.push("INSERT IGNORE INTO EquipmentCategory (name,responsible_user_id,company) VALUES ('Heavy Machinery',(SELECT id FROM `User` WHERE email='manager@example.com' LIMIT 1),'Acme Co');");
      lines.push("INSERT IGNORE INTO WorkCenter (name,code,cost_per_hour,capacity,oee_target) VALUES ('Main Line','WC-01',50.0,5,85.0);");

      lines.push("INSERT IGNORE INTO Equipment (name,serial_number,employee_name,department,location,purchase_date,warranty_end,category_id,team_id,technician_id,is_scrapped,company,workCenterId) VALUES ('Hydraulic Press','EQ-0001','Operator A','Manufacturing','Plant 1','2020-01-15','2025-01-15',(SELECT id FROM EquipmentCategory WHERE name='Heavy Machinery' LIMIT 1),(SELECT id FROM MaintenanceTeam WHERE team_name='Team Alpha' LIMIT 1),(SELECT id FROM `User` WHERE email='tech1@example.com' LIMIT 1),0,'Acme Co',(SELECT id FROM WorkCenter WHERE code='WC-01' LIMIT 1));");

      lines.push("INSERT IGNORE INTO MaintenanceRequest (subject,type,status,equipmentId,teamId,technicianId,scheduled_date,duration_hours) VALUES ('Fix hydraulic leak','CORRECTIVE','NEW',(SELECT id FROM Equipment WHERE serial_number='EQ-0001' LIMIT 1),(SELECT id FROM MaintenanceTeam WHERE team_name='Team Alpha' LIMIT 1),(SELECT id FROM `User` WHERE email='tech1@example.com' LIMIT 1),NULL,NULL);");

      lines.push("INSERT IGNORE INTO MaintenanceLog (request_id,action,from_status,to_status,performed_by_id,notes,duration_hours) VALUES ((SELECT id FROM MaintenanceRequest WHERE subject='Fix hydraulic leak' LIMIT 1),'Created request',NULL,'NEW',(SELECT id FROM `User` WHERE email='manager@example.com' LIMIT 1),'Initial request created for testing',0);");

      fs.writeFileSync(seedSqlPath, lines.join('\n') + '\n', { encoding: 'utf8' });
      console.log('Wrote SQL seed file to', seedSqlPath);
    } catch (werr) {
      console.warn('Failed to write SQL seed file:', werr);
    }

      // Insert additional dummy data: more teams, users, categories, equipment and requests
      try {
        const extraTeams = ['Mechanics', 'Electrical', 'Logistics'];
        const extraUsers = [
          { name: 'Charlie', email: 'charlie@example.com', password: 'password123', role: 'TECHNICIAN' },
          { name: 'Diana', email: 'diana@example.com', password: 'password123', role: 'MANAGER' },
          { name: 'Eve', email: 'eve@example.com', password: 'password123', role: 'USER' },
        ];

        for (const tname of extraTeams) {
          await getOrCreate(conn, 'maintenanceteam', 'team_name', tname, { team_name: tname, company: 'Acme Co' });
          lines.push(`INSERT IGNORE INTO MaintenanceTeam (team_name, company) VALUES ('${tname}','Acme Co');`);
        }

        const createdExtras = [];
        for (const u of extraUsers) {
          const cu = await createUser(u.name, u.email, u.password, u.role, null);
          createdExtras.push(cu);
          lines.push(`INSERT IGNORE INTO ` + "`User`" + ` (name,email,password,role,teamId) VALUES ('${cu.name}','${cu.email}','${cu.hash}','${u.role}',NULL);`);
        }

        // More categories and equipment
        const cat2Id = await getOrCreate(conn, 'equipmentcategory', 'name', 'Conveyors', { name: 'Conveyors', company: 'Acme Co' });
        lines.push("INSERT IGNORE INTO EquipmentCategory (name,company) VALUES ('Conveyors','Acme Co');");

        const moreWorkCenterId = await getOrCreate(conn, 'workcenter', 'code', 'WC-02', { name: 'Assembly', code: 'WC-02', cost_per_hour: 40.0, capacity: 3, oee_target: 80.0 });
        lines.push("INSERT IGNORE INTO WorkCenter (name,code,cost_per_hour,capacity,oee_target) VALUES ('Assembly','WC-02',40.0,3,80.0);");

        const extraEquipment = [
          { name: 'Conveyor 100', serial: 'EQ-100', categoryId: cat2Id, teamName: 'Logistics' },
          { name: 'Motor MX-7', serial: 'EQ-200', categoryId: cat2Id, teamName: 'Mechanics' },
          { name: 'Generator G1', serial: 'EQ-300', categoryId: categoryId, teamName: 'Electrical' },
        ];

        for (const e of extraEquipment) {
          const teamRow = await conn.execute('SELECT id FROM `maintenanceteam` WHERE team_name = ? LIMIT 1', [e.teamName]);
          const trow = teamRow[0] && teamRow[0][0] ? teamRow[0][0].id : teamId;
          const techRow = await conn.execute('SELECT id FROM `User` WHERE role = ? LIMIT 1', ['TECHNICIAN']);
          const techRowId = techRow[0] && techRow[0][0] ? techRow[0][0].id : techId;
          await getOrCreate(conn, 'equipment', 'serial_number', e.serial, {
            name: e.name,
            serial_number: e.serial,
            category_id: e.categoryId,
            team_id: trow,
            technician_id: techRowId,
            company: 'Acme Co'
          });
          lines.push(`INSERT IGNORE INTO Equipment (name,serial_number,category_id,team_id,technician_id,company,workCenterId) VALUES ('${e.name}','${e.serial}',(SELECT id FROM EquipmentCategory WHERE name='${e.categoryId === cat2Id ? 'Conveyors' : 'Heavy Machinery'}' LIMIT 1),(SELECT id FROM MaintenanceTeam WHERE team_name='${e.teamName}' LIMIT 1),(SELECT id FROM \`User\` WHERE role='TECHNICIAN' LIMIT 1),'Acme Co',(SELECT id FROM WorkCenter WHERE code='WC-02' LIMIT 1));`);
        }

        // Add a couple of requests for the extra equipment
        lines.push("INSERT IGNORE INTO MaintenanceRequest (subject,type,status,equipmentId,teamId,technicianId) VALUES ('Belt misalignment','CORRECTIVE','NEW',(SELECT id FROM Equipment WHERE serial_number='EQ-100' LIMIT 1),(SELECT id FROM MaintenanceTeam WHERE team_name='Logistics' LIMIT 1),(SELECT id FROM `User` WHERE role='TECHNICIAN' LIMIT 1));");
        lines.push("INSERT IGNORE INTO MaintenanceRequest (subject,type,status,equipmentId,teamId,technicianId) VALUES ('Overheating motor','CORRECTIVE','NEW',(SELECT id FROM Equipment WHERE serial_number='EQ-200' LIMIT 1),(SELECT id FROM MaintenanceTeam WHERE team_name='Mechanics' LIMIT 1),(SELECT id FROM `User` WHERE role='TECHNICIAN' LIMIT 1));");

        fs.writeFileSync(seedSqlPath, lines.join('\n') + '\n', { encoding: 'utf8' });
        console.log('Appended extra dummy data to', seedSqlPath);
      } catch (extraErr) {
        console.warn('Failed to create extra dummy data:', extraErr);
      }

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
