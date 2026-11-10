// Usado por el middleware de auditoría (src/interfaces/middlewares/auditoria.js)
// para no hablarle directo a Mongoose desde la capa de interfaces.
module.exports = function registrarEventoUseCase(auditoriaRepository) {
  return async function registrarEvento(evento) {
    return auditoriaRepository.registrar(evento);
  };
};
