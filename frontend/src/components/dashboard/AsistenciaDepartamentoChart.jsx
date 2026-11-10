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

// Tooltip corporativo con el mismo estilo redondeado y sombra de las tarjetas del sistema
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

export default function AsistenciaDepartamentoChart({ data = [] }) {
  const hayDatos = data.length > 0;
  
  // Aumentamos a 110px por departamento para que los textos queden rectos y cómodos sin amontonarse
  const anchoContenedor = Math.max(100, data.length * 110);

  return (
    <article className="rounded-3xl border border-corporativo-borde bg-white p-4 sm:p-6 shadow-sm">
      {/* Encabezado */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-corporativo-oscuro">Asistencia por departamento</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-corporativo-boton">Comparación del personal presente y ausente.</p>
        </div>
        <span className="shrink-0 rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3 py-1 text-xs font-bold text-corporativo-oscuro shadow-sm">
          Hoy
        </span>
      </div>

      {/* Leyenda */}
      <div className="mb-4 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#052659]" />
          <span className="text-xs font-medium text-corporativo-boton">Presentes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#64748b]" />
          <span className="text-xs font-medium text-corporativo-boton">Ausentes</span>
        </div>
      </div>

      {/* Contenido / Gráfico */}
      {hayDatos ? (
        <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
          <div style={{ width: `${anchoContenedor}px`, height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 15, left: -10, bottom: 10 }}
                barGap={5}
                barCategoryGap="30%"
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="departamento"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#5482B4', fontWeight: 600 }}
                  interval={0}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#5482B4' }}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="presentes" name="Presentes" fill="#052659" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="ausentes" name="Ausentes" fill="#64748b" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <ChartEmpty mensaje="No hay datos de asistencia por departamento." />
      )}
    </article>
  );
}