function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function activarItemCatalogoUseCase(catalogoRepository, nombreEntidad) {
  return async function activar(id) {
    const item = await catalogoRepository.obtenerPorId(id);
    if (!item) throw err(`${nombreEntidad} no encontrado`, 'NOT_FOUND');
    if (item.estado === 'Activo') return item;
    return catalogoRepository.activar(id);
  };
};
