import Swal from 'sweetalert2';

export const mostrarAlerta = (icon, title, text = '') => {
  // Si es 'error', usamos el rojo que combina con la X. Si no, mantiene sus colores.
  const colorIcono = icon === 'success' ? '#7EA0C5' : icon === 'error' ? '#f27474' : '#C6E7FF';

  return Swal.fire({
    icon,
    title,
    text,
    timer: icon === 'success' ? 2000 : undefined,
    showConfirmButton: icon !== 'success',
    confirmButtonText: 'Aceptar',
    didOpen: () => {
      const iconElement = Swal.getIcon();
      if (iconElement) {
        iconElement.style.borderColor = colorIcono;
        iconElement.style.color = colorIcono;
      }
    },
    customClass: {
      popup: 'rounded-3xl bg-[#011025] border border-slate-700/60 shadow-2xl p-6 text-white',
      title: 'text-2xl font-bold text-white tracking-tight',
      htmlContainer: 'text-sm text-slate-300 font-medium',
      confirmButton: 'rounded-xl bg-corporativo-boton border border-slate-700/80 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal active:scale-95 transition-all cursor-pointer'
    },
    buttonsStyling: false
  });
};

export const confirmarAccion = ({ title, text, confirmButtonText = 'Sí, confirmar' }) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    didOpen: () => {
      const iconElement = Swal.getIcon();
      if (iconElement) {
        iconElement.style.borderColor = '#7EA0C5';
        iconElement.style.color = '#7EA0C5';
      }
    },
    customClass: {
      popup: 'rounded-3xl bg-[#011025] border border-slate-700/60 shadow-2xl p-6 text-white',
      title: 'text-2xl font-bold text-white tracking-tight',
      htmlContainer: 'text-sm text-slate-300 font-medium',
      confirmButton: 'rounded-xl bg-corporativo-boton border border-slate-700/80 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal active:scale-95 transition-all cursor-pointer mx-2',
      cancelButton: 'rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer mx-2'
    },
    buttonsStyling: false
  });
};