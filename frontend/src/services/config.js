// Direcciones del servidor. Se definen con la variable VITE_API_BASE_URL
// (por ejemplo: https://mi-servidor.onrender.com/api). Si no existe, se usa el servidor local.
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Dirección de la API, sin barra final.
export const API_BASE_URL = API.replace(/\/+$/, '');

// Dirección del servidor, sin /api. Se usa para archivos como las fotos.
export const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');
