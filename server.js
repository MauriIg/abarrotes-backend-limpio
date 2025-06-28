import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Importa tus rutas
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import carritoRoutes from "./routes/carritoRoutes.js";
import restockRoutes from "./routes/restockRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import supplierOrderRoutes from "./routes/supplierOrderRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";

// Cargar variables de entorno
dotenv.config();
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);

// Inicializar app
const app = express();

// ✅ CORS seguro y flexible
const allowedOrigins = [
  "http://localhost:5173",                    // para desarrollo local
  process.env.FRONTEND_URL                   // dominio oficial en Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS bloqueado:", origin);
      callback(new Error("Origen no permitido por CORS"));
    }
  },
  credentials: true
}));

// ⚠️ Webhook Stripe: sin JSON parser
app.use("/api/webhook", express.raw({ type: 'application/json' }), webhookRoutes);

// ✅ Parsers para JSON y formularios (después del webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Rutas API
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/restock", restockRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/pedidos-proveedor", supplierOrderRoutes);
app.use("/api/categorias", categoriaRoutes);

// Ruta de prueba
app.get("/", (req, res) => res.send("🚀 API activa y funcionando"));

// 🛑 Middleware de errores global
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({ mensaje: "Algo salió mal", error: err.message });
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err);
    process.exit(1);
  });

// Levantar servidor
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
