const router  = require("express").Router();
const Media   = require("../models/Media");
const auth    = require("../middleware/authMiddleware");

// GET /api/admin/media — Récupérer tous les médias (espace admin)
router.get("/", auth, async (req, res) => {
  try {
    const { section, type } = req.query;
    let filter = {};
    if (section) filter.section = section;
    if (type)    filter.type    = type;
    
    const medias = await Media.find(filter).sort({ ordre: 1, uploadedAt: -1 });
    res.json(medias);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des médias" });
  }
});

// GET /api/media/active — Récupérer les médias actifs (PUBLIC, sans authentification)
// Utilisé par la Landing Page pour charger ses vidéos/images dynamiquement
router.get("/active", async (req, res) => {
  try {
    const { section, type } = req.query;
    let filter = { actif: true };
    if (section) filter.section = section;
    if (type)    filter.type    = type;
    
    const medias = await Media.find(filter).sort({ ordre: 1 });
    res.json(medias);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des médias actifs" });
  }
});

// POST /api/admin/media — Ajouter un nouveau média (URL)
router.post("/", auth, async (req, res) => {
  try {
    const { type, section, url, label, ordre } = req.body;
    if (!type || !section || !url) {
      return res.status(400).json({ error: "Le type, la section et l'url sont requis." });
    }
    
    const media = new Media({ 
      type, 
      section, 
      url, 
      label: label || "", 
      ordre: ordre || 0 
    });
    await media.save();
    
    res.json({ success: true, media });
  } catch (err) {
    res.status(400).json({ error: "Données invalides", details: err.message });
  }
});

// PATCH /api/admin/media/:id — Modifier un média (actif, ordre, label, etc.)
router.patch("/:id", auth, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!media) {
      return res.status(404).json({ error: "Média introuvable." });
    }
    res.json({ success: true, media });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du média" });
  }
});

// DELETE /api/admin/media/:id — Supprimer un média du catalogue
router.delete("/:id", auth, async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) {
      return res.status(404).json({ error: "Média introuvable." });
    }
    res.json({ success: true, message: "Média supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression du média" });
  }
});

module.exports = router;
