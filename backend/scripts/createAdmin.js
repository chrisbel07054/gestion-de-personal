require('dotenv').config();
const prisma = require('../src/infrastructure/database/prismaClient');
const { hashPassword } = require('../src/infrastructure/security/passwordHelper');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Set DATABASE_URL in .env before running this script.');
    process.exit(1);
  }

  const existing = await prisma.usuario.findUnique({ where: { usuario: 'admin' } });
  if (existing) {
    console.log('Admin user already exists:', existing.usuario);
    process.exit(0);
  }

  const passwordHash = await hashPassword(process.env.CREATE_ADMIN_PASSWORD || 'Admin123!');
  const admin = await prisma.usuario.create({
    data: { usuario: 'admin', passwordHash, nombre: 'Administrador', correo: '', rol: 'ADMINISTRADOR', estado: 'Activo' },
  });
  console.log('Admin creado. ID:', admin.id);
  console.log('Usuario: admin  |  Password:', process.env.CREATE_ADMIN_PASSWORD || 'Admin123!');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
