const reporteAsistencia = require('../../application/use-cases/reportes/asistencia');
const reporteHorarios = require('../../application/use-cases/reportes/horarios');
const reporteVacaciones = require('../../application/use-cases/reportes/vacaciones');
const reporteReposos = require('../../application/use-cases/reportes/reposos');
const reportePermisos = require('../../application/use-cases/reportes/permisos');

const exportXlsx = require('../../application/use-cases/reportes/exportXlsx');
const exportPdf = require('../../application/use-cases/reportes/exportPdf');

// =========================================================
// REPORTE DE ASISTENCIA
// =========================================================

exports.asistencia = async (req, res) => {
  try {
    const rows = await reporteAsistencia(req.query);

    return res.json({
      mensaje: 'OK',
      data: rows,
      error: null,
    });
  } catch (err) {
    console.error('Error en reporte de asistencia:', err);

    return res.status(500).json({
      mensaje: err.message || 'Error interno',
      data: null,
      error: err.code || 'INTERNAL',
    });
  }
};

// =========================================================
// REPORTE DE HORARIOS
// =========================================================

exports.horarios = async (req, res) => {
  try {
    const rows = await reporteHorarios(req.query);

    return res.json({
      mensaje: 'OK',
      data: rows,
      error: null,
    });
  } catch (err) {
    console.error('Error en reporte de horarios:', err);

    return res.status(500).json({
      mensaje: err.message || 'Error interno',
      data: null,
      error: err.code || 'INTERNAL',
    });
  }
};

// =========================================================
// REPORTE DE VACACIONES
// =========================================================

exports.vacaciones = async (req, res) => {
  try {
    const rows = await reporteVacaciones(req.query);

    return res.json({
      mensaje: 'OK',
      data: rows,
      error: null,
    });
  } catch (err) {
    console.error('Error en reporte de vacaciones:', err);

    return res.status(500).json({
      mensaje: err.message || 'Error interno',
      data: null,
      error: err.code || 'INTERNAL',
    });
  }
};

// =========================================================
// REPORTE DE REPOSOS MÉDICOS
// =========================================================

exports.reposos = async (req, res) => {
  try {
    const rows = await reporteReposos(req.query);

    return res.json({
      mensaje: 'OK',
      data: rows,
      error: null,
    });
  } catch (err) {
    console.error('Error en reporte de reposos médicos:', err);

    return res.status(500).json({
      mensaje: err.message || 'Error interno',
      data: null,
      error: err.code || 'INTERNAL',
    });
  }
};

// =========================================================
// REPORTE DE PERMISOS
// =========================================================

exports.permisos = async (req, res) => {
  try {
    const rows = await reportePermisos(req.query);

    return res.json({
      mensaje: 'OK',
      data: rows,
      error: null,
    });
  } catch (err) {
    console.error('Error en reporte de permisos:', err);

    return res.status(500).json({
      mensaje: err.message || 'Error interno',
      data: null,
      error: err.code || 'INTERNAL',
    });
  }
};

// =========================================================
// EXPORTAR REPORTE A EXCEL
// =========================================================

exports.exportExcel = async (req, res) => {
  try {
    const tipo = req.query.tipo || 'asistencia';

    const buf = await exportXlsx({
      tipo,
      filter: req.query,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${tipo}.xlsx"`
    );

    return res.send(buf);
  } catch (err) {
    console.error('Error exportando reporte a Excel:', err);

    const status = err.status || 500;

    return res.status(status).json({
      mensaje: err.message || 'Error exportando',
      data: null,
      error: err.code || 'INTERNAL',
    });
  }
};

// =========================================================
// EXPORTAR REPORTE A PDF
// =========================================================

exports.exportPdf = async (req, res) => {
  try {
    const tipo = req.query.tipo || 'asistencia';

    const buf = await exportPdf({
      tipo,
      filter: req.query,
    });

    res.setHeader(
      'Content-Type',
      'application/pdf'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${tipo}.pdf"`
    );

    return res.send(buf);
  } catch (err) {
    console.error('Error exportando reporte a PDF:', err);

    const status = err.status || 500;

    return res.status(status).json({
      mensaje: err.message || 'Error exportando',
      data: null,
      error: err.code || 'INTERNAL',
    });
  }
};