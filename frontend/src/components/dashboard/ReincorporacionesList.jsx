import EstadoBadge from '../comunes/EstadoBadge.jsx';

function formatFecha(fecha) {
  if (!fecha) return '';
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function ReincorporacionesList({ data = [] }) {
  const reincorporacionesVisibles = data.slice(0, 4);
  const totalReincorporaciones = data.length;
  const hayMasRegistros = totalReincorporaciones > 4;

  return (
    <article className="bg-white p-6 rounded-3xl border border-corporativo-borde shadow-sm h-full flex flex-col">
      {/* Encabezado */}
      <div className="mb-4 sm:mb-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-corporativo-oscuro">
              Próximas reincorporaciones
            </h2>
            <p className="hidden sm:block mt-1 text-sm text-corporativo-boton leading-relaxed">
              Personal que debe regresar durante los próximos 7 días.
            </p>
          </div>

          {totalReincorporaciones > 0 && (
            <span className="shrink-0 min-w-8 h-8 px-2.5 rounded-xl bg-corporativo-fondo border border-corporativo-borde flex items-center justify-center text-sm font-bold text-corporativo-oscuro">
              {totalReincorporaciones}
            </span>
          )}
        </div>

        <p className="sm:hidden mt-1 text-sm text-corporativo-boton leading-relaxed">
          Personal que debe regresar durante los próximos 7 días.
        </p>
      </div>

      {/* Registros */}
      {totalReincorporaciones > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2">
          {reincorporacionesVisibles.map((item, idx) => (
            <div
              key={`${item.empleado}-${item.fechaReincorporacion}-${idx}`}
              className="flex items-center justify-between gap-4 min-w-0 px-0 py-3.5 border-b border-corporativo-borde md:odd:pr-5 md:even:pl-5 md:even:border-l"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-corporativo-oscuro truncate">
                  {item.empleado}
                </p>
                <p className="mt-0.5 text-xs font-medium text-corporativo-boton">
                  Regresa el {formatFecha(item.fechaReincorporacion)}
                </p>
              </div>

              <div className="shrink-0">
                <EstadoBadge estado={item.tipo} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center rounded-2xl bg-corporativo-fondo/40 border border-dashed border-corporativo-borde p-6 text-center text-sm text-corporativo-boton">
          No hay reincorporaciones cercanas.
        </div>
      )}

      {/* Indicador de Registros Adicionales */}
      {hayMasRegistros && (
        <div className="pt-4 mt-2 text-center">
          <p className="text-xs font-medium text-corporativo-boton">
            Mostrando las 4 reincorporaciones más próximas
          </p>
        </div>
      )}
    </article>
  );
}