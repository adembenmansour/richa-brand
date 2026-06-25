require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app = express();

// CORS — doit être EN PREMIER
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parser JSON — AVANT les routes
app.use(express.json());

// Route santé
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/admin",    require("./routes/admin"));
app.use("/api/admin/media", require("./routes/media"));
app.use("/api/media",       require("./routes/media"));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✓ MongoDB connecté"))
  .catch(err => console.error("✗ Erreur MongoDB:", err));

app.listen(process.env.PORT || 3001, () =>
  console.log("✓ Serveur RICHA démarré sur http://localhost:3001")
);

