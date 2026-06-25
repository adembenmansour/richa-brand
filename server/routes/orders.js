const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middleware/authMiddleware");

// Liste des clients admin connectés en SSE
let sseClients = [];

// GET /api/orders/stream — Flux SSE (protégé par authentification)
router.get("/stream", auth, (req, res) => {
  // En-têtes obligatoires pour SSE
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.flushHeaders();

  // Envoyer un événement initial pour valider la connexion
  res.write(`data: ${JSON.stringify({ type: "connected", message: "Flux SSE actif" })}\n\n`);

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);
  console.log(`✓ Admin connecté en SSE (ID: ${clientId}), total: ${sseClients.length}`);

  // Retirer le client lors de sa déconnexion
  req.on("close", () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
    console.log(`→ Admin déconnecté du SSE (ID: ${clientId}), restant: ${sseClients.length}`);
  });
});

// Fonction utilitaire pour envoyer une notification à tous les admins connectés
const notifierAdmins = (payload) => {
  const data = JSON.stringify(payload);
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
  console.log(`→ Notification SSE envoyée à ${sseClients.length} admin(s):`, payload.type);
};

// POST /api/orders — Crée une nouvelle commande et notifie les admins en temps réel
router.post("/", async (req, res) => {
  try {
    console.log("Body reçu pour commande:", JSON.stringify(req.body, null, 2));
    const { nom, telephone, gouvernorat, adresse, note, articles } = req.body;

    if (!nom || !telephone || !gouvernorat || !adresse) {
      return res.status(400).json({ error: "Champs obligatoires manquants." });
    }

    // Calculer le montant total de la commande
    const totalOrder = (articles || []).reduce(
      (sum, a) => sum + (a.prix * (a.quantite || 1)), 
      0
    );

    const order = new Order({
      nom,
      telephone,
      gouvernorat,
      adresse,
      note: note || "",
      articles: articles || [],
      total: totalOrder,
      statut: "En attente"
    });

    await order.save();
    console.log("✓ Commande enregistrée dans la base de données :", order._id);

    // Diffuser la notification de nouvelle commande à tous les admins connectés en SSE
    notifierAdmins({
      type:      "nouvelle_commande",
      orderId:   order._id,
      client:    nom,
      telephone: telephone,
      gouvernorat,
      articles:  (articles || []).length,
      total:     totalOrder,
      statut:    "En attente",
      timestamp: new Date().toISOString()
    });

    // Renvoyer les informations complètes indispensables au frontend pour Confirmation.jsx
    res.json({
      success: true,
      orderId: order._id,
      articles: order.articles,
      total: totalOrder,
      order: {
        orderId: order._id,
        articles: order.articles,
        total: totalOrder
      }
    });

  } catch (err) {
    console.error("✗ Erreur lors de la sauvegarde de la commande :", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

module.exports = router;
