const mongoose = require("mongoose");

// Définition du schéma pour une commande
const OrderSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom du client est requis"]
  },
  telephone: {
    type: String,
    required: [true, "Le numéro de téléphone est requis"]
  },
  gouvernorat: {
    type: String,
    required: [true, "Le gouvernorat est requis"]
  },
  adresse: {
    type: String,
    required: [true, "L'adresse de livraison est requise"]
  },
  note: {
    type: String,
    default: ""
  },
  articles: [
    {
      produitId: { type: String, default: "" },
      nom:       { type: String, default: "" },
      taille:    { type: String, default: "" },
      quantite:  { type: Number, default: 1 },
      prix:      { type: Number, default: 0 }
    }
  ],
  total: {
    type: Number,
    default: 0
  },
  statut: {
    type: String,
    default: "En attente"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Exportation du modèle Mongoose "Order"
module.exports = mongoose.model("Order", OrderSchema);

