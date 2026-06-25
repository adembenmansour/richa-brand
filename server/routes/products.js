const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products - Récupère tous les produits de la base de données
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des produits" });
  }
});

module.exports = router;
