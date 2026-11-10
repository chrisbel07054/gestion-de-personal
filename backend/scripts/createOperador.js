require('dotenv').config();
const prisma = require('../src/infrastructure/database/prismaClient');
const { hashPassword } = require('../src/infrastructure/security/passwordHelper');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Set DATABASE_URL in .env before running this script.');
    process.exit(1);
  }

  const existing = await prisma.usuario.findUnique({ where: { usuario: 'operador' } });
  if (existing) {
    console.log('Usuario Operador ya existe:', existing.usuario);
    process.exit(0);
  }

  const passwordHash = await hashPassword('Operador123!');
  const operador = await prisma.usuario.create({
    data: { usuario: 'operador', passwordHash, nombre: 'Operador', correo: '', rol: 'OPERADOR', estado: 'Activo' },
  });
  console.log('Usuario Operador creado. ID:', operador.id);
  console.log('Usuario: operador  |  Password: Operador123!');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });