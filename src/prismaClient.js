const { PrismaClient } = require('@prisma/client');
// Prisma v7 may require a non-empty options object when using prisma.config.ts.
// Pass a minimal __internal.configOverride to satisfy the runtime and pick up config.
const prisma = new PrismaClient();
module.exports = prisma;
