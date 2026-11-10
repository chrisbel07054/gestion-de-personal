import { useCallback, useEffect, useState } from 'react';
import { getDepartamentos } from '../services/departamentoService.js';
import { getCargos } from '../services/cargoService.js';
import { getUsuarios } from '../services/usuarioService.js';
import { getAuditoria } from '../services/auditoriaService.js';
import { mostrarAlerta } from '../utils/alertas.js';

const obtenerFechaHoy = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function useAdmin() {
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [auditoriaList, setAuditoriaList] = useState([]);
  const [totalAuditoria, setTotalAuditoria] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar datos del dashboard administrativo
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [resDeps, resCargos, resUsuarios, resAuditoria] = await Promise.all([
        getDepartamentos(),
        getCargos(),
        getUsuarios(),
        getAuditoria({ fecha: obtenerFechaHoy(), page: 1, limit: 4 }),
      ]);

      setDepartamentos(Array.isArray(resDeps) ? resDeps : resDeps?.data || []);
      setCargos(Array.isArray(resCargos) ? resCargos : resCargos?.data || []);
      setUsuariosList(Array.isArray(resUsuarios) ? resUsuarios : resUsuarios?.data || []);
      setAuditoriaList(Array.isArray(resAuditoria?.items) ? resAuditoria.items : []);
      setTotalAuditoria(resAuditoria?.total ?? 0);
    } catch (err) {
      console.error('Error cargando dashboard administrativo:', err);
      const mensaje = err?.response?.data?.mensaje || err?.message || 'No se pudieron cargar los datos del panel administrativo.';
      setError(mensaje);
      await mostrarAlerta('error', 'Error de carga', mensaje);

      setDepartamentos([]);
      setCargos([]);
      setUsuariosList([]);
      setAuditoriaList([]);
      setTotalAuditoria(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    departamentos,
    cargos,
    usuariosList,
    auditoriaList,
    totalAuditoria,
    loading,
    error,
    loadDashboard,
  };
}