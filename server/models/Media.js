const mongoose = require("mongoose");

// Définition du schéma pour les médias (vidéos ou images) de la Landing Page
const MediaSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["video", "image"], 
    required: [true, "Le type de média (video ou image) est requis."] 
  },
  section: {
    type: String,
    enum: ["hero", "produit_set", "produit_pull", "produit_pantalon"],
    required: [true, "La section associée sur la Landing Page est requise."]
  },
  url: { 
    type: String, 
    required: [true, "L'URL d'accès au fichier média est requise."] 
  },
  actif: { 
    type: Boolean, 
    default: true 
  },
  ordre: { 
    type: Number, 
    default: 0 
  },
  label: { 
    type: String, 
    default: "" 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Media", MediaSchema);
