import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import routes from "./routes/index.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { runMigration } from './database/migrate.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

await runMigration();

app.use(cookieParser());

/* =========================
Middlewares Globales
========================= */
// En desarrollo probás desde localhost y desde la IP de la red local
// (para probar en el celular u otra máquina). En producción, FRONTEND_URL
// debería tener una sola URL fija.
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.56.1:3000',
   process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir si el origen está en la lista o si es una petición de servidor a servidor (sin origen)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

/* =========================
Ruta de prueba
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
  });
});

/* =========================
Rutas
========================= */

routes(app);

/* ==============================
HEALTH CHECK
============================== */

app.get("/api/health", (_req, res) =>
  res.status(200).json({ ok: true })
);

/* =========================
Manejo de errores 404
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

/* ==============================
ERROR HANDLER GLOBAL
============================== */

app.use(errorHandler);

export default app;
