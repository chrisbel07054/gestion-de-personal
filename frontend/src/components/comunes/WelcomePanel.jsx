import { useEffect, useState } from 'react';
import {
  Building2,
  Briefcase,
  Users,
  ClipboardList,
  Clock,
  CalendarCheck,
  BarChart3,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

const DURACION_MS = 6000;

const CONTENIDO = {
  ADMINISTRADOR: {
    etiqueta: 'Administrador',
    texto: 'Gestione departamentos, cargos, usuarios y auditoría del sistema.',
    accesos: [
      [Building2, 'Departamentos'],
      [Briefcase, 'Cargos'],
      [Users, 'Usuarios'],
      [ClipboardList, 'Auditoría'],
    ],
  },
  RRHH: {
    etiqueta: 'Recursos Humanos',
    texto: 'Controle empleados, horarios, asistencia y reportes del personal.',
    accesos: [
      [Users, 'Empleados'],
      [Clock, 'Horarios'],
      [CalendarCheck, 'Asistencia'],
      [BarChart3, 'Reportes'],
    ],
  },
  OPERADOR: {
    etiqueta: 'Operador de registro',
    texto: 'Registre las entradas y salidas del personal.',
    accesos: [
      [LogIn, 'Registrar entrada'],
      [LogOut, 'Registrar salida'],
    ],
  },
};

const leerBandera = () => {
  try {
    return localStorage.getItem('showWelcome') === 'true';
  } catch {
    return false;
  }
};

export default function WelcomePanel() {
  const usuario = useAuthStore((s) => s.usuario);
  const rol = useAuthStore((s) => s.rol);
  const [visible, setVisible] = useState(leerBandera);
  const [corriendo, setCorriendo] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;

    try {
      localStorage.removeItem('showWelcome');
    } catch {
      // ignorar
    }

    const inicio = setTimeout(() => setCorriendo(true), 50);
    const cierre = setTimeout(() => setVisible(false), DURACION_MS);

    return () => {
      clearTimeout(inicio);
      clearTimeout(cierre);
    };
  }, [visible]);

  if (!visible) return null;

  const datos = CONTENIDO[rol] || CONTENIDO.OPERADOR;
  const nombre = typeof usuario === 'string' ? usuario : usuario?.usuario || 'usuario';
  const fecha = new Date().toLocaleDateString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-corporativo-oscuro/60 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        <div className="bg-corporativo-oscuro px-6 pt-6 pb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-corporativo-claro1">
            Sesión iniciada
          </p>
        </div>

        <div className="-mt-6 px-6 pb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-corporativo-boton text-lg font-bold text-white">
            {nombre.slice(0, 2).toUpperCase()}
          </div>

          <h2 className="mt-3 text-2xl font-bold text-corporativo-oscuro">
            Bienvenido, {nombre}
          </h2>
          <span className="mt-2 inline-block rounded-full bg-corporativo-claro1 px-3 py-1 text-xs font-semibold text-corporativo-principal">
            {datos.etiqueta}
          </span>
          <p className="mt-3 text-sm text-corporativo-boton">{datos.texto}</p>
          <p className="mt-1 text-xs capitalize text-slate-500">{fecha}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-left">
            {datos.accesos.map(([Icono, texto]) => (
              <div
                key={texto}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-corporativo-oscuro"
              >
                <Icono className="h-5 w-5 shrink-0 text-corporativo-boton" />
                {texto}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="mt-4 w-full cursor-pointer rounded-xl bg-corporativo-boton py-2.5 text-sm font-semibold text-white transition-all hover:bg-corporativo-principal"
          >
            Entrar al panel
          </button>

          <div className="mt-3 h-1 overflow-hidden rounded bg-slate-200">
            <div
              className="h-1 bg-corporativo-boton"
              style={{
                width: corriendo ? '0%' : '100%',
                transition: `width ${DURACION_MS}ms linear`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

