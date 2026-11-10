import dotenv from 'dotenv';
import prisma from '../src/infrastructure/database/prismaClient.js';
import { hashPassword } from '../src/infrastructure/security/passwordHelper.js';

dotenv.config();

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada. Usa .env para configurarla.');
  }

  const existing = await prisma.usuario.findUnique({ where: { usuario: 'admin' } });
  if (existing) {
    console.log('El usuario admin ya existe.');
    process.exit(0);
  }

  const passwordHash = await hashPassword(process.env.CREATE_ADMIN_PASSWORD || 'Admin1234');
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

  console.log('Admin creado. Usuario: admin | Password:', process.env.CREATE_ADMIN_PASSWORD || 'Admin1234');
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});