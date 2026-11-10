const minutesBetween = (a, b) => {
  if (!a || !b) return null;
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  return (ah * 60 + am) - (bh * 60 + bm);
};

const calcularEstadoAsistencia = (horaEntrada, horaReferencia = '09:00') => {
  if (!horaEntrada) return 'Ausente';
  const diff = minutesBetween(horaEntrada, horaReferencia);
  if (diff === null) return 'Ausente';
  if (diff <= 0) return 'Puntual';
  return diff <= 20 ? 'Retardo' : 'Tarde';
};

const normalizarDia = (dia) =>
  String(dia || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

function construirSemanaLaboral({ semanaInicio, asistenciasData = [], horarioData = null }) {
  const fechaInicio = new Date(semanaInicio);
  const asistenciasMap = new Map((asistenciasData || []).map((item) => [item?.fecha, item]));
  const diasLaborales = (horarioData?.diasLaborales || []).map(normalizarDia);

  return Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(fechaInicio);
    fecha.setUTCDate(fechaInicio.getUTCDate() + i);
    const fechaApi = fecha.toISOString().slice(0, 10);
    const nombreDia = normalizarDia(fecha.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' }));

    if (asistenciasMap.has(fechaApi)) {
      return { ...asistenciasMap.get(fechaApi), fecha: fechaApi };
    }

    if (diasLaborales.length && !diasLaborales.includes(nombreDia)) return null;

    return {
      id: `ausente-${fechaApi}`,
      fecha: fechaApi,
      horaEntrada: null,
      horaSalida: null,
      estado: 'Ausente',
      observacion: 'Sin registro de asistencia.',
      minutosTrabajados: 0
    };
  }).filter(Boolean);
}

module.exports = {
  calcularEstadoAsistencia,
  construirSemanaLaboral,
  normalizarDia,
  minutesBetween
};