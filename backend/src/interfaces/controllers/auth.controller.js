const PrismaUsuarioRepository = require('../../infrastructure/database/repositories/PrismaUsuarioRepository');
const loginUseCase = require('../../application/use-cases/auth/login');
const cambiarPasswordUseCase = require('../../application/use-cases/auth/cambiarPassword');

const usuarioRepository = new PrismaUsuarioRepository();
const login = loginUseCase(usuarioRepository);
const cambiarPassword = cambiarPasswordUseCase(usuarioRepository);

function manejarError(res, err) {
  const CODIGOS = { BAD_REQUEST: 400, INVALID_CREDENTIALS: 401, INACTIVE_USER: 403, NOT_FOUND: 404, INVALID_PASSWORD: 401 };
  if (err.code && CODIGOS[err.code]) return res.status(CODIGOS[err.code]).json({ mensaje: err.message, data: null, error: err.code });
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
}

exports.login = async (req, res) => {
  try {
    const data = await login(req.body);
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.perfil = async (req, res) => res.json({ mensaje: 'OK', data: req.usuario, error: null });

exports.cambiarPassword = async (req, res) => {
  try {
    const usuarioId = req.usuario && req.usuario.usuarioId;
    await cambiarPassword({ usuarioId, ...req.body });
    return res.json({ mensaje: 'Contraseña actualizada', data: null, error: null });
  } catch (err) { return manejarError(res, err); }
};
