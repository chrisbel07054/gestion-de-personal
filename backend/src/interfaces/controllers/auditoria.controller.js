const PrismaAuditoriaRepository = require('../../infrastructure/database/repositories/PrismaAuditoriaRepository');
const listarAuditoriaUseCase = require('../../application/use-cases/auditoria/listarAuditoria');

const auditoriaRepository = new PrismaAuditoriaRepository();
const listarAuditoria = listarAuditoriaUseCase(auditoriaRepository);

exports.listar = async (req, res) => {
  try {
    const data = await listarAuditoria(req.query);
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};
