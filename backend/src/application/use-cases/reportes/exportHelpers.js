const ExcelJS = require('exceljs');

const COLORES = {
  fondo: 'F1F5F9',
  claro1: 'C6E7FF',
  claro2: '7EA0C5',
  oscuro: '011025',
  principal: '052659',
  boton: '5482B4',
  borde: '071952',
  blanco: 'FFFFFF',
  grisTexto: '475569',
  grisSuave: 'E2E8F0',
};

function crearEstiloFuente({
  nombre = 'Aptos',
  tamaño = 10,
  negrita = false,
  color = COLORES.oscuro,
} = {}) {
  return {
    name: nombre,
    size: tamaño,
    bold: negrita,
    color: { argb: color },
  };
}

function aplicarBordeSuave(cell) {
  cell.border = {
    top: { style: 'thin', color: { argb: COLORES.grisSuave } },
    bottom: { style: 'thin', color: { argb: COLORES.grisSuave } },
    left: { style: 'thin', color: { argb: COLORES.grisSuave } },
    right: { style: 'thin', color: { argb: COLORES.grisSuave } },
  };
}

function crearWorkbook(nombreHoja, columnas) {
  const wb = new ExcelJS.Workbook();

  wb.creator = 'Plataforma de Control de Personal';
  wb.lastModifiedBy = 'Plataforma de Control de Personal';
  wb.created = new Date();
  wb.modified = new Date();

  const ws = wb.addWorksheet(nombreHoja, {
    properties: { defaultRowHeight: 20 },
    views: [{ showGridLines: false }],
  });

  ws.columns = columnas;

  return { wb, ws };
}

function agregarEncabezadoReporte(ws, {
  titulo = 'Reporte',
  subtitulo = 'Clínica Popular Tipo I "Nuestra Señora de la Paz"',
  totalColumnas,
}) {
  const ultimaColumna = Math.max(totalColumnas || ws.columnCount || 1, 1);
  const ultimaLetra = ws.getColumn(ultimaColumna).letter;

  // TÍTULO
  ws.mergeCells(`A1:${ultimaLetra}1`);
  const tituloCell = ws.getCell('A1');
  tituloCell.value = titulo;
  tituloCell.font = crearEstiloFuente({ tamaño: 18, negrita: true, color: COLORES.principal });
  tituloCell.alignment = { horizontal: 'left', vertical: 'middle' };
  ws.getRow(1).height = 30;

  // SUBTÍTULO
  ws.mergeCells(`A2:${ultimaLetra}2`);
  const subtituloCell = ws.getCell('A2');
  subtituloCell.value = subtitulo;
  subtituloCell.font = crearEstiloFuente({ tamaño: 10, color: COLORES.grisTexto });
  subtituloCell.alignment = { horizontal: 'left', vertical: 'middle' };
  ws.getRow(2).height = 21;
}

function agregarFiltros(ws, {
  departamento = 'Todos',
  empleado = 'Todos',
  desde = 'No especificado',
  hasta = 'No especificado',
  totalColumnas,
}) {
  const ultimaColumna = Math.max(totalColumnas || ws.columnCount || 1, 1);
  const ultimaLetra = ws.getColumn(ultimaColumna).letter;

  // TÍTULO "FILTROS APLICADOS"
  ws.mergeCells(`A4:${ultimaLetra}4`);
  const tituloFiltros = ws.getCell('A4');
  tituloFiltros.value = 'Filtros aplicados';
  tituloFiltros.font = crearEstiloFuente({ tamaño: 10, negrita: true, color: COLORES.principal });
  tituloFiltros.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.fondo } };
  tituloFiltros.alignment = { horizontal: 'left', vertical: 'middle' };
  ws.getRow(4).height = 22;

  // INFORMACIÓN DE LOS FILTROS
  const filaFiltros = ws.getRow(5);
  const datosFiltros = [
    `Departamento: ${departamento || 'Todos'}`,
    `Empleado: ${empleado || 'Todos'}`,
    `Desde: ${desde || 'No especificado'}`,
    `Hasta: ${hasta || 'No especificado'}`,
  ];

  datosFiltros.forEach((texto, index) => {
    const cell = filaFiltros.getCell(index + 1);
    cell.value = texto;
    cell.font = crearEstiloFuente({ tamaño: 9, negrita: true, color: COLORES.grisTexto });
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.blanco } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    aplicarBordeSuave(cell);
  });

  for (let i = datosFiltros.length + 1; i <= ultimaColumna; i++) {
    const cell = filaFiltros.getCell(i);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.blanco } };
    aplicarBordeSuave(cell);
  }

  ws.getRow(5).height = 30;
}

