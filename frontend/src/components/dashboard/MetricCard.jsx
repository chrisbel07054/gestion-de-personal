import {
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  BarChart3,
  Building2,
  BriefcaseBusiness,
  ClipboardList,
} from 'lucide-react';

const variantesEstilos = {
  empleados: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-corporativo-claro1/50 text-corporativo-principal',
    icono: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  presentes: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-emerald-50 text-emerald-700',
    icono: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  ausentes: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-corporativo-fondo text-slate-700',
    icono: <UserX className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  retardos: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-amber-50 text-amber-700',
    icono: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  tarde: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-rose-50 text-rose-700',
    icono: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  departamentos: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-blue-50 text-blue-700',
    icono: <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  cargos: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-violet-50 text-violet-700',
    icono: <BriefcaseBusiness className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  usuarios: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-cyan-50 text-cyan-700',
    icono: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  auditoria: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-amber-50 text-amber-700',
    icono: <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  default: {
    titulo: 'text-corporativo-oscuro font-bold',
    iconoBg: 'bg-corporativo-claro1/50 text-corporativo-boton',
    icono: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  variante = 'default',
}) {
  const estiloActual = variantesEstilos[variante] || variantesEstilos.default;

  return (
    <article className="relative rounded-2xl border border-corporativo-borde bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-corporativo-principal/60">
      <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Bloque Izquierdo */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className={`text-xs font-semibold uppercase tracking-[0.12em] ${estiloActual.titulo} leading-snug whitespace-nowrap`}>
            {title}
          </div>

          <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-corporativo-oscuro">
            {value}
          </div>

          {subtitle && (
            <div className="mt-1 text-xs font-medium text-slate-500 leading-snug whitespace-nowrap">
              {subtitle}
            </div>
          )}
        </div>

        {/* Bloque Derecho */}
        <div className={`p-2.5 sm:p-3.5 rounded-2xl flex items-center justify-center shrink-0 ${estiloActual.iconoBg}`}>
          {estiloActual.icono}
        </div>
      </div>
    </article>
  );
}