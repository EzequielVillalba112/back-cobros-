import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";

// 🔹 Cargar variables del .env
dotenv.config();

const app = express();

// 🔐 Configuración del cliente
const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN
});

// ⚙️ Middleware
app.use(cors({
  origin: "https://pr-e-commerce-con-carrito.vercel.app",
  methods: ["GET", "POST"],
}));
app.use(express.json());

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
