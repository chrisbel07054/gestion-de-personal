const PDFDocument = require('pdfkit');

const reporteAsistencia = require('./asistencia');
const reporteHorarios = require('./horarios');
const reporteVacaciones = require('./vacaciones');
const reporteReposos = require('./reposos');
const reportePermisos = require('./permisos');

const C = {
  fondo: '#F1F5F9',
  blanco: '#FFFFFF',
  alterno: '#F8FAFC',
  principal: '#052659',
  oscuro: '#011025',
  texto: '#475569',
  borde: '#E2E8F0',
};

const FOOTER_SPACE = 32;

function bufferFromDoc(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function fecha(f) {
  if (!f) return '';
  const v = String(f).substring(0, 10);
  const p = v.split('-');
  return p.length === 3 && p[0].length === 4
    ? `${p[2]}/${p[1]}/${p[0]}`
    : String(f);
}

function nombre(e) {
  return e ? [e.nombre, e.apellido].filter(Boolean).join(' ') : '';
}

function departamento(r) {
  return r?.empleado?.departamento?.nombre || r?.departamento?.nombre || '';
}

function cargo(r) {
  return r?.empleado?.cargo?.nombre || r?.cargo?.nombre || '';
}

function cedula(r) {
  return r?.empleado?.cedula || '';
}

function diasLaborales(dias) {
  if (!Array.isArray(dias)) return '';

  const map = {
    lunes: 'Lun',
    martes: 'Mar',
    miércoles: 'Mié',
    miercoles: 'Mié',
    jueves: 'Jue',
    viernes: 'Vie',
    sábado: 'Sáb',
    sabado: 'Sáb',
    domingo: 'Dom',
  };

  return dias
    .map(d => map[String(d).trim().toLowerCase()] || d)
    .join(' · ');
}

function estadoAsistencia(r) {
  return r?.estado || (r?.horaEntrada || r?.horaSalida ? 'Presente' : 'Ausente');
}

function horaAsistencia(r, tipo) {
  const estado = estadoAsistencia(r);

  if (['Ausente', 'Vacaciones', 'Reposo', 'Permiso'].includes(estado)) {
    return estado;
  }

  return tipo === 'entrada'
    ? r?.horaEntrada || ''
    : r?.horaSalida || '';
}

function crearDocumento(titulo) {
  return new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: {
      top: 42,
      bottom: 42,
      left: 55,
      right: 55,
    },
    bufferPages: true,
    info: {
      Title: titulo,
      Author: 'Plataforma de Control de Personal',
      Subject: titulo,
    },
  });
}

function anchoTabla(columnas) {
  return columnas.reduce((s, c) => s + c.width, 0);
}

function xTabla(doc, columnas) {
  return (doc.page.width - anchoTabla(columnas)) / 2;
}

function encabezado(doc, titulo) {
  const x = doc.page.margins.left;
  const ancho = doc.page.width - x - doc.page.margins.right;
  const y = 25;

  doc
    .moveTo(x, y)
    .lineTo(x + ancho, y)
    .lineWidth(2)
    .strokeColor(C.principal)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor(C.principal)
    .text(
      'Clínica Popular Tipo I "Nuestra Señora de la Paz"',
      x,
      y + 10,
      { width: ancho, align: 'center', lineBreak: false }
    );

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(C.oscuro)
    .text(
      titulo.toUpperCase(),
      x,
      y + 31,
      { width: ancho, align: 'center', lineBreak: false }
    );

  return y + 56;
}

function filtros(doc, filter, y) {
  const x = doc.page.margins.left;
  const ancho = doc.page.width - x - doc.page.margins.right;

  const texto = [
    `Departamento: ${filter?.departamento || filter?.departamentoNombre || 'Todos'}`,
    `Empleado: ${filter?.empleado || filter?.empleadoNombre || 'Todos'}`,
    `Desde: ${fecha(filter?.desde) || 'No especificado'}`,
    `Hasta: ${fecha(filter?.hasta) || 'No especificado'}`,
  ].join('     |     ');

  doc
    .moveTo(x, y)
    .lineTo(x + ancho, y)
    .lineWidth(0.5)
    .strokeColor(C.borde)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(C.texto)
    .text(texto, x, y + 8, {
      width: ancho,
      align: 'center',
      lineBreak: false,
    });

  doc
    .moveTo(x, y + 28)
    .lineTo(x + ancho, y + 28)
    .lineWidth(0.5)
    .strokeColor(C.borde)
    .stroke();

  return y + 42;
}

