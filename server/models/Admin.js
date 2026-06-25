const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// Définition du schéma pour l'administrateur
const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "L'adresse email est requise"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est requis"]
  },
  nom: {
    type: String,
    default: "Administrateur RICHA"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hachage du mot de passe avec bcrypt avant la sauvegarde en base de données
AdminSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Méthode pour comparer un mot de passe candidat avec le mot de passe haché
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exportation du modèle Mongoose "Admin"
module.exports = mongoose.model("Admin", AdminSchema);