function agregarEncabezadosTabla(ws, filaInicio = 7) {
  const fila = ws.getRow(filaInicio);

  fila.eachCell((cell) => {
    cell.font = crearEstiloFuente({ tamaño: 10, negrita: true, color: COLORES.principal });
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.fondo } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: COLORES.grisSuave } },
      bottom: { style: 'medium', color: { argb: COLORES.claro2 } },
      left: { style: 'thin', color: { argb: COLORES.grisSuave } },
      right: { style: 'thin', color: { argb: COLORES.grisSuave } },
    };
  });

  fila.height = 28;
}

function aplicarEstiloTabla(ws, filaInicio, filaFin) {
  if (!filaFin || filaFin < filaInicio) return;

  for (let filaNumero = filaInicio; filaNumero <= filaFin; filaNumero++) {
    const fila = ws.getRow(filaNumero);
    const esFilaAlterna = (filaNumero - filaInicio) % 2 === 1;

    fila.eachCell((cell) => {
      cell.font = crearEstiloFuente({ tamaño: 10, color: COLORES.oscuro });
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: esFilaAlterna ? 'F8FAFC' : COLORES.blanco },
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
      aplicarBordeSuave(cell);
    });

    fila.height = 23;
  }
}

function configurarTabla(ws, { filaEncabezado = 7, ultimaFila }) {
  if (!ultimaFila || ultimaFila < filaEncabezado) return;

  const ultimaColumna = ws.columnCount;
  const ultimaLetra = ws.getColumn(ultimaColumna).letter;

  ws.autoFilter = {
    from: `A${filaEncabezado}`,
    to: `${ultimaLetra}${ultimaFila}`,
  };

  ws.views = [
    {
      state: 'frozen',
      ySplit: filaEncabezado,
      showGridLines: false,
    },
  ];
}

function configurarImpresion(ws) {
  ws.pageSetup = {
    orientation: 'landscape',
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalDpi: 300,
    verticalDpi: 300,
  };

  ws.pageSetup.margins = {
    left: 0.25,
    right: 0.25,
    top: 0.5,
    bottom: 0.5,
    header: 0.2,
    footer: 0.2,
  };

  ws.printOptions = {
    horizontalCentered: true,
    verticalCentered: false,
    gridLines: false,
    headings: false,
  };
}

function agregarPieReporte(ws, fila, totalColumnas) {
  if (!fila || !totalColumnas) return;

  const ultimaLetra = ws.getColumn(totalColumnas).letter;
  ws.mergeCells(`A${fila}:${ultimaLetra}${fila}`);

  const cell = ws.getCell(`A${fila}`);
  cell.value = `Generado el ${new Date().toLocaleString('es-VE')}`;
  cell.font = crearEstiloFuente({ tamaño: 8, color: COLORES.grisTexto });
  cell.alignment = { horizontal: 'right', vertical: 'middle' };

  ws.getRow(fila).height = 18;
}

module.exports = {
  COLORES,
  crearWorkbook,
  agregarEncabezadoReporte,
  agregarFiltros,
  agregarEncabezadosTabla,
  aplicarEstiloTabla,
  configurarTabla,
  configurarImpresion,
  agregarPieReporte,
};