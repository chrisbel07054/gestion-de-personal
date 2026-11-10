import { useEffect, useState } from 'react';

import {
  getDashboardMetrics,
  getAsistenciaPorDepartamento,
  getTopRetardos,
  getProximasReincorporaciones,
} from '../services/dashboardService.js';

import { mostrarAlerta } from '../utils/alertas.js';

export default function useDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [asistenciaDepartamento, setAsistenciaDepartamento] = useState([]);
  const [topRetardos, setTopRetardos] = useState([]);
  const [reincorporaciones, setReincorporaciones] = useState([]);

  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState('Gestor de Personal');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          metricsData,
          asistenciaData,
          retardosData,
          reincorporacionesData,
        ] = await Promise.all([
          getDashboardMetrics(),
          getAsistenciaPorDepartamento(),
          getTopRetardos({ limit: 3 }),
          getProximasReincorporaciones(7),
        ]);

        setMetrics(metricsData || null);

        setAsistenciaDepartamento(
          Array.isArray(asistenciaData)
            ? asistenciaData
            : []
        );

        setTopRetardos(
          Array.isArray(retardosData)
            ? retardosData
            : []
        );

        setReincorporaciones(
          Array.isArray(reincorporacionesData)
            ? reincorporacionesData
            : []
        );
      } catch (err) {
        const mensajeServidor =
          err?.response?.data?.mensaje ||
          err?.message;

        await mostrarAlerta(
          'error',
          'Error de carga',
          mensajeServidor ||
            'No se pudieron cargar los datos del dashboard.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    try {
      const usuarioStorage = JSON.parse(
        localStorage.getItem('usuario') ||
        localStorage.getItem('user')
      );

      if (usuarioStorage?.nombre || usuarioStorage?.name) {
        setUserName(
          usuarioStorage.nombre ||
          usuarioStorage.name
        );
      }
    } catch {
      // Mantiene el valor por defecto.
    }
  }, []);

  return {
    metrics,
    asistenciaDepartamento,
    topRetardos,
    reincorporaciones,
    loading,
    userName,
  };
}