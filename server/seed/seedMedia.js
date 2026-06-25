const path = require("path");
// Chargement des variables d'environnement depuis le fichier .env parent
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Media    = require("../models/Media");

// Connexion et exécution du script de peuplement des médias initiaux
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/richa")
  .then(async () => {
    // Supprimer les anciens médias pour éviter les doublons
    await Media.deleteMany();
    
    // Insérer les médias par défaut (vidéo Hero et images produits)
    await Media.insertMany([
      {
        type: "video", 
        section: "hero", 
        ordre: 1, 
        actif: true,
        url: "https://player.vimeo.com/external/435674703.sd.mp4?s=7f60706240d4653e00344d56af71e2ef64d78ab4&profile_id=165&oauth2_token_id=57447761",
        label: "Vidéo Hero principale"
      },
      {
        type: "image", 
        section: "produit_set", 
        ordre: 1, 
        actif: true,
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
        label: "Photo Set RICHA"
      },
      {
        type: "image", 
        section: "produit_pull", 
        ordre: 1, 
        actif: true,
        url: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600",
        label: "Photo Pull"
      },
      {
        type: "image", 
        section: "produit_pantalon", 
        ordre: 1, 
        actif: true,
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600",
        label: "Photo Pantalon"
      }
    ]);
    
    console.log("✓ Médias initiaux insérés avec succès.");
    process.exit(0);
  })
  .catch(err => {
    console.error("✗ Erreur lors du seeding des médias :", err);
    process.exit(1);
  });
