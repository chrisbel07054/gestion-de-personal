const jwt = require('jsonwebtoken');

module.exports = function verificarJWT(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res.status(401).json({ mensaje: 'Token no provisto', data: null, error: 'NO_TOKEN' });
  }
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    req.usuario = { usuarioId: payload.usuarioId, rol: payload.rol };
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido', data: null, error: 'INVALID_TOKEN' });
  }
};