function alturaFila(doc, valores, columnas, padding = 6) {
  let altura = 23;

  valores.forEach((valor, i) => {
    const c = columnas[i];
    if (!c) return;

    const h = doc.heightOfString(String(valor ?? ''), {
      width: c.width - padding * 2,
      font: 'Helvetica',
      fontSize: 8.5,
      lineGap: 1,
    });

    altura = Math.max(altura, h + padding * 2);
  });

  return altura;
}

function encabezadoTabla(doc, columnas, y) {
  let x = xTabla(doc, columnas);
  const alto = 28;

  columnas.forEach(c => {
    doc
      .rect(x, y, c.width, alto)
      .fillColor(C.fondo)
      .fill();

    doc
      .rect(x, y, c.width, alto)
      .lineWidth(0.5)
      .strokeColor(C.borde)
      .stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(C.principal)
      .text(c.header, x + 5, y + 9, {
        width: c.width - 10,
        align: c.align || 'left',
        lineBreak: false,
      });

    x += c.width;
  });

  return y + alto;
}

function filaTabla(doc, columnas, valores, y, indice) {
  let x = xTabla(doc, columnas);
  const padding = 6;
  const alto = alturaFila(doc, valores, columnas, padding);
  const fondo = indice % 2 === 0 ? C.blanco : C.alterno;

  columnas.forEach((c, i) => {
    const valor = String(valores[i] ?? '');

    doc
      .rect(x, y, c.width, alto)
      .fillColor(fondo)
      .fill();

    doc
      .rect(x, y, c.width, alto)
      .lineWidth(0.4)
      .strokeColor(C.borde)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(C.oscuro)
      .text(valor, x + padding, y + padding + 1, {
        width: c.width - padding * 2,
        height: alto - padding * 2,
        align: c.align || 'left',
        valign: 'center',
        lineGap: 1,
      });

    x += c.width;
  });

  return y + alto;
}

function espacioDisponible(doc, y) {
  return doc.page.height - doc.page.margins.bottom - y;
}

function pie(doc) {
  const x = doc.page.margins.left;
  const ancho = doc.page.width - x - doc.page.margins.right;
  const y = doc.page.height - doc.page.margins.bottom - 20;

  doc
    .moveTo(x, y)
    .lineTo(x + ancho, y)
    .lineWidth(0.5)
    .strokeColor(C.borde)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(C.texto)
    .text(
      `Generado el ${new Date().toLocaleString('es-VE')}`,
      x,
      y + 7,
      {
        width: ancho,
        align: 'right',
        lineBreak: false,
      }
    );
}

function nuevaPagina(doc, titulo, columnas) {
  doc.addPage();

  let y = encabezado(doc, titulo);
  y = encabezadoTabla(doc, columnas, y);

  return y;
}

async function generarReporte({
  titulo,
  rows,
  filter,
  columnas,
  transformar,
}) {
  const doc = crearDocumento(titulo);

  let y = encabezado(doc, titulo);
  y = filtros(doc, filter, y);
  y = encabezadoTabla(doc, columnas, y);

  if (!rows?.length) {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(C.texto)
      .text(
        'No se encontraron registros para los filtros seleccionados.',
        doc.page.margins.left,
        y + 18,
        {
          width:
            doc.page.width -
            doc.page.margins.left -
            doc.page.margins.right,
          align: 'center',
        }
      );

    pie(doc);
    return bufferFromDoc(doc);
  }

  for (let i = 0; i < rows.length; i++) {
    const valores = transformar(rows[i]);
    const alto = alturaFila(doc, valores, columnas);

    /*
     * Aquí está la corrección principal:
     * se reserva también el espacio necesario
     * para el pie antes de colocar cada fila.
     */
    if (espacioDisponible(doc, y) < alto + FOOTER_SPACE) {
      y = nuevaPagina(doc, titulo, columnas);
    }

    y = filaTabla(doc, columnas, valores, y, i);
  }

  /*
   * El pie se coloca directamente al final
   * de la última página. Nunca crea una página
   * adicional solamente para mostrar la fecha.
   */
  pie(doc);

  return bufferFromDoc(doc);
}

