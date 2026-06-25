const path = require("path");
// Chargement des variables d'environnement depuis le fichier .env parent
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Product = require("../models/Product");

// Produits initiaux à insérer dans la base de données
const initialProducts = [
  {
    badge: "POPULAIRE",
    categorie: "ENSEMBLE DEUX PIÈCES",
    nom: "SET COMPLET",
    prix: 120,
    description: "Haut drapé et pantalon wide-leg en lin 100% naturel.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"
  },
  {
    badge: "HAUT DRAPÉ",
    categorie: "HAUT DRAPÉ",
    nom: "PULL",
    prix: 30,
    description: "Haut drapé en lin, coupe fluide et légère.",
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600"
  },
  {
    badge: "PANTALON WIDE-LEG",
    categorie: "PANTALON WIDE-LEG",
    nom: "PANTALON",
    prix: 70,
    description: "Pantalon wide-leg taille haute, tombé parfait.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600"
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
    console.log("✓ 3 produits insérés avec succès");

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
