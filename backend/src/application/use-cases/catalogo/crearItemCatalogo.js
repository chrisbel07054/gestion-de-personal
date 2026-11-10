function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function crearItemCatalogoUseCase(catalogoRepository, nombreEntidad) {
  return async function crear(datos) {
    if (await catalogoRepository.existeNombre(datos.nombre)) {
      throw err(`Nombre de ${nombreEntidad} ya existe`, 'DUPLICATE');
    }
    return catalogoRepository.crear(datos);
  };
};
