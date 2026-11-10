const {
  calcularEstadoAsistencia,
  construirSemanaLaboral,
} = require('../application/use-cases/asistencia/estadoAsistencia');

describe('cálculo de estado de asistencia', () => {
  test('clasifica puntual, retardo, tarde y ausente según el margen de llegada', () => {
    expect(calcularEstadoAsistencia('08:00', '09:00')).toBe('Puntual');
    expect(calcularEstadoAsistencia('09:20', '09:00')).toBe('Retardo');
    expect(calcularEstadoAsistencia('09:45', '09:00')).toBe('Tarde');
    expect(calcularEstadoAsistencia(null, '09:00')).toBe('Ausente');
  });

  test('mantiene los días con asistencia real aunque el horario actual tenga menos días programados', () => {
    const semanaInicio = new Date('2026-09-07T00:00:00Z');

    const asistencias = [
      { fecha: '2026-09-07', horaEntrada: '08:10', estado: 'Puntual' },
      { fecha: '2026-09-08', horaEntrada: '08:50', estado: 'Retardo' },
      { fecha: '2026-09-09', horaEntrada: '09:10', estado: 'Retardo' },
      { fecha: '2026-09-10', horaEntrada: '08:30', estado: 'Puntual' },
      { fecha: '2026-09-11', horaEntrada: '09:35', estado: 'Tarde' },
    ];

    const horario = {
      diasLaborales: ['lunes', 'martes'],
      horaEntrada: '09:00',
      horaSalida: '17:00',
    };

    const resultado = construirSemanaLaboral({
      semanaInicio,
      asistenciasData: asistencias,
      horarioData: horario,
    });

    expect(resultado.map((item) => item.fecha)).toEqual([
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
      '2026-09-11',
    ]);

    expect(resultado).toHaveLength(5);

    expect(resultado.map((item) => item.estado)).toEqual([
      'Puntual',
      'Retardo',
      'Retardo',
      'Puntual',
      'Tarde',
    ]);
  });
});