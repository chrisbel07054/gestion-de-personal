export default function ReporteTabla({
  reporte,
  resumen,
  tipoReporte,
  loadingReporte,
  puedeGenerarReporte,
  exportandoPDF,
  exportandoExcel,
  obtenerTituloReporte,
  formatearValor,
  onExportarPDF,
  onExportarExcel,
}) {
  const configuraciones = {
    asistencia: [
      { key: 'fecha', label: 'Fecha' },
      { key: 'empleado', label: 'Empleado' },
      { key: 'cedula', label: 'Cédula' },
      { key: 'departamento', label: 'Departamento' },
      { key: 'cargo', label: 'Cargo' },
      { key: 'horaEntradaRegistrada', label: 'Entrada registrada' },
      { key: 'horaSalidaRegistrada', label: 'Salida registrada' },
    ],

    horarios: [
      { key: 'empleado', label: 'Empleado' },
      { key: 'cedula', label: 'Cédula' },
      { key: 'departamento', label: 'Departamento' },
      { key: 'cargo', label: 'Cargo' },
      { key: 'horaEntrada', label: 'Entrada' },
      { key: 'horaSalida', label: 'Salida' },
      { key: 'diasLaborales', label: 'Días laborales' },
    ],

    vacaciones: [
      { key: 'empleado', label: 'Empleado' },
      { key: 'cedula', label: 'Cédula' },
      { key: 'departamento', label: 'Departamento' },
      { key: 'cargo', label: 'Cargo' },
      { key: 'desde', label: 'Desde' },
      { key: 'hasta', label: 'Hasta' },
      { key: 'motivo', label: 'Motivo' },
    ],

    reposos: [
      { key: 'empleado', label: 'Empleado' },
      { key: 'cedula', label: 'Cédula' },
      { key: 'departamento', label: 'Departamento' },
      { key: 'cargo', label: 'Cargo' },
      { key: 'fechaInicio', label: 'Inicio' },
      { key: 'fechaFin', label: 'Fin' },
      { key: 'diagnostico', label: 'Diagnóstico' },
    ],

    permisos: [
      { key: 'empleado', label: 'Empleado' },
      { key: 'cedula', label: 'Cédula' },
      { key: 'departamento', label: 'Departamento' },
      { key: 'cargo', label: 'Cargo' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'motivo', label: 'Motivo' },
    ],
  };

  const columnasActuales = configuraciones[tipoReporte] || [];

  const formatearFecha = (valor) => {
    if (!valor) return '—';

    const texto = String(valor);
    const partes = texto.substring(0, 10).split('-');

    return partes.length === 3
      ? `${partes[2]}/${partes[1]}/${partes[0]}`
      : texto;
  };

  const formatearDias = (dias) => {
    if (!Array.isArray(dias) || dias.length === 0) return '—';

    const abreviaturas = {
      Lunes: 'Lun',
      Martes: 'Mar',
      Miércoles: 'Mié',
      Jueves: 'Jue',
      Viernes: 'Vie',
      Sábado: 'Sáb',
      Domingo: 'Dom',
    };

    return dias
      .map((dia) => abreviaturas[dia] || dia)
      .join(' · ');
  };

  const obtenerValor = (fila, key) => {
    if (!fila) return '—';

    const empleado = fila.empleado || {};

    switch (key) {
      case 'empleado':
        return (
          [empleado.nombre, empleado.apellido]
            .filter(Boolean)
            .join(' ') || '—'
        );

      case 'cedula':
        return empleado.cedula || '—';

      case 'departamento':
        return (
          empleado.departamento?.nombre ||
          fila.departamento?.nombre ||
          fila.departamento ||
          '—'
        );

      case 'cargo':
        return (
          empleado.cargo?.nombre ||
          fila.cargo?.nombre ||
          fila.cargo ||
          '—'
        );

      case 'fecha':
      case 'fechaInicio':
      case 'fechaFin':
      case 'desde':
      case 'hasta':
        return formatearFecha(fila[key]);

      case 'horaEntradaRegistrada': {
        const estadosEspeciales = [
          'Ausente',
          'Vacaciones',
          'Reposo',
          'Permiso',
        ];

        if (estadosEspeciales.includes(fila.estado)) {
          return (
            <span className="text-corporativo-boton font-medium text-xs">
              {fila.estado}
            </span>
          );
        }

        return fila.horaEntrada ? (
          <span className="text-corporativo-oscuro">{fila.horaEntrada}</span>
        ) : (
          <span className="text-corporativo-boton/60 font-medium text-xs">
            Pendiente
          </span>
        );
      }

      case 'horaSalidaRegistrada': {
        const estadosEspeciales = [
          'Ausente',
          'Vacaciones',
          'Reposo',
          'Permiso',
        ];

        if (estadosEspeciales.includes(fila.estado)) {
          return (
            <span className="text-corporativo-boton font-medium text-xs">
              {fila.estado}
            </span>
          );
        }

        if (fila.horaSalida || fila.estadoSalida) {
          return (
            <span className="text-corporativo-oscuro">
              {fila.horaSalida || fila.estadoSalida}
            </span>
          );
        }

        // Si ya viene evaluado desde el backend o si determinamos el estado por la hora de salida
        if (fila.estadoSalida === 'No registrada') {
          return (
            <span className="text-corporativo-boton/60 font-medium text-xs">
              No registrada
            </span>
          );
        }

        // Lógica de respaldo si el backend envía la hora límite de salida (ej. horario.horaSalida)
        const horaSalidaHorario = fila.horario?.horaSalida || empleado.horario?.horaSalida;
        if (horaSalidaHorario) {
          const [hSalida, mSalida] = horaSalidaHorario.split(':').map(Number);
          const ahora = new Date();
          const limiteSalida = new Date();
          limiteSalida.setHours(hSalida, mSalida, 0, 0);

          if (ahora > limiteSalida) {
            return (
              <span className="text-corporativo-boton/60 font-medium text-xs">
                No registrada
              </span>
            );
          }
        }

        return (
          <span className="text-corporativo-boton/60 font-medium text-xs">
            Pendiente
          </span>
        );
      }

      case 'horaEntrada':
      case 'horaSalida':
        return fila[key] || '—';

      case 'diasLaborales':
        return formatearDias(fila[key]);

      case 'motivo':
        if (!fila.motivo) {
          return (
            <span className="text-corporativo-boton/60 font-medium text-xs">
              Sin motivo
            </span>
          );
        }
        return fila.motivo;

      case 'tipo':
        return fila.tipo || '—';

      case 'diagnostico':
        if (!fila.diagnostico) {
          return (
            <span className="text-corporativo-boton/60 font-medium text-xs">
              Sin diagnóstico
            </span>
          );
        }
        return fila.diagnostico;

      default:
        return formatearValor(fila[key]);
    }
  };

  const iconoPDF = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0118 8.414V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const iconoExcel = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0118 8.414V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const iconoEstadistica = (
    <svg
      className="w-5 h-5 text-corporativo-principal"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
      />
    </svg>
  );

  const btnBaseClass =
    'rounded-2xl px-8 py-3.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5';

  return (
    <div>
      {/* Cabecera */}
      <div className="pb-4 border-b border-corporativo-borde flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-corporativo-oscuro">
            {obtenerTituloReporte()}
          </h2>

          <p className="mt-1 text-xs text-corporativo-boton">
            Vista previa de los resultados obtenidos desde el servidor.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={onExportarPDF}
            disabled={
              !puedeGenerarReporte ||
              exportandoPDF ||
              exportandoExcel
            }
            className={`${btnBaseClass} bg-corporativo-principal`}
          >
            {iconoPDF}
            <span>
              {exportandoPDF
                ? 'Generando PDF...'
                : 'Exportar PDF'}
            </span>
          </button>

          <button
            type="button"
            onClick={onExportarExcel}
            disabled={
              !puedeGenerarReporte ||
              exportandoPDF ||
              exportandoExcel
            }
            className={`${btnBaseClass} bg-corporativo-boton`}
          >
            {iconoExcel}
            <span>
              {exportandoExcel
                ? 'Generando Excel...'
                : 'Exportar Excel'}
            </span>
          </button>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-corporativo-borde">
          {Object.entries(resumen).map(([clave, valor]) => (
            <div
              key={clave}
              className="rounded-xl bg-corporativo-fondo border border-corporativo-borde p-4 shadow-2xs flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-corporativo-boton">
                  {clave}
                </p>

                <p className="mt-1 text-2xl font-bold text-corporativo-oscuro">
                  {formatearValor(valor)}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-corporativo-borde shadow-2xs">
                {iconoEstadistica}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto pt-4">
        {loadingReporte ? (
          <div className="p-12 text-center">
            <div className="text-sm font-semibold text-corporativo-oscuro">
              Generando reporte...
            </div>

            <div className="mt-1 text-xs text-corporativo-boton">
              Consultando información en el servidor.
            </div>
          </div>
        ) : !Array.isArray(reporte) || reporte.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-3 text-corporativo-boton/60">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0118 8.414V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h3 className="text-sm font-bold text-corporativo-oscuro">
              No hay datos para mostrar
            </h3>

            <p className="mt-1 text-xs text-corporativo-boton">
              Seleccione un tipo de reporte y defina al menos un filtro para generar una vista previa.
            </p>
          </div>
        ) : (
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-corporativo-fondo text-center text-xs font-bold uppercase tracking-wider text-corporativo-principal">
                {columnasActuales.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3.5 border-b border-corporativo-borde whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-corporativo-borde">
              {reporte.map((fila, index) => (
                <tr
                  key={`${fila.id || fila._id || 'fila'}-${index}`}
                  className="hover:bg-corporativo-fondo/50 transition-colors"
                >
                  {columnasActuales.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-corporativo-oscuro font-medium whitespace-nowrap text-center"
                    >
                      {obtenerValor(fila, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}