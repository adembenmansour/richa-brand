const path = require("path");
// Chargement des variables d'environnement depuis le fichier .env parent
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Product = require("../models/Product");

const initialProducts = [
  {
    id: 1,
    badge: "NOUVEAU",
    categorie: "COLLECTION 2026",
    nom: "SET COMPLET RICHA",
    sousNom: "HAUT DRAPÉ + PANTALON WIDE-LEG",
    prix: 120,
    couleur: "BEIGE NATUREL",
    description: "Set deux pièces composé d'un haut drapé et d'un pantalon wide-leg en lin 100% naturel. Silhouette architecturale et fluide. Fait à la main en Tunisie.",
    composition: "100% Lin naturel · Lavage à la main recommandé · Ne pas mettre au sèche-linge",
    tailles: ["XS","S","M","L","XL"],
    taillesDisponibles: ["S","M","L","XL"],
    mannequin: "170 cm de taille / Taille M",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/richa";
    console.log(`Connexion à MongoDB sur : ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("✓ Connecté à MongoDB pour le seeding");

    // Suppression de tous les produits existants
    await Product.deleteMany({});
    console.log("✓ Anciens produits supprimés");

    // Insertion des produits initiaux
    await Product.insertMany(initialProducts);
    console.log("✓ 1 produit inséré avec succès");

  } catch (error) {
    console.error("✗ Erreur lors du seeding de la base de données :", error);
  } finally {
    // Fermeture propre de la connexion à la base de données et arrêt du processus
    await mongoose.connection.close();
    console.log("Connexion fermée. Fin du script.");
    process.exit(0);
  }
}

seedDatabase();
