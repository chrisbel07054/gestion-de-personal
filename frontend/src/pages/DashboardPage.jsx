import LayoutRRHH from '../layouts/LayoutRRHH.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import AsistenciaDepartamentoChart from '../components/dashboard/AsistenciaDepartamentoChart.jsx';
import IncidenciasDepartamentoChart from '../components/dashboard/IncidenciasDepartamentoChart.jsx';
import ReincorporacionesList from '../components/dashboard/ReincorporacionesList.jsx';
import useDashboard from '../hooks/useDashboard.js';

export default function DashboardPage() {
  const {
    metrics,
    asistenciaDepartamento,
    topRetardos,
    reincorporaciones,
    loading,
    userName,
  } = useDashboard();

  return (
    <LayoutRRHH>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6">
        {/* Cabecera Principal */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 min-w-0">
              <img src={logoInstitucion} alt="Logo Institución" className="h-14 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight leading-tight">
                  Dashboard General
                </h1>
                <div className="hidden sm:flex mt-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-corporativo-boton">
                  <span>Panel general de monitoreo operativo y novedades del día.</span>
                </div>
              </div>
            </div>
            <div className="sm:hidden mt-1 text-sm text-corporativo-boton leading-relaxed">
              Panel general de monitoreo operativo y novedades del día.
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro">
              RRHH
            </div>
          </div>
        </div>

        {/* Cargando */}
        {loading ? (
          <div className="rounded-3xl bg-corporativo-fondo p-12 text-center text-corporativo-oscuro font-medium">
            Cargando información del sistema...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Métricas Generales */}
            <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
              <div className="col-span-2 xl:col-span-1">
                <MetricCard title="Total empleados" value={metrics?.totalEmpleados ?? 0} subtitle="Personal registrado" variante="empleados" />
              </div>
              <MetricCard title="Presentes hoy" value={metrics?.presentesHoy ?? 0} subtitle="Personal activo hoy" variante="presentes" />
              <MetricCard title="Ausentes hoy" value={metrics?.ausentesHoy ?? 0} subtitle="Sin asistencia registrada" variante="ausentes" />
              <MetricCard title="Retardos" value={metrics?.retardosHoy ?? 0} subtitle="Llegada con retraso" variante="retardos" />
              <MetricCard title="Tarde" value={metrics?.tardeHoy ?? 0} subtitle="Ingreso fuera de tiempo" variante="tarde" />
            </section>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AsistenciaDepartamentoChart data={asistenciaDepartamento} />
              <IncidenciasDepartamentoChart data={topRetardos} />
            </div>

            {/* Novedades + Reincorporaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Novedades */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-corporativo-borde p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-corporativo-oscuro">
                    Novedades y permisos activos
                  </h2>
                  <p className="mt-1 text-sm text-corporativo-boton">
                    Resumen de las novedades vigentes del personal.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Vacaciones */}
                  <div className="flex items-center justify-between rounded-2xl border border-corporativo-borde bg-corporativo-fondo/40 px-4 py-2.5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-corporativo-oscuro">Vacaciones</p>
                      <p className="mt-0.5 text-xs text-corporativo-boton">Período vacacional</p>
                    </div>
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-2 text-sm font-bold text-blue-700">
                      {metrics?.vacacionesActivas ?? 0}
                    </span>
                  </div>

                  {/* Reposos */}
                  <div className="flex items-center justify-between rounded-2xl border border-corporativo-borde bg-corporativo-fondo/40 px-4 py-2.5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-corporativo-oscuro">Reposos</p>
                      <p className="mt-0.5 text-xs text-corporativo-boton">Justificación médica</p>
                    </div>
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-2 text-sm font-bold text-violet-700">
                      {metrics?.repososActivos ?? 0}
                    </span>
                  </div>

                  {/* Permisos */}
                  <div className="flex items-center justify-between rounded-2xl border border-corporativo-borde bg-corporativo-fondo/40 px-4 py-2.5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-corporativo-oscuro">Permisos</p>
                      <p className="mt-0.5 text-xs text-corporativo-boton">Autorizados</p>
                    </div>
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 px-2 text-sm font-bold text-cyan-700">
                      {metrics?.permisosActivos ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Próximas Reincorporaciones */}
              <div className="lg:col-span-8 h-full">
                <ReincorporacionesList data={reincorporaciones} />
              </div>
            </div>
          </div>
        )}
      </section>
    </LayoutRRHH>
  );
}