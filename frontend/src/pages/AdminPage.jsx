import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, AlertCircle } from 'lucide-react';
import LayoutAdministrador from '../layouts/LayoutAdministrador.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import { useAuthStore } from '../store/authStore.js';
import useAdmin from '../hooks/useAdmin.js';

export default function AdminPage() {
  const { usuario } = useAuthStore();
  const { departamentos, cargos, usuariosList, auditoriaList, totalAuditoria, loading} = useAdmin();

  const nombreUsuario = usuario?.usuario || usuario?.nombre || 'Administrador';
  const auditoriaReciente = auditoriaList.slice(0, 5);

  return (
    <LayoutAdministrador>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6">
        {/* Cabecera Principal */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 min-w-0">
              <img src={logoInstitucion} alt="Logo Institución" className="h-14 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight leading-tight">
                  Panel de Administración
                </h1>
                <div className="hidden sm:flex mt-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-corporativo-boton">
                  <span>Panel general de configuración y supervisión administrativa del sistema.</span>
                </div>
              </div>
            </div>
            <div className="sm:hidden mt-1 text-sm text-corporativo-boton leading-relaxed">
              Panel general de configuración y supervisión administrativa del sistema.
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro whitespace-nowrap">
              {nombreUsuario}
            </div>
          </div>
        </div>

        {/* Contenido Dinámico (Cargando / Error / Listado) */}
        {loading ? (
          <div className="rounded-3xl bg-corporativo-fondo p-8 sm:p-12 text-center text-corporativo-oscuro font-medium">
            Cargando información del sistema...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Métricas Administrativas */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard title="Departamentos" value={departamentos.length} subtitle="Áreas registradas" variante="departamentos" />
              <MetricCard title="Cargos" value={cargos.length} subtitle="Puestos registrados" variante="cargos" />
              <MetricCard title="Usuarios" value={usuariosList.length} subtitle="Cuentas del sistema" variante="usuarios" />
              <MetricCard title="Auditoría" value={totalAuditoria} subtitle="Registros en bitácora" variante="auditoria" />
            </section>

            {/* Actividad Reciente */}
            <article className="bg-white rounded-3xl border border-corporativo-borde p-4 sm:p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-corporativo-oscuro">Actividad reciente</h2>
                <p className="mt-1 text-sm text-corporativo-boton leading-relaxed">Últimos eventos registrados en la bitácora del sistema.</p>
              </div>

              {auditoriaReciente.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-corporativo-borde bg-corporativo-fondo/40 p-6 sm:p-8 text-center text-sm text-corporativo-boton">
                  No hay actividad registrada.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {auditoriaReciente.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-corporativo-borde/40 bg-corporativo-fondo/40 px-3 sm:px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-corporativo-borde/40 text-corporativo-principal">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-corporativo-oscuro truncate">
                          {item.accion || 'Actividad registrada'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-corporativo-boton truncate">
                          {item.entidad || 'Sistema'} {' · '} {item.usuario?.usuario || item.usuario || 'Sistema'}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium text-corporativo-boton">
                        {item.fecha ? new Date(item.fecha).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-corporativo-borde/40 pt-4 mt-5 flex justify-center">
                <Link
                  to="/admin/auditoria"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-corporativo-boton hover:text-corporativo-principal transition-colors text-center"
                >
                  Ver auditoría completa
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </Link>
              </div>
            </article>
          </div>
        )}
      </section>
    </LayoutAdministrador>
  );
}