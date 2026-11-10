export default function ExpedienteGeneral({ empleado }) {

  const esActivo =
    empleado.estado === true ||
    empleado.estado === 'Activo' ||
    empleado.estado === 1 ||
    !empleado.estado;

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';

    const fechaFormateada = new Date(fecha);

    if (Number.isNaN(fechaFormateada.getTime())) {
      return '—';
    }

    return fechaFormateada.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const Campo = ({ etiqueta, valor }) => (
    <div className="space-y-0.5">
      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-corporativo-claro2">
        {etiqueta}
      </p>
      <p className="text-xs sm:text-sm font-semibold text-corporativo-oscuro break-words">
        {valor || '—'}
      </p>
    </div>
  );

  return (
    <div className="w-full space-y-6">

      {/* Estructura de 3 columnas sin cuadro envolvente exterior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Columna 1: Información personal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-corporativo-borde/60">
            <svg className="w-4 h-4 text-corporativo-principal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xs sm:text-sm font-bold text-corporativo-oscuro uppercase tracking-wider">
              Información personal
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            <Campo etiqueta="Nombre" valor={empleado.nombre} />
            <Campo etiqueta="Apellido" valor={empleado.apellido} />
            <Campo etiqueta="Cédula" valor={empleado.cedula} />
            <Campo etiqueta="Sexo" valor={empleado.sexo} />
            <Campo etiqueta="Fecha de nacimiento" valor={formatearFecha(empleado.fechaNacimiento)} />
          </div>
        </div>

        {/* Columna 2: Información laboral */}
        <div className="space-y-4 md:border-l md:border-corporativo-borde/60 md:pl-6">
          <div className="flex items-center gap-2 pb-2 border-b border-corporativo-borde/60">
            <svg className="w-4 h-4 text-corporativo-principal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xs sm:text-sm font-bold text-corporativo-oscuro uppercase tracking-wider">
              Información laboral
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            <Campo etiqueta="Departamento" valor={empleado.departamento?.nombre || empleado.departamento} />
            <Campo etiqueta="Cargo" valor={empleado.cargo?.nombre || empleado.cargo} />
            
            <div className="space-y-0.5">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-corporativo-claro2">
                Estado
              </p>
              <div className="pt-0.5">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                    esActivo
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                      esActivo ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {esActivo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <Campo etiqueta="Fecha de ingreso" valor={formatearFecha(empleado.fechaIngreso)} />
          </div>
        </div>

        {/* Columna 3: Información de contacto */}
        <div className="space-y-4 md:border-l md:border-corporativo-borde/60 md:pl-6">
          <div className="flex items-center gap-2 pb-2 border-b border-corporativo-borde/60">
            <svg className="w-4 h-4 text-corporativo-principal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <h3 className="text-xs sm:text-sm font-bold text-corporativo-oscuro uppercase tracking-wider">
              Información de contacto
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            <Campo etiqueta="Teléfono" valor={empleado.telefono} />
            <Campo etiqueta="Correo electrónico" valor={empleado.correo} />
            <Campo etiqueta="Dirección de habitación" valor={empleado.direccion} />
          </div>
        </div>

      </div>

    </div>
  );
}