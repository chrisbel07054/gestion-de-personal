const { PrismaClient } = require('@prisma/client');

// Singleton: una sola instancia de PrismaClient para todo el proceso.
const prisma = new PrismaClient();

module.exports = prisma;
