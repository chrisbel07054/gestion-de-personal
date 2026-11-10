const prisma = require('./prismaClient');

async function connect() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Skipping DB connection (use .env to configure).');
    return;
  }
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connect, prisma };
