import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Palmtree,
  Stethoscope,
  FileText,
  HelpCircle
} from 'lucide-react';

const CONFIG_ESTADOS = {
  Puntual: {
    estilo: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-xs',
    icono: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
  },
  Retardo: {
    estilo: 'bg-amber-50 text-amber-700 border-amber-200/60 shadow-xs',
    icono: <Clock className="w-3.5 h-3.5 shrink-0" />
  },
  Tarde: {
    estilo: 'bg-rose-50 text-rose-700 border-rose-200/60 shadow-xs',
    icono: <AlertCircle className="w-3.5 h-3.5 shrink-0" />
  },
  Ausente: {
    estilo: 'bg-slate-50 text-slate-700 border-slate-200 shadow-xs',
    icono: <XCircle className="w-3.5 h-3.5 shrink-0" />
  },
  Vacaciones: {
    estilo: 'bg-blue-50 text-blue-700 border-blue-200/60 shadow-xs',
    icono: <Palmtree className="w-3.5 h-3.5 shrink-0" />
  },
  Reposo: {
    estilo: 'bg-violet-50 text-violet-700 border-violet-200/60 shadow-xs',
    icono: <Stethoscope className="w-3.5 h-3.5 shrink-0" />
  },
  Permiso: {
    estilo: 'bg-cyan-50 text-cyan-700 border-cyan-200/60 shadow-xs',
    icono: <FileText className="w-3.5 h-3.5 shrink-0" />
  }
};

const DEFAULT_CONFIG = {
  estilo: 'bg-slate-50 text-slate-700 border-slate-200 shadow-xs',
  icono: <HelpCircle className="w-3.5 h-3.5 shrink-0" />
};

export default function EstadoBadge({ estado }) {
  // Normaliza claves como "Reposo médico" a "Reposo" para unificar estilos automáticamente
  const clave = estado ? estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase() : '';
  const match = clave.includes('Reposo') ? 'Reposo' : clave;
  const { estilo, icono } = CONFIG_ESTADOS[match] || DEFAULT_CONFIG;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${estilo}`}>
      <span>{icono}</span>
      <span>{estado || '—'}</span>
    </span>
  );
}