const handlers = {
  asistencia: async filter => {
    const rows = await reporteAsistencia(filter);

    const columnas = [
      { header: 'Fecha', width: 65, align: 'center' },
      { header: 'Empleado', width: 150 },
      { header: 'Cédula', width: 75, align: 'center' },
      { header: 'Departamento', width: 105 },
      { header: 'Cargo', width: 100 },
      { header: 'Entrada', width: 70, align: 'center' },
      { header: 'Salida', width: 70, align: 'center' },
    ];

    return generarReporte({
      titulo: 'Reporte de Asistencia',
      rows,
      filter,
      columnas,
      transformar: r => [
        fecha(r.fecha),
        nombre(r.empleado),
        cedula(r),
        departamento(r),
        cargo(r),
        horaAsistencia(r, 'entrada'),
        horaAsistencia(r, 'salida'),
      ],
    });
  },

  horarios: async filter => {
    const rows = await reporteHorarios(filter);

    const columnas = [
      { header: 'Empleado', width: 155 },
      { header: 'Cédula', width: 80, align: 'center' },
      { header: 'Departamento', width: 110 },
      { header: 'Cargo', width: 105 },
      { header: 'Entrada', width: 70, align: 'center' },
      { header: 'Salida', width: 70, align: 'center' },
      { header: 'Días laborales', width: 105, align: 'center' },
    ];

    return generarReporte({
      titulo: 'Reporte de Horarios',
      rows,
      filter,
      columnas,
      transformar: r => [
        nombre(r.empleado),
        cedula(r),
        departamento(r),
        cargo(r),
        r.horaEntrada || '',
        r.horaSalida || '',
        diasLaborales(r.diasLaborales),
      ],
    });
  },

  vacaciones: async filter => {
    const rows = await reporteVacaciones(filter);

    const columnas = [
      { header: 'Empleado', width: 160 },
      { header: 'Cédula', width: 80, align: 'center' },
      { header: 'Departamento', width: 110 },
      { header: 'Cargo', width: 105 },
      { header: 'Desde', width: 75, align: 'center' },
      { header: 'Hasta', width: 75, align: 'center' },
      { header: 'Motivo', width: 135 },
    ];

    return generarReporte({
      titulo: 'Reporte de Vacaciones',
      rows,
      filter,
      columnas,
      transformar: r => [
        nombre(r.empleado),
        cedula(r),
        departamento(r),
        cargo(r),
        fecha(r.desde),
        fecha(r.hasta),
        r.motivo || '',
      ],
    });
  },

  reposos: async filter => {
    const rows = await reporteReposos(filter);

    const columnas = [
      { header: 'Empleado', width: 155 },
      { header: 'Cédula', width: 80, align: 'center' },
      { header: 'Departamento', width: 105 },
      { header: 'Cargo', width: 100 },
      { header: 'Inicio', width: 75, align: 'center' },
      { header: 'Fin', width: 75, align: 'center' },
      { header: 'Diagnóstico', width: 145 },
    ];

    return generarReporte({
      titulo: 'Reporte de Reposos Médicos',
      rows,
      filter,
      columnas,
      transformar: r => [
        nombre(r.empleado),
        cedula(r),
        departamento(r),
        cargo(r),
        fecha(r.fechaInicio),
        fecha(r.fechaFin),
        r.diagnostico || '',
      ],
    });
  },

  permisos: async filter => {
    const rows = await reportePermisos(filter);

    const columnas = [
      { header: 'Empleado', width: 155 },
      { header: 'Cédula', width: 80, align: 'center' },
      { header: 'Departamento', width: 105 },
      { header: 'Cargo', width: 100 },
      { header: 'Fecha', width: 75, align: 'center' },
      { header: 'Tipo', width: 90 },
      { header: 'Motivo', width: 150 },
    ];

    return generarReporte({
      titulo: 'Reporte de Permisos',
      rows,
      filter,
      columnas,
      transformar: r => [
        nombre(r.empleado),
        cedula(r),
        departamento(r),
        cargo(r),
        fecha(r.fecha),
        r.tipo || '',
        r.motivo || '',
      ],
    });
  },
};

module.exports = async function exportReportPdf({
  tipo = 'asistencia',
  filter = {},
}) {
  if (!handlers[tipo]) {
    throw {
      status: 400,
      code: 'INVALID_REPORT_TYPE',
      message: 'Tipo de reporte inválido',
    };
  }

  return handlers[tipo](filter);
};