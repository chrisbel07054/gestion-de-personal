const PrismaUsuarioRepository = require('../../infrastructure/database/repositories/PrismaUsuarioRepository');
const crearUsuarioUseCase = require('../../application/use-cases/usuarios/crearUsuario');
const editarUsuarioUseCase = require('../../application/use-cases/usuarios/editarUsuario');
const restablecerPasswordUseCase = require('../../application/use-cases/usuarios/restablecerPassword');
const desactivarUsuarioUseCase = require('../../application/use-cases/usuarios/desactivarUsuario');
const activarUsuarioUseCase = require('../../application/use-cases/usuarios/activarUsuario');
const listarUsuariosUseCase = require('../../application/use-cases/usuarios/listarUsuarios');
const { toId } = require('../../shared/ids');

const usuarioRepository = new PrismaUsuarioRepository();
const crearUsuario = crearUsuarioUseCase(usuarioRepository);
const editarUsuario = editarUsuarioUseCase(usuarioRepository);
const restablecerPassword = restablecerPasswordUseCase(usuarioRepository);
const desactivarUsuario = desactivarUsuarioUseCase(usuarioRepository);
const activarUsuario = activarUsuarioUseCase(usuarioRepository);
const listarUsuarios = listarUsuariosUseCase(usuarioRepository);

function manejarError(res, err) {
  const CODIGOS = { DUPLICATE: 400, NOT_FOUND: 404, BUSINESS_RULE: 400, BAD_REQUEST: 400, INVALID_ID: 400 };
  if (err.code && CODIGOS[err.code]) return res.status(CODIGOS[err.code]).json({ mensaje: err.message, data: null, error: err.code });
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
}

exports.listar = async (req, res) => {
  try {
    const data = await listarUsuarios();
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.obtener = async (req, res) => {
  try {
    const user = await usuarioRepository.obtenerPorId(toId(req.params.id));
    if (!user) return res.status(404).json({ mensaje: 'No encontrado', data: null, error: 'NOT_FOUND' });
    const { passwordHash, ...safe } = user;
    return res.json({ mensaje: 'OK', data: safe, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.crear = async (req, res) => {
  try {
    const data = await crearUsuario(req.body);
    const { passwordHash, ...safe } = data;
    return res.status(201).json({ mensaje: 'Usuario creado', data: safe, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.editar = async (req, res) => {
  try {
    const data = await editarUsuario(toId(req.params.id), req.body);
    const { passwordHash, ...safe } = data;
    return res.json({ mensaje: 'Usuario actualizado', data: safe, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.restablecerPassword = async (req, res) => {
  try {
    const usuarioId = toId(req.params.id);
    const usuario = await usuarioRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'No encontrado', data: null, error: 'NOT_FOUND' });
    }

    req.auditoria = {
      tipo: 'PASSWORD_RESTABLECIDO',
      usuarioObjetivo: usuario.usuario,
    };

    await restablecerPassword(usuarioId, req.body?.newPassword);
    return res.json({ mensaje: 'Contraseña actualizada', data: null, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.desactivar = async (req, res) => {
  try {
    const usuarioId = toId(req.params.id);
    const usuario = await usuarioRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        mensaje: 'No encontrado',
        data: null,
        error: 'NOT_FOUND',
      });
    }

    req.auditoria = {
      tipo: 'USUARIO_DESACTIVADO',
      usuarioObjetivo: usuario.usuario,
    };

    await desactivarUsuario(usuarioId);

    return res.json({
      mensaje: 'Usuario desactivado',
      data: null,
      error: null,
    });
  } catch (err) {
    return manejarError(res, err);
  }
};

exports.activar = async (req, res) => {
  try {
    const usuarioId = toId(req.params.id);

    const usuario = await usuarioRepository.obtenerPorId(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'No encontrado',
        data: null,
        error: 'NOT_FOUND',
      });
    }

    req.auditoria = {
      tipo: 'USUARIO_ACTIVADO',
      usuarioObjetivo: usuario.usuario,
    };

    const data = await activarUsuario(usuarioId);

    const { passwordHash, ...safe } = data;

    return res.json({
      mensaje: 'Usuario activado',
      data: safe,
      error: null,
    });
  } catch (err) {
    return manejarError(res, err);
  }
};