module.exports = function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No autorizado', data: null, error: 'FORBIDDEN' });
    }
    next();
  };
};
