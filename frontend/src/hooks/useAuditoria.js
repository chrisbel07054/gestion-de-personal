import { useEffect, useState } from 'react';
import { getAuditoria } from '../services/auditoriaService.js';
import { mostrarAlerta } from '../utils/alertas.js';

const obtenerFechaHoy = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function useAuditoria() {
  const [auditoriaList, setAuditoriaList] = useState([]);
  const [fecha, setFecha] = useState(obtenerFechaHoy);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    const cargarAuditoria = async () => {
      try {
        setLoading(true);

        const respuesta = await getAuditoria({
          fecha,
          page,
          limit,
        });

        setAuditoriaList(
          Array.isArray(respuesta?.items)
            ? respuesta.items
            : []
        );

        setTotal(respuesta?.total ?? 0);
        setTotalPaginas(respuesta?.totalPaginas ?? 1);

      } catch (error) {
        console.error('Error cargando auditoría:', error);

        const mensaje =
          error?.response?.data?.mensaje ||
          error?.message ||
          'No se pudo cargar la bitácora de auditoría.';

        await mostrarAlerta(
          'error',
          'Error de carga',
          mensaje
        );

        setAuditoriaList([]);
        setTotal(0);
        setTotalPaginas(1);

      } finally {
        setLoading(false);
      }
    };

    cargarAuditoria();
  }, [fecha, page, limit]);

  const handleFechaChange = (nuevaFecha) => {
    setFecha(nuevaFecha);
    setPage(1);
  };

  const handleLimitChange = (nuevoLimite) => {
    setLimit(Number(nuevoLimite));
    setPage(1);
  };

  const obtenerDetalleTexto = (detalle) => {
    return (
      detalle?.descripcion ||
      (typeof detalle === 'string' ? detalle : '—')
    );
  };

  return {
    auditoriaList,
    fecha,
    loading,
    page,
    limit,
    total,
    totalPaginas,
    handleFechaChange,
    handleLimitChange,
    setPage,
    obtenerDetalleTexto,
  };
}