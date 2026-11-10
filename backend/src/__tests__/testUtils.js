// Helper compartido para las pruebas. A diferencia de MongoDB, Postgres no tiene
// un equivalente cómodo a "mongodb-memory-server" (base en memoria efímera), así
// que las pruebas corren contra una base de datos Postgres real — configúrala en
// DATABASE_URL apuntando a una base de datos DEDICADA para pruebas (nunca la de
// producción/desarrollo, porque limpiarBaseDeDatos() borra todo su contenido).
const prisma = require('../infrastructure/database/prismaClient');

// Orden no importa: TRUNCATE ... CASCADE resuelve las dependencias de FK solo.
const TABLAS = [
  'observaciones', 'auditorias', 'permisos', 'reposos_medicos', 'vacaciones',
  'asistencias', 'horarios', 'empleados', 'cargos', 'departamentos', 'usuarios',
];

async function limpiarBaseDeDatos() {
  const nombres = TABLAS.map((t) => `"${t}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${nombres} RESTART IDENTITY CASCADE;`);
}

module.exports = { prisma, limpiarBaseDeDatos };
