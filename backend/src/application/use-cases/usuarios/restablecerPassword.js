const crypto = require('crypto');
const { hashPassword } = require('../../../infrastructure/security/passwordHelper');

function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function restablecerPasswordUseCase(usuarioRepository) {
  return async function restablecerPassword(id, newPasswordDeseada) {
    const usuario = await usuarioRepository.obtenerPorId(id);
    if (!usuario) throw err('Usuario no encontrado', 'NOT_FOUND');
    // No generar ni devolver contraseñas temporales automáticamente.
    // Se requiere que el cliente envíe la nueva contraseña en el cuerpo de la petición.
    if (!newPasswordDeseada) throw err('Se requiere nueva contraseña', 'BAD_REQUEST');
    if (newPasswordDeseada.length < 8) throw err('La contraseña debe tener al menos 8 caracteres', 'BAD_REQUEST');
    const passwordHash = await hashPassword(newPasswordDeseada);
    await usuarioRepository.editar(id, { passwordHash });
    return null;
  };
};
