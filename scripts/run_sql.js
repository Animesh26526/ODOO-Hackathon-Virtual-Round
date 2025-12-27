const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function run(filePath) {
  try {
    let sql = fs.readFileSync(filePath, 'utf8');
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL not set in .env');

    // extract database name from DATABASE_URL (mysql://user:pass@host:port/dbname)
    const dbMatch = databaseUrl.match(/\/([a-zA-Z0-9_\-]+)(\?|$)/);
    const targetDb = dbMatch ? dbMatch[1] : null;
    if (targetDb) {
      // replace any CREATE DATABASE / USE statements with USE <targetDb> to ensure we run against the correct DB
      sql = sql.replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS[\s\S]*?;\s*USE\s+[`\w]+\s*;/i, `USE ${targetDb};\n`);
      // if script doesn't have a USE, prepend one
      if (!/USE\s+[`\w]+\s*;/i.test(sql)) sql = `USE ${targetDb};\n` + sql;
    }

    const conn = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });

    console.log('Executing SQL file:', filePath);
    await conn.query(sql);
    console.log('SQL executed successfully. Fetching tables...');

    const [rows] = await conn.query('SHOW TABLES');
    console.log('Tables in database:');
    console.table(rows);

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error running SQL:', err.message || err);
    process.exit(2);
  }
}

const arg = process.argv[2] || path.resolve(__dirname, '..', 'sql', 'reset_and_create.sql');
run(arg);