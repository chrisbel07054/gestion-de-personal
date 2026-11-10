class RegistroAuditoria {
  constructor({ usuarioId, accion, entidad, entidadId, detalle, fecha, ip }) {
    if (!accion) throw new Error('La acción es obligatoria');
    if (!entidad) throw new Error('La entidad afectada es obligatoria');
    this.usuarioId = usuarioId || null;
    this.accion = accion;
    this.entidad = entidad;
    this.entidadId = entidadId || null;
    this.detalle = detalle || null;
    this.fecha = fecha || new Date();
    this.ip = ip || null;
  }
}
module.exports = RegistroAuditoria;
