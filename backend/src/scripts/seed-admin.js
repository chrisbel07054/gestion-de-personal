require('dotenv').config();

const prisma = require('../infrastructure/database/prismaClient');
const { hashPassword } = require('../infrastructure/security/passwordHelper');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL no está configurada. Usa .env para configurarla.'
    );
  }

  const existing = await prisma.usuario.findUnique({
    where: { usuario: 'admin' }
  });

  if (existing) {
    console.log('El usuario admin ya existe.');
    return;
  }

  const password = process.env.CREATE_ADMIN_PASSWORD || 'Admin123!';
  const passwordHash = await hashPassword(password);

  await prisma.usuario.create({
    data: {
      usuario: 'admin',
      passwordHash,
      nombre: 'Administrador',
      correo: 'admin@talento.local',
      rol: 'ADMINISTRADOR',
      estado: 'Activo',
    },
  });

  console.log(
    `Admin creado. Usuario: admin | Password: ${password}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });