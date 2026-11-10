const PrismaCatalogoRepository = require('../../infrastructure/database/repositories/PrismaCatalogoRepository');
const crearItemCatalogoUseCase = require('../../application/use-cases/catalogo/crearItemCatalogo');
const editarItemCatalogoUseCase = require('../../application/use-cases/catalogo/editarItemCatalogo');
const inactivarItemCatalogoUseCase = require('../../application/use-cases/catalogo/inactivarItemCatalogo');
const activarItemCatalogoUseCase = require('../../application/use-cases/catalogo/activarItemCatalogo');
const { toId } = require('../../shared/ids');

const repositorio = new PrismaCatalogoRepository('cargo', 'cargoId');
const crearItem = crearItemCatalogoUseCase(repositorio, 'Cargo');
const editarItem = editarItemCatalogoUseCase(repositorio, 'Cargo');
const inactivarItem = inactivarItemCatalogoUseCase(repositorio, 'Cargo');
const activarItem = activarItemCatalogoUseCase(repositorio, 'Cargo');

function manejarError(res, err) {
  const CODIGOS = { DUPLICATE: 400, NOT_FOUND: 404, BUSINESS_RULE: 400, INVALID_ID: 400 };
  if (err.code && CODIGOS[err.code]) return res.status(CODIGOS[err.code]).json({ mensaje: err.message, data: null, error: err.code });
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
}

exports.listar = async (req, res) => {
  try {
    const data = await repositorio.listar();
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.obtener = async (req, res) => {
  try {
    const data = await repositorio.obtenerPorId(toId(req.params.id));
    if (!data) return res.status(404).json({ mensaje: 'No encontrado', data: null, error: 'NOT_FOUND' });
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.crear = async (req, res) => {
  try {
    const data = await crearItem(req.body);
    return res.status(201).json({ mensaje: 'Cargo creado', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.editar = async (req, res) => {
  try {
    const data = await editarItem(toId(req.params.id), req.body);
    return res.json({ mensaje: 'Cargo actualizado', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.inactivar = async (req, res) => {
  try {
    await inactivarItem(toId(req.params.id));
    return res.json({ mensaje: 'Cargo inactivado', data: null, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.activar = async (req, res) => {
  try {
    const data = await activarItem(toId(req.params.id));
    return res.json({ mensaje: 'Cargo activado', data, error: null });
  } catch (err) { return manejarError(res, err); }
};
