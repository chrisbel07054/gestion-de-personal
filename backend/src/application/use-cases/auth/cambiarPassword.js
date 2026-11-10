const { hashPassword, comparePassword } = require('../../../infrastructure/security/passwordHelper');

function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function cambiarPasswordUseCase(usuarioRepository) {
  return async function cambiarPassword({ usuarioId, oldPassword, newPassword }) {
    if (!oldPassword || !newPassword) throw err('oldPassword y newPassword son requeridos', 'BAD_REQUEST');
    const user = await usuarioRepository.obtenerPorId(usuarioId);
    if (!user) throw err('Usuario no encontrado', 'NOT_FOUND');
    const match = await comparePassword(oldPassword, user.passwordHash);
    if (!match) throw err('Contraseña actual inválida', 'INVALID_PASSWORD');
    const passwordHash = await hashPassword(newPassword);
    await usuarioRepository.editar(usuarioId, { passwordHash });
  };
};
