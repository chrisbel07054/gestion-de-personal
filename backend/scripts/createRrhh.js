require('dotenv').config();
const prisma = require('../src/infrastructure/database/prismaClient');
const { hashPassword } = require('../src/infrastructure/security/passwordHelper');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Set DATABASE_URL in .env before running this script.');
    process.exit(1);
  }

  const existing = await prisma.usuario.findUnique({ where: { usuario: 'rrhh' } });
  if (existing) {
    console.log('Usuario RRHH ya existe:', existing.usuario);
    process.exit(0);
  }

  const passwordHash = await hashPassword('Rrhh123!');
  const rrhh = await prisma.usuario.create({
    data: { usuario: 'rrhh', passwordHash, nombre: 'Personal RRHH', correo: '', rol: 'RRHH', estado: 'Activo' },
  });
  console.log('Usuario RRHH creado. ID:', rrhh.id);
  console.log('Usuario: rrhh  |  Password: Rrhh123!');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });