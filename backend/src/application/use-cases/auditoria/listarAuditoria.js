module.exports = function listarAuditoriaUseCase(auditoriaRepository) {
  return async function listarAuditoria({
    usuarioId,
    entidad,
    desde,
    hasta,
    page = 1,
    limit = 20,
  } = {}) {
    const pagina = Math.max(1, Number(page) || 1);
    const limite = Math.max(1, Number(limit) || 20);

    return auditoriaRepository.listar(
      {
        usuarioId,
        entidad,
        desde,
        hasta,
      },
      {
        page: pagina,
        limit: limite,
      }
    );
  };
};