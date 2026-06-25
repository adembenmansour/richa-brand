const jwt = require("jsonwebtoken");

// Middleware de vérification du jeton JWT pour sécuriser les routes d'administration
// Accepte le jeton via le header HTTP Authorization ou via le paramètre de requête 'token' (pour SSE)
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;

  const token = queryToken || 
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: "Accès non autorisé. Token manquant." });
  }

  try {
    // Validation du token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
};
