const router   = require("express").Router();
const jwt      = require("jsonwebtoken");
const Admin    = require("../models/Admin");
const Product  = require("../models/Product");
const Order    = require("../models/Order");
const auth     = require("../middleware/authMiddleware");

// ── AUTHENTICATION ──────────────────────────────────────

// POST /api/admin/login - Authentifier un admin et générer un jeton JWT
router.post("/login", async (req, res) => {
  try {
    console.log("→ Tentative login:", req.body?.email);

    const { email, password } = req.body;

    // Vérification body
    if (!email || !password) {
      console.log("✗ Body incomplet");
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    // Chercher l'admin
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    console.log("→ Admin trouvé:", admin ? "OUI" : "NON");

    if (!admin) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    // Comparer mot de passe
    const isMatch = await admin.comparePassword(password);
    console.log("→ Mot de passe correct:", isMatch ? "OUI" : "NON");

    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    // Vérifier JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("✗ JWT_SECRET manquant dans .env");
      return res.status(500).json({ error: "Configuration serveur manquante." });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    console.log("✓ Login réussi pour:", admin.email);

    res.json({
      success: true,
      token,
      admin: {
        id:    admin._id,
        email: admin.email,
        nom:   admin.nom
      }
    });

  } catch (err) {
    console.error("✗ Erreur login:", err.message);
    res.status(500).json({
      error: "Erreur serveur",
      details: err.message
    });
  }
});

// GET /api/admin/me - Récupérer les informations de session de l'admin
router.get("/me", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ error: "Administrateur non trouvé." });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

// ── DASHBOARD STATS ──────────────────────────

// GET /api/admin/dashboard - Obtenir les statistiques du tableau de bord
router.get("/dashboard", auth, async (req, res) => {
  try {
    const totalCommandes  = await Order.countDocuments();
    const enAttente       = await Order.countDocuments({ statut: "En attente" });
    const confirmees      = await Order.countDocuments({ statut: "Confirmée" });
    const expediees       = await Order.countDocuments({ statut: "Expédiée" });
    const livrees         = await Order.countDocuments({ statut: "Livrée" });
    const totalProduits   = await Product.countDocuments();

    // Chiffre d'affaires total (excluant les commandes annulées)
    const orders = await Order.find({ statut: { $ne: "Annulée" } });
    const chiffreAffaires = orders.reduce((sum, o) => {
      // Si la commande a un champ total enregistré, on l'utilise, sinon on le calcule depuis ses articles
      const currentTotal = o.total || o.articles.reduce((s, a) => s + (a.prix * a.quantite), 0);
      return sum + currentTotal;
    }, 0);

    // Produit le plus vendu
    const ventesParProduit = {};
    orders.forEach(o => {
      o.articles.forEach(a => {
        ventesParProduit[a.nom] = (ventesParProduit[a.nom] || 0) + a.quantite;
      });
    });
    const produitTopVente = Object.entries(ventesParProduit)
      .sort((a, b) => b[1] - a[1])[0] || ["Aucun", 0];

    // Gouvernorat le plus actif
    const gouvernoratCount = {};
    orders.forEach(o => {
      gouvernoratCount[o.gouvernorat] =
        (gouvernoratCount[o.gouvernorat] || 0) + 1;
    });
    const gouvernoratTop = Object.entries(gouvernoratCount)
      .sort((a, b) => b[1] - a[1])[0] || ["Aucun", 0];

    // Commandes des 7 derniers jours
    const il_y_a_7_jours = new Date();
    il_y_a_7_jours.setDate(il_y_a_7_jours.getDate() - 7);
    const commandesSemaine = await Order.countDocuments({
      createdAt: { $gte: il_y_a_7_jours }
    });

    res.json({
      totalCommandes,
      statuts: { enAttente, confirmees, expediees, livrees },
      totalProduits,
      chiffreAffaires,
      produitTopVente: { nom: produitTopVente[0], ventes: produitTopVente[1] },
      gouvernoratTop:  { nom: gouvernoratTop[0],  nb: gouvernoratTop[1] },
      commandesSemaine
    });

  } catch (err) {
    res.status(500).json({ error: "Erreur dashboard", details: err.message });
  }
});

// ── COMMANDES (CRUD) ────────────────────────────────

// GET /api/admin/orders - Lister les commandes avec filtres et recherche
router.get("/orders", auth, async (req, res) => {
  try {
    const { statut, gouvernorat, search } = req.query;
    let filter = {};
    if (statut)      filter.statut      = statut;
    if (gouvernorat) filter.gouvernorat = gouvernorat;
    if (search)      filter.nom         = { $regex: search, $options: "i" };

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Erreur chargement commandes" });
  }
});

// PATCH /api/admin/orders/:id - Modifier le statut d'une commande
router.patch("/orders/:id", auth, async (req, res) => {
  try {
    const { statut } = req.body;
    const statutsValides = ["En attente", "Confirmée", "Expédiée", "Livrée", "Annulée"];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ error: "Statut invalide." });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Commande introuvable." });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: "Erreur mise à jour statut" });
  }
});

// DELETE /api/admin/orders/:id - Supprimer une commande
router.delete("/orders/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Commande introuvable." });
    res.json({ success: true, message: "Commande supprimée." });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression commande" });
  }
});

// ── PRODUITS (CRUD) ─────────────────────────────────

// GET /api/admin/products - Charger tous les produits
router.get("/products", auth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Erreur chargement produits" });
  }
});

// POST /api/admin/products - Créer un produit
router.post("/products", auth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ error: "Données produit invalides", details: err.message });
  }
});

// PUT /api/admin/products/:id - Modifier un produit
router.put("/products/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Produit introuvable." });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ error: "Erreur mise à jour produit", details: err.message });
  }
});

// DELETE /api/admin/products/:id - Supprimer un produit
router.delete("/products/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Produit introuvable." });
    res.json({ success: true, message: "Produit supprimé." });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression produit" });
  }
});

module.exports = router;
