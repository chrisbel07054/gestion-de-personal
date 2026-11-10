import { useState, useRef, useEffect } from 'react';

const horas = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1).padStart(2, '0'),
  nombre: String(i + 1).padStart(2, '0'),
}));

const minutos = Array.from({ length: 60 }, (_, i) => ({
  id: String(i).padStart(2, '0'),
  nombre: String(i).padStart(2, '0'),
}));

const periodos = [
  { id: 'AM', nombre: 'AM' },
  { id: 'PM', nombre: 'PM' }
];

const obtenerPartesHora = (hora) => {
  if (!hora) return { hora: '', minuto: '', periodo: '' };
  const partes = String(hora).split(':');
  if (partes.length < 2) return { hora: '', minuto: '', periodo: '' };

  const hora24 = Number(partes[0]);
  const minuto = partes[1];
  if (Number.isNaN(hora24)) return { hora: '', minuto: '', periodo: '' };

  const periodo = hora24 >= 12 ? 'PM' : 'AM';
  let hora12 = hora24 % 12;
  if (hora12 === 0) hora12 = 12;

  return {
    hora: String(hora12).padStart(2, '0'),
    minuto: String(minuto).padStart(2, '0'),
    periodo,
  };
};

const convertirAHora24 = (hora12, minuto, periodo) => {
  let hora = Number(hora12);
  if (periodo === 'AM') {
    if (hora === 12) hora = 0;
  } else {
    if (hora !== 12) hora += 12;
  }
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
};

export default function SelectPersonalizado({
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  iconSVG,
  className = '',
  variant = 'light',
  disabled = false,
  mostrarOpcionVacia = true,
  tipo = 'select',
}) {
  const [abierto, setAbierto] = useState(false);
  const containerRef = useRef(null);

  const esOscuro = variant === 'dark';
  const esHora = tipo === 'hora';

  // --- CERRAR AL HACER CLIC FUERA ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- OBTENER TEXTO A MOSTRAR ---
  let textoSeleccionado = placeholder;
  let tieneValor = Boolean(value);

  if (esHora) {
    const partes = obtenerPartesHora(value);
    if (partes.hora && partes.minuto && partes.periodo) {
      textoSeleccionado = `${partes.hora}:${partes.minuto} ${partes.periodo}`;
    }
  } else {
    const opcionActual = options.find((opt) => String(opt.id) === String(value));
    if (opcionActual) {
      textoSeleccionado = opcionActual.nombre;
    } else {
      tieneValor = false;
    }
  }

  // Clases compartidas para los botones internos de opciones
  const getBtnClases = (seleccionado) => `
    w-full rounded-lg px-2 py-2 text-sm text-center transition-colors cursor-pointer
    ${esOscuro
      ? seleccionado ? 'bg-slate-700/70 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      : seleccionado ? 'bg-corporativo-fondo/70 text-corporativo-principal font-semibold' : 'text-corporativo-oscuro hover:bg-corporativo-fondo'
    }
  `;

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      {/* ICONO IZQUIERDO */}
      {iconSVG && (
        <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 ${esOscuro ? 'text-corporativo-boton/70' : 'text-corporativo-boton/60'}`}>
          {iconSVG}
        </span>
      )}

      {/* BOTÓN PRINCIPAL */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setAbierto(!abierto)}
        className={`w-full rounded-xl border ${iconSVG ? 'pl-10' : 'pl-3'} pr-8 py-2.5 text-sm text-left outline-none transition-all truncate relative ${
          esOscuro 
            ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-750 focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30' 
            : 'border-corporativo-borde/60 bg-white text-corporativo-oscuro focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-sm'}`}
      >
        <span className={`truncate block ${!tieneValor ? (esOscuro ? 'text-slate-500' : 'text-corporativo-oscuro/60') : ''}`}>
          {textoSeleccionado}
        </span>
        <span className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${esOscuro ? 'text-corporativo-boton/70' : 'text-corporativo-boton/60'}`}>
          <svg className={`w-4 h-4 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* MENÚ DESPLEGABLE */}
      {abierto && !disabled && (
        <div className={`absolute z-[100] top-full left-0 right-0 mt-1 rounded-xl border shadow-lg overflow-hidden ${esOscuro ? 'border-slate-700 bg-slate-800' : 'border-corporativo-borde bg-white'}`}>
          
          {/* --- CASO HORA --- */}
          {esHora ? (() => {
            const partes = obtenerPartesHora(value);
            return (
              <>
                <div className={`grid grid-cols-3 border-b px-2 py-2 text-[11px] font-semibold uppercase tracking-wide ${esOscuro ? 'border-slate-700 text-slate-500' : 'border-corporativo-borde/60 text-corporativo-boton'}`}>
                  <span className="text-center">Hora</span>
                  <span className="text-center">Minutos</span>
                  <span className="text-center">Periodo</span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-2">
                  <div className="max-h-48 overflow-y-auto rounded-lg">
                    {horas.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onChange(convertirAHora24(item.id, partes.minuto || '00', partes.periodo || 'AM'))}
                        className={getBtnClases(item.id === partes.hora)}
                      >
                        {item.nombre}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-lg">
                    {minutos.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onChange(convertirAHora24(partes.hora || '12', item.id, partes.periodo || 'AM'))}
                        className={getBtnClases(item.id === partes.minuto)}
                      >
                        {item.nombre}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    {periodos.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onChange(convertirAHora24(partes.hora || '12', partes.minuto || '00', item.id))}
                        className={getBtnClases(item.id === partes.periodo)}
                      >
                        {item.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            );
          })() : (
            /* --- CASO SELECT NORMAL --- */
            <div className="max-h-60 overflow-y-auto py-1">
              {mostrarOpcionVacia && (
                <button
                  type="button"
                  onClick={() => { onChange(''); setAbierto(false); }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    esOscuro
                      ? (!value ? 'font-semibold text-white bg-slate-700/70' : 'text-slate-300 hover:bg-slate-700')
                      : (!value ? 'font-semibold text-corporativo-principal bg-corporativo-fondo/50' : 'text-corporativo-oscuro hover:bg-corporativo-fondo')
                  }`}
                >
                  {placeholder}
                </button>
              )}

              {options.map((opt) => {
                const esSeleccionado = String(opt.id) === String(value);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { onChange(String(opt.id)); setAbierto(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                      esOscuro
                        ? (esSeleccionado ? 'font-semibold text-white bg-slate-700/70' : 'text-slate-300 hover:bg-slate-700')
                        : (esSeleccionado ? 'font-semibold text-corporativo-principal bg-corporativo-fondo/50' : 'text-corporativo-oscuro hover:bg-corporativo-fondo')
                    }`}
                  >
                    {opt.nombre}
                  </button>
                );
              })}

              {options.length === 0 && (
                <div className={`px-4 py-3 text-sm ${esOscuro ? 'text-slate-500' : 'text-corporativo-boton'}`}>
                  No hay opciones disponibles.
                </div>
              )}
            </div>
          )}

          {/* OPCIÓN VACÍA PARA HORA (SI APLICA) */}
          {esHora && mostrarOpcionVacia && (
            <div className={`border-t p-2 ${esOscuro ? 'border-slate-700' : 'border-corporativo-borde/60'}`}>
              <button
                type="button"
                onClick={() => { onChange(''); setAbierto(false); }}
                className={`w-full rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer text-center ${
                  esOscuro ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-corporativo-oscuro hover:bg-corporativo-fondo'
                }`}
              >
                {placeholder}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}