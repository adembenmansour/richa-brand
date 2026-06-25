const path = require("path");
// Chargement des variables d'environnement depuis le fichier .env parent
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Admin    = require("../models/Admin");

// Connexion et exécution du script de peuplement admin
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/richa")
  .then(async () => {
    // Supprimer les anciens administrateurs pour éviter les doublons
    await Admin.deleteMany();
    
    // Créer le compte administrateur par défaut
    await Admin.create({
      email:    "admin@richa.tn",
      password: "Richa2026!",
      nom:      "Administrateur RICHA"
    });
    
    console.log("✓ Compte admin créé avec succès :");
    console.log("  Email:    admin@richa.tn");
    console.log("  Password: Richa2026!");
    process.exit(0);
  })
  .catch(err => {
    console.error("✗ Erreur lors de la création du compte administrateur :", err);
    process.exit(1);
  });
