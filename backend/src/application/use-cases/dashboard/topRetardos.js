const prisma = require('../../../infrastructure/database/prismaClient');

function monthBounds(mes) {
  if (!mes) {
    const d = new Date();
    const inicio = new Date(d.getFullYear(), d.getMonth(), 1);
    const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return {
      inicio: `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}`,
      fin: `${fin.getFullYear()}-${String(fin.getMonth() + 1).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`,
    };
  }

  const [yyyy, mm] = mes.split('-').map(Number);
  const inicio = new Date(yyyy, mm - 1, 1);
  const fin = new Date(yyyy, mm, 0);

  return {
    inicio: `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}`,
    fin: `${fin.getFullYear()}-${String(fin.getMonth() + 1).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`,
  };
}

module.exports = async function topRetardos({ mes, limit = 3 } = {}) {
  const { inicio, fin } = monthBounds(mes);

  const rows = await prisma.asistencia.findMany({
    where: {
      fecha: { gte: inicio, lte: fin },
      estado: { in: ['Puntual', 'Retardo', 'Tarde'] },
    },
    include: {
      empleado: { include: { departamento: true } },
    },
  });

  const map = new Map();

  rows.forEach((registro) => {
    const departamento = registro.empleado?.departamento?.nombre || 'Sin departamento';

    if (!map.has(departamento)) {
      map.set(departamento, { departamento, puntuales: 0, retardos: 0, tardes: 0, totalLlegadas: 0 });
    }

    const estadistica = map.get(departamento);

    if (registro.estado === 'Puntual') estadistica.puntuales++;
    if (registro.estado === 'Retardo') estadistica.retardos++;
    if (registro.estado === 'Tarde') estadistica.tardes++;
    estadistica.totalLlegadas++;
  });

  return Array.from(map.values())
    .sort((a, b) => (b.retardos + b.tardes) - (a.retardos + a.tardes))
    .slice(0, Number(limit));
};