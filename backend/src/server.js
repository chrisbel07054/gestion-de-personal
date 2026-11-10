require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./infrastructure/database');
const authRoutes = require('./interfaces/routes/auth.routes');
const usuariosRoutes = require('./interfaces/routes/usuarios.routes');
const departamentosRoutes = require('./interfaces/routes/departamentos.routes');
const cargosRoutes = require('./interfaces/routes/cargos.routes');
const empleadosRoutes = require('./interfaces/routes/empleados.routes');
const auditoria = require('./interfaces/middlewares/auditoria');
const horariosRoutes = require('./interfaces/routes/horarios.routes');
const asistenciaRoutes = require('./interfaces/routes/asistencia.routes');
const vacacionesRoutes = require('./interfaces/routes/vacaciones.routes');
const repososRoutes = require('./interfaces/routes/reposos.routes');
const permisosRoutes = require('./interfaces/routes/permisos.routes');
const dashboardRoutes = require('./interfaces/routes/dashboard.routes');
const reportesRoutes = require('./interfaces/routes/reportes.routes');
const estadisticasRoutes = require('./interfaces/routes/estadisticas.routes');
const observacionesRoutes = require('./interfaces/routes/observaciones.routes');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

const auditoriaRoutes = require('./interfaces/routes/auditoria.routes');

// Connect to PostgreSQL via Prisma
db.connect();

app.use(auditoria);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/cargos', cargosRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/vacaciones', vacacionesRoutes);
app.use('/api/reposos-medicos', repososRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/observaciones', observacionesRoutes);

// Servir uploads estáticos
const { UPLOADS_DIR } = require('./infrastructure/storage/uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
