// Entidad de dominio: define la forma y las invariantes de un Empleado,
// independiente de Mongoose/Express. Los casos de uso trabajan con esta forma.
class Empleado {
  constructor({ cedula, nombre, apellido, fechaNacimiento, sexo, telefono, correo,
                direccion, departamentoId, cargoId, fechaIngreso, estado, foto }) {
    if (!cedula) throw new Error('La cédula es obligatoria');
    if (!nombre) throw new Error('El nombre es obligatorio');
    if (!departamentoId) throw new Error('El departamento es obligatorio');
    if (!cargoId) throw new Error('El cargo es obligatorio');

    this.cedula = cedula;
    this.nombre = nombre;
    this.apellido = apellido;
    this.fechaNacimiento = fechaNacimiento;
    this.sexo = sexo;
    this.telefono = telefono;
    this.correo = correo;
    this.direccion = direccion;
    this.departamentoId = departamentoId;
    this.cargoId = cargoId;
    this.fechaIngreso = fechaIngreso;
    this.estado = estado || 'Activo';
    this.foto = foto || null;
  }
}

module.exports = Empleado;
