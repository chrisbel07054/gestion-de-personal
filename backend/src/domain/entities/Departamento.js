class Departamento {
  constructor({ nombre, descripcion, responsable, estado }) {
    if (!nombre) throw new Error('El nombre del departamento es obligatorio');
    this.nombre = nombre;
    this.descripcion = descripcion || '';
    this.responsable = responsable || null;
    this.estado = estado || 'Activo';
  }
}
module.exports = Departamento;
