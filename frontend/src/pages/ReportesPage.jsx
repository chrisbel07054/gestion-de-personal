import { useEffect } from 'react';
import LayoutRRHH from '../layouts/LayoutRRHH.jsx';
import logoInstitucion from '../assets/IVSS.svg';

import ReporteFiltros from '../components/reportes/ReporteFiltros.jsx';
import ReporteTabla from '../components/reportes/ReporteTabla.jsx';

import { useReportes } from '../hooks/useReportes.js';
import { mostrarAlerta } from '../utils/alertas.js';

export default function ReportesPage() {
  const reportes = useReportes();

  // Mostrar alertas automáticamente cuando el hook devuelva un error o un mensaje de éxito
  useEffect(() => {
    if (reportes.error) {
      mostrarAlerta('error', '¡Atención!', reportes.error);
    }
  }, [reportes.error]);

  useEffect(() => {
    if (reportes.successMessage) {
      mostrarAlerta('success', '¡Éxito!', reportes.successMessage);
    }
  }, [reportes.successMessage]);

  return (
    <LayoutRRHH>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6 space-y-4">
        {/* Cabecera Unificada */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          <div className="flex items-center gap-4">
            <img src={logoInstitucion} alt="Logo Institución" className="h-14 w-auto object-contain shrink-0" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight">
                Reportes
              </h1>
              <p className="mt-1 text-sm text-corporativo-boton">
                Generación y exportación de reportes administrativos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro">
              {reportes.userName || 'RRHH'}
            </div>
          </div>
        </div>

        {/* Contenedor Único (Filtros + Vista Previa) */}
        <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-corporativo-borde shadow-sm space-y-6">
          <ReporteFiltros
            tipoReporte={reportes.tipoReporte}
            departamentoId={reportes.departamentoId}
            empleadoId={reportes.empleadoId}
            desde={reportes.desde}
            hasta={reportes.hasta}
            departamentos={reportes.departamentos}
            empleadosFiltrados={reportes.empleadosFiltrados}
            loadingCatalogos={reportes.loadingCatalogos}
            loadingReporte={reportes.loadingReporte}
            puedeGenerarReporte={reportes.puedeGenerarReporte}
            hayFiltroValido={reportes.hayFiltroValido}
            obtenerId={reportes.obtenerId}
            obtenerNombreEmpleado={reportes.obtenerNombreEmpleado}
            onTipoReporteChange={reportes.handleTipoReporteChange}
            onDepartamentoChange={reportes.handleDepartamentoChange}
            onEmpleadoChange={reportes.setEmpleadoId}
            onDesdeChange={reportes.setDesde}
            onHastaChange={reportes.setHasta}
            onLimpiar={reportes.limpiarFiltros}
            onGenerar={reportes.generarReporte}
            empleadoBusqueda={reportes.empleadoBusqueda}
            onEmpleadoBusquedaChange={reportes.setEmpleadoBusqueda}
          />

          <hr className="border-corporativo-borde/60" />

          <ReporteTabla
            reporte={reportes.reporte}
            resumen={reportes.resumen}
            tipoReporte={reportes.tipoReporte}
            loadingReporte={reportes.loadingReporte}
            puedeGenerarReporte={reportes.puedeGenerarReporte}
            exportandoPDF={reportes.exportandoPDF}
            exportandoExcel={reportes.exportandoExcel}
            obtenerTituloReporte={reportes.obtenerTituloReporte}
            formatearValor={reportes.formatearValor}
            onExportarPDF={reportes.handleExportarPDF}
            onExportarExcel={reportes.handleExportarExcel}
          />
        </div>
      </section>
    </LayoutRRHH>
  );
}