import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";

// 🔹 Cargar variables del .env
dotenv.config();

const app = express();
const port = 3000;

// 🔐 Configuración del cliente
const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN,
});

// ⚙️ Middleware
// ✅ CORS flexible para todos los subdominios de Vercel y localhost
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://pr-e-commerce-con-carrito.vercel.app",
      ];

      // Permitir subdominios temporales de vercel.app
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        console.log("❌ Bloqueado por CORS:", origin);
        callback(new Error("No autorizado por CORS"));
      }
    },
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

// 🧩 Rutas
app.get("/", (req, res) => {
  res.send("Backend de Mercado Pago funcionando");
});

app.post("/create_preference", async (req, res) => {
  try {
    const { cart } = req.body;

    // Validar que exista el carrito
    if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ ok: false, error: "Cart inválido" });
    }

    // Mapear los productos
    const items = cart.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: Number(item.lot),
      unit_price: Number(item.price),
      currency_id: "ARS",
    }));

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items,
        payer: { email: "test_user_123@test.com" },
        back_urls: {
          success: "https://tuweb.com/success",
          failure: "https://tuweb.com/failure",
          pending: "https://tuweb.com/pending",
        },
        auto_return: "approved",
      },
    });

    return res.json({ id: result.id });
  } catch (err) {
    console.error("Error al crear preferencia:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
