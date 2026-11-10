// Helper para convertir los IDs que llegan como string desde HTTP (params/body)
// al tipo Int que usa Prisma/PostgreSQL. Antes, con Mongo, los IDs eran ObjectId
// y se aceptaban tal cual como string; con Postgres hay que parsearlos a número.
function toId(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n)) {
    const err = new Error(`ID inválido: "${value}"`);
    err.status = 400;
    err.code = 'INVALID_ID';
    throw err;
  }
  return n;
}

module.exports = { toId };
