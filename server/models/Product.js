const mongoose = require("mongoose");

// Définition du schéma pour un produit
const ProductSchema = new mongoose.Schema({
  badge: {
    type: String,
    required: [true, "Le badge du produit est requis"]
  },
  categorie: {
    type: String,
    required: [true, "La catégorie du produit est requise"]
  },
  nom: {
    type: String,
    required: [true, "Le nom du produit est requis"]
  },
  prix: {
    type: Number,
    required: [true, "Le prix du produit est requis"]
  },
  description: {
    type: String,
    required: [true, "La description du produit est requise"]
  },
  image: {
    type: String,
    required: [true, "L'URL de l'image du produit est requise"]
  }
});

// Exportation du modèle Mongoose "Product"
module.exports = mongoose.model("Product", ProductSchema);
