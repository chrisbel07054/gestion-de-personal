import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import LayoutRRHH from '../layouts/LayoutRRHH.jsx';
import EstadoBadge from '../components/comunes/EstadoBadge.jsx';
import SelectPersonalizado from '../components/comunes/SelectPersonalizado.jsx';
import FiltrosEstadisticas from '../components/estadisticas/FiltrosEstadisticas.jsx';
import GraficosEstadisticas from '../components/estadisticas/GraficosEstadisticas.jsx';
import useEstadisticas from '../hooks/useEstadisticas.js';
import IVSS from '../assets/IVSS.svg';

function TablaHistorial({ historial }) {
  const [limite, setLimite] = useState(10);
  const [pagina, setPagina] = useState(1);

  const opcionesLimite = [
    { id: '10', nombre: '10' },
    { id: '20', nombre: '20' },
    { id: '50', nombre: '50' },
  ];

  const totalRegistros = historial.length;

  const totalPaginas = Math.max(
    1,
    Math.ceil(totalRegistros / limite)
  );

  useEffect(() => {
    setPagina(1);
  }, [historial, limite]);

  const historialPaginado = useMemo(() => {
    const inicio = (pagina - 1) * limite;
    return historial.slice(inicio, inicio + limite);
  }, [historial, pagina, limite]);

  const formatearFecha = (fecha) =>
    fecha
      ? String(fecha).slice(0, 10).split('-').reverse().join('/')
      : '—';

  const formatearHora = (hora) => {
    if (!hora) return null;
    const valor = String(hora);
    return (
      valor.match(/^\d{2}:\d{2}/)?.[0] ||
      valor.match(/T(\d{2}:\d{2})/)?.[1] ||
      valor
    );
  };

  // Función para determinar el estado de la salida
  const renderizarSalida = (registro) => {
    const horaSalidaCruda = registro.salida || registro.horaSalida;
    const horaFormateada = formatearHora(horaSalidaCruda);

    if (horaFormateada) {
      return <span className="text-corporativo-oscuro">{horaFormateada}</span>;
    }

    const fechaRegistro = String(registro.fecha).slice(0, 10);
    const hoyStr = new Date().toISOString().slice(0, 10);
    const horaFinHorario = registro.horario?.salida || registro.horario?.horaSalida;

    let jornadaFinalizada = false;
    if (fechaRegistro < hoyStr) {
      jornadaFinalizada = true;
    } else if (fechaRegistro === hoyStr && horaFinHorario) {
      const ahora = new Date();
      const [horaFin, minFin] = horaFinHorario.split(':').map(Number);
      const fechaFinTurno = new Date();
      fechaFinTurno.setHours(horaFin || 0, minFin || 0, 0, 0);
      if (ahora > fechaFinTurno) {
        jornadaFinalizada = true;
      }
    }

    if (jornadaFinalizada) {
      return (
        <span className="font-normal text-corporativo-oscuro">
          No registrada
        </span>
      );
    }

    return (
      <span className="italic font-medium text-corporativo-boton">
        Pendiente
      </span>
    );
  };

  const renderizarEntrada = (registro) => {
    const horaEntradaCruda = registro.entrada || registro.horaEntrada;
    const horaFormateada = formatearHora(horaEntradaCruda);

    if (horaFormateada) {
      return <span className="text-corporativo-oscuro">{horaFormateada}</span>;
    }

    const fechaRegistro = String(registro.fecha).slice(0, 10);
    const hoyStr = new Date().toISOString().slice(0, 10);
    const horaInicioHorario = registro.horario?.entrada || registro.horario?.horaEntrada;

    let jornadaFinalizada = false;
    if (fechaRegistro < hoyStr) {
      jornadaFinalizada = true;
    } else if (fechaRegistro === hoyStr && horaInicioHorario) {
      const ahora = new Date();
      const [horaInicio, minInicio] = horaInicioHorario.split(':').map(Number);
      const fechaInicioTurno = new Date();
      fechaInicioTurno.setHours(horaInicio || 0, minInicio || 0, 0, 0);
      if (ahora > fechaInicioTurno) {
        jornadaFinalizada = true;
      }
    }

    if (jornadaFinalizada) {
      return (
        <span className="font-normal text-corporativo-oscuro">
          No registrada
        </span>
      );
    }

    return (
      <span className="italic font-medium text-corporativo-boton">
        Pendiente
      </span>
    );
  };

  return (
    <section className="space-y-4 rounded-3xl border border-corporativo-borde bg-white p-4 shadow-sm sm:p-6">
      {/* Encabezado con título y selector de Mostrar */}
      <div className="flex flex-col gap-3 border-b border-corporativo-borde pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-corporativo-oscuro">
            Historial de asistencia
          </h2>

          <p className="mt-0.5 text-xs text-corporativo-boton">
            Detalle individual de los registros evaluados.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-corporativo-oscuro self-start sm:self-auto">
          <label className="text-xs font-bold uppercase tracking-wider text-corporativo-boton">
            Mostrar:
          </label>

          <SelectPersonalizado
            value={String(limite)}
            onChange={(valor) => {
              if (valor) setLimite(Number(valor));
            }}
            options={opcionesLimite}
            className="w-16"
            mostrarOpcionVacia={false}
          />
        </div>
      </div>

      {/* Tabla de historial */}
      <div className="overflow-x-auto">
        {!totalRegistros ? (
          <div className="p-12 text-center text-xs text-corporativo-boton">
            No hay registros para mostrar.
          </div>
        ) : (
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-corporativo-fondo text-center text-xs font-bold uppercase tracking-wider text-corporativo-principal">
                {[
                  'Fecha',
                  'Empleado',
                  'Departamento',
                  'Horario',
                  'Entrada',
                  'Salida',
                  'Estado',
                ].map((titulo) => (
                  <th
                    key={titulo}
                    className="border-b border-corporativo-borde px-4 py-3.5"
                  >
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-corporativo-borde text-sm">
              {historialPaginado.map((registro, indice) => (
                <tr
                  key={`${registro.empleadoId}-${registro.fecha}-${indice}`}
                  className="transition-colors hover:bg-corporativo-fondo/50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-center text-corporativo-oscuro">
                    {formatearFecha(registro.fecha)}
                  </td>

                  <td className="px-4 py-3 text-center font-medium text-corporativo-oscuro">
                    {registro.empleado || '—'}
                  </td>

                  <td className="px-4 py-3 text-center text-corporativo-oscuro">
                    {registro.departamento || '—'}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-center text-corporativo-oscuro">
                    {formatearHora(
                      registro.horario?.entrada ||
                      registro.horario?.horaEntrada
                    ) || '—'}{' '}
                    –{' '}
                    {formatearHora(
                      registro.horario?.salida ||
                      registro.horario?.horaSalida
                    ) || '—'}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {renderizarEntrada(registro)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {renderizarSalida(registro)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <EstadoBadge estado={registro.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalRegistros > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-corporativo-borde pt-4 sm:flex-row">
          <div className="text-sm font-medium text-corporativo-boton">
            Total de registros: {totalRegistros}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="cursor-pointer rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro transition-colors hover:bg-corporativo-fondo disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pagina === 1}
              onClick={() =>
                setPagina((actual) => Math.max(1, actual - 1))
              }
            >
              Anterior
            </button>

            <span className="whitespace-nowrap text-sm font-semibold text-corporativo-oscuro">
              Página {pagina} de {totalPaginas}
            </span>

            <button
              type="button"
              className="cursor-pointer rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro transition-colors hover:bg-corporativo-fondo disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pagina === totalPaginas}
              onClick={() =>
                setPagina((actual) =>
                  Math.min(totalPaginas, actual + 1)
                )
              }
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function EstadisticasPage() {
  const {
    filtros,
    actualizarFiltro,
    aplicarFiltros,
    limpiarFiltros,
    empleadosEncontrados,
    empleadoSeleccionado,
    departamentos,
    estadisticas,
    resumen,
    historial,
    datosDistribucion,
    datosEvolucion,
    cargandoCatalogos,
    cargando,
  } = useEstadisticas();

  return (
    <LayoutRRHH>
      <section className="w-full space-y-4 px-3 pb-6 pt-3 sm:px-6">
        <header className="mb-4 flex flex-col gap-4 rounded-3xl border border-corporativo-borde bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={IVSS}
              alt="Logo institucional"
              className="h-14 w-auto shrink-0 object-contain"
            />

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-corporativo-oscuro sm:text-4xl">
                Estadísticas
              </h1>

              <p className="mt-1 text-sm text-corporativo-boton">
                Análisis de asistencia e incidencias del personal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={aplicarFiltros}
              disabled={cargando}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-corporativo-principal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={cargando ? 'animate-spin' : ''}
              />
              <span>Actualizar datos</span>
            </button>

            <div className="rounded-xl border border-corporativo-borde bg-corporativo-fondo px-3.5 py-2 text-xs font-bold text-corporativo-oscuro shadow-sm">
              RRHH
            </div>
          </div>
        </header>

        <FiltrosEstadisticas
          filtros={filtros}
          actualizarFiltro={actualizarFiltro}
          aplicarFiltros={aplicarFiltros}
          limpiarFiltros={limpiarFiltros}
          empleadosEncontrados={empleadosEncontrados}
          empleadoSeleccionado={empleadoSeleccionado}
          departamentos={departamentos}
          cargandoCatalogos={cargandoCatalogos}
          cargando={cargando}
        />

        {cargando && !estadisticas ? (
          <div className="rounded-3xl border border-corporativo-borde bg-white p-12 text-center text-corporativo-boton shadow-sm">
            <RefreshCw
              size={25}
              className="mx-auto mb-3 animate-spin text-corporativo-principal"
            />
            Cargando estadísticas...
          </div>
        ) : (
          <>
            <GraficosEstadisticas
              evolucion={datosEvolucion}
              distribucion={datosDistribucion}
            />

            <TablaHistorial historial={historial} />
          </>
        )}
      </section>
    </LayoutRRHH>
  );
}