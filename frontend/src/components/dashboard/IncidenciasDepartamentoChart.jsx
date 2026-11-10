import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function ChartEmpty({ mensaje = 'No hay datos disponibles.' }) {
  return (
    <div className="h-64 flex items-center justify-center rounded-2xl bg-corporativo-fondo/40 border border-dashed border-corporativo-borde text-sm text-corporativo-boton text-center px-4">
      {mensaje}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-2xl border border-corporativo-borde bg-white px-4 py-3 shadow-xl">
      <p className="mb-2 text-sm font-bold text-corporativo-oscuro">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-corporativo-boton font-medium">{entry.name}</span>
            </div>
            <span className="font-bold text-corporativo-oscuro">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function IncidenciasDepartamentoChart({ data = [] }) {
  const hayDatos = data.length > 0;
  
  // Calculamos una altura dinámica basada en cuántos departamentos hay para que nunca se aprieten
  const alturaContenedor = Math.max(260, data.length * 55);

  return (
    <article className="rounded-3xl border border-corporativo-borde bg-white p-4 sm:p-6 shadow-sm">
      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-corporativo-oscuro leading-snug">
              Departamentos con mayores incidencias de puntualidad
            </h2>
            <p className="hidden sm:block mt-1 text-sm text-corporativo-boton leading-relaxed">
              Distribución horizontal acumulada de llegadas puntuales, retardos y tardes durante el mes.
            </p>
          </div>
          <span className="shrink-0 rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3 py-1 text-xs font-bold text-corporativo-oscuro shadow-sm">
            Este mes
          </span>
        </div>

        <p className="sm:hidden mt-1 text-sm text-corporativo-boton leading-relaxed">
          Distribución horizontal acumulada de llegadas puntuales, retardos y tardes durante el mes.
        </p>

        {/* Leyenda */}
        <div className="mt-3 flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#052659]" />
            <span className="text-xs font-medium text-corporativo-boton">Puntuales</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#5482B4]" />
            <span className="text-xs font-medium text-corporativo-boton">Retardos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#64748b]" />
            <span className="text-xs font-medium text-corporativo-boton">Tardes</span>
          </div>
        </div>
      </div>

      {/* Contenido / Gráfico de Barras Horizontales Apiladas */}
      {hayDatos ? (
        <div className="w-full overflow-y-auto pr-1">
          <div style={{ width: '100%', height: `${alturaContenedor}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                barCategoryGap="30%"
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#5482B4' }}
                />
                <YAxis
                  type="category"
                  dataKey="departamento"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#5482B4', fontWeight: 600 }}
                  width={110}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
                
                {/* layout="vertical" invierte los ejes y stackId="a" apila horizontalmente */}
                <Bar dataKey="puntuales" name="Puntuales" stackId="a" fill="#052659" barSize={18} />
                <Bar dataKey="retardos" name="Retardos" stackId="a" fill="#5482B4" barSize={18} />
                <Bar dataKey="tardes" name="Tardes" stackId="a" fill="#64748b" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <ChartEmpty mensaje="No hay incidencias de puntualidad registradas en el mes." />
      )}
    </article>
  );
}