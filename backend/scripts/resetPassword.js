require('dotenv').config();

const prisma = require('../src/infrastructure/database/prismaClient');
const { hashPassword } = require('../src/infrastructure/security/passwordHelper');

async function main() {
  const user = process.argv[2] || 'admin';
  const pwd = process.argv[3] || 'Admin123!';

  if (!process.env.DATABASE_URL) {
    console.error(
      'Set DATABASE_URL in .env before running this script.'
    );
    process.exit(1);
  }

  const existing = await prisma.usuario.findUnique({
    where: { usuario: user }
  });

  if (!existing) {
    console.error('Usuario no encontrado:', user);
    process.exit(1);
  }

  const passwordHash = await hashPassword(pwd);

  await prisma.usuario.update({
    where: { usuario: user },
    data: { passwordHash }
  });

  console.log(
    `Contraseña del usuario ${user} restablecida correctamente.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });