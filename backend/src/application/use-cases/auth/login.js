const jwt = require('jsonwebtoken');
const { comparePassword } = require('../../../infrastructure/security/passwordHelper');

function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function loginUseCase(usuarioRepository) {
  return async function login({ usuario, password }) {
    if (!usuario || !password) throw err('Usuario y password son requeridos', 'BAD_REQUEST');
    const user = await usuarioRepository.obtenerPorUsuario(usuario);
    if (!user) throw err('Credenciales inválidas', 'INVALID_CREDENTIALS');
    if (user.estado !== 'Activo') throw err('Usuario inactivo', 'INACTIVE_USER');
    const match = await comparePassword(password, user.passwordHash);
    if (!match) throw err('Credenciales inválidas', 'INVALID_CREDENTIALS');

    const payload = { usuarioId: user.id, rol: user.rol };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'changeme', {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
    return { token, rol: user.rol };
  };
};
