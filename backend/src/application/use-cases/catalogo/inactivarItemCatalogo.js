function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function inactivarItemCatalogoUseCase(catalogoRepository, nombreEntidad) {
  return async function inactivar(id) {
    const item = await catalogoRepository.obtenerPorId(id);
    if (!item) throw err(`${nombreEntidad} no encontrado`, 'NOT_FOUND');

    if (item.estado === 'Inactivo') {
      return item;
    }

    const asociados = await catalogoRepository.contarEmpleadosActivosAsociados(id);
    if (asociados > 0) {
      throw err(`No puede inactivarse: tiene empleados activos asociados`, 'BUSINESS_RULE');
    }
    return catalogoRepository.inactivar(id);
  };
};
