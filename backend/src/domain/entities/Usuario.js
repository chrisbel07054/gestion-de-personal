class Usuario {
  constructor({ usuario, passwordHash, nombre, correo, rol, estado }) {
    if (!usuario) throw new Error('El nombre de usuario es obligatorio');
    if (!['ADMINISTRADOR', 'RRHH', 'OPERADOR'].includes(rol)) throw new Error('Rol inválido');
    this.usuario = usuario;
    this.passwordHash = passwordHash;
    this.nombre = nombre;
    this.correo = correo;
    this.rol = rol;
    this.estado = estado || 'Activo';
  }
}

module.exports = Usuario;
