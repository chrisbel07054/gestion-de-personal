function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function editarItemCatalogoUseCase(catalogoRepository, nombreEntidad) {
  return async function editar(id, cambios) {
    if (cambios.nombre && await catalogoRepository.existeNombre(cambios.nombre, id)) {
      throw err(`Nombre de ${nombreEntidad} ya en uso`, 'DUPLICATE');
    }
    const item = await catalogoRepository.editar(id, cambios);
    if (!item) throw err(`${nombreEntidad} no encontrado`, 'NOT_FOUND');
    return item;
  };
};
