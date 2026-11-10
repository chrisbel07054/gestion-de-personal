import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Paleta basada en tailwind.config.js
const COLORES = {
  fondo: '#F1F5F9',
  claro1: '#C6E7FF',
  claro2: '#7EA0C5',
  principal: '#052659',
  boton: '#5482B4',
  borde: '#071952',
};

// Colores coherentes con los gráficos del dashboard
const COLORES_ESTADOS = {
  Puntual: COLORES.principal,
  Retardo: COLORES.boton,
  Tarde: COLORES.claro2,
  Ausente: '#64748b',
};

const SERIES_EVOLUCION = [
  { dataKey: 'puntuales', nombre: 'Puntuales', color: COLORES_ESTADOS.Puntual },
  { dataKey: 'retardos', nombre: 'Retardos', color: COLORES_ESTADOS.Retardo },
  { dataKey: 'tardes', nombre: 'Tardes', color: COLORES_ESTADOS.Tarde },
  { dataKey: 'ausencias', nombre: 'Ausencias', color: COLORES_ESTADOS.Ausente },
];

function PanelGrafico({ titulo, descripcion, children }) {
  return (
    <section className="min-w-0 rounded-3xl border border-corporativo-borde bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold leading-snug text-corporativo-oscuro">
          {titulo}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-corporativo-boton">
          {descripcion}
        </p>
      </div>
      {children}
    </section>
  );
}

// Leyenda con el mismo tamaño y estilo de texto del dashboard
function LeyendaPersonalizada({ payload = [] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-corporativo-boton">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const elementos = payload.filter(
    (item) => item.value !== undefined && item.value !== null
  );

  if (!elementos.length) return null;

  return (
    <div className="rounded-2xl border border-corporativo-borde bg-white px-4 py-3 shadow-xl">
      {label && (
        <p className="mb-2 text-sm font-bold text-corporativo-oscuro">
          {label}
        </p>
      )}

      <div className="space-y-1.5">
        {elementos.map((item) => (
          <div
            key={item.dataKey ?? item.name}
            className="flex items-center justify-between gap-6 text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: item.color ?? COLORES.boton,
                }}
              />
              <span className="font-medium text-corporativo-boton">
                {item.name}
              </span>
            </div>

            <span className="font-bold text-corporativo-oscuro">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MensajeVacio({ children }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-corporativo-borde bg-corporativo-fondo/40 px-4 text-center text-sm text-corporativo-boton">
      {children}
    </div>
  );
}

export default function GraficosEstadisticas({
  evolucion = [],
  distribucion = [],
}) {
  const distribucionConDatos = distribucion.filter(
    (item) => Number(item.valor) > 0
  );

  const hayEvolucion = evolucion.some((item) =>
    SERIES_EVOLUCION.some(
      (serie) => Number(item[serie.dataKey] ?? 0) > 0
    )
  );

  const payloadEvolucion = SERIES_EVOLUCION.map((serie) => ({
    value: serie.nombre,
    color: serie.color,
  }));

  const payloadPie = distribucionConDatos.map((item) => ({
    value: item.nombre,
    color: COLORES_ESTADOS[item.clave] ?? COLORES.boton,
  }));

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
      {/* Evolución temporal */}
      <PanelGrafico
        titulo="Evolución de la asistencia"
        descripcion="Comparación de los estados de asistencia durante el período seleccionado."
      >
        <div className="h-80 w-full">
          {hayEvolucion ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={evolucion}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="periodo"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: COLORES.boton,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: COLORES.boton,
                  }}
                  width={35}
                />

                <Tooltip content={<TooltipPersonalizado />} />

                {SERIES_EVOLUCION.map((serie) => (
                  <Line
                    key={serie.dataKey}
                    type="monotone"
                    dataKey={serie.dataKey}
                    name={serie.nombre}
                    stroke={serie.color}
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                      fill: serie.color,
                      strokeWidth: 0,
                    }}
                    activeDot={{
                      r: 5,
                      strokeWidth: 0,
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <MensajeVacio>
              No hay datos de asistencia para el período seleccionado.
            </MensajeVacio>
          )}
        </div>

        {hayEvolucion && (
          <LeyendaPersonalizada payload={payloadEvolucion} />
        )}
      </PanelGrafico>

      {/* Distribución por estado */}
      <PanelGrafico
        titulo="Distribución por estado"
        descripcion="Proporción de los registros contabilizados según su estado."
      >
        <div className="h-80 w-full">
          {distribucionConDatos.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribucionConDatos}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="45%"
                  outerRadius={92}
                  innerRadius={56}
                  paddingAngle={2}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    outerRadius,
                    percent,
                  }) => {
                    if (percent < 0.07) return null;

                    const RADIAN = Math.PI / 180;
                    const radio = outerRadius + 17;
                    const x =
                      cx + radio * Math.cos(-midAngle * RADIAN);
                    const y =
                      cy + radio * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={COLORES.principal}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={11}
                        fontWeight={600}
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {distribucionConDatos.map((item) => (
                    <Cell
                      key={item.clave}
                      fill={
                        COLORES_ESTADOS[item.clave] ?? COLORES.boton
                      }
                    />
                  ))}
                </Pie>

                <Tooltip content={<TooltipPersonalizado />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <MensajeVacio>
              No hay registros para distribuir.
            </MensajeVacio>
          )}
        </div>

        {distribucionConDatos.length > 0 && (
          <LeyendaPersonalizada payload={payloadPie} />
        )}
      </PanelGrafico>
    </div>
  );
}