class Cargo {
  constructor({ nombre, descripcion, estado }) {
    if (!nombre) throw new Error('El nombre del cargo es obligatorio');
    this.nombre = nombre;
    this.descripcion = descripcion || '';
    this.estado = estado || 'Activo';
  }
}
module.exports = Cargo;
