const { hashPassword } = require('../../../infrastructure/security/passwordHelper');

function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function crearUsuarioUseCase(usuarioRepository) {
  return async function crearUsuario({ usuario, password, nombre, correo, rol }) {
    if (!usuario || !nombre || !rol) throw err('Campos incompletos', 'BAD_REQUEST');
    if (await usuarioRepository.existeUsuario(usuario)) throw err('Nombre de usuario ya existe', 'DUPLICATE');
    // Si no se proporciona contraseña, generamos una aleatoria y la guardamos hasheada
    // para que el usuario no pueda iniciar sesión con una contraseña conocida.
    const plain = password || require('crypto').randomBytes(12).toString('base64url');
    const passwordHash = await hashPassword(plain);
    return usuarioRepository.crear({ usuario, passwordHash, nombre, correo, rol });
  };
};
