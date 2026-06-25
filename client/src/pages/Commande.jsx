import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SizeGuideModal from "../components/SizeGuideModal";
import { useCart } from "../context/CartContext";

// Images du carrousel auto-scroll (6 images, répétées pour boucle infinie sans saut)
const carouselImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
  "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=800",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800",
  "https://images.unsplash.com/photo-1485231183945-fffde7cc051f?w=800"
];

// Duplication des images pour créer le défilement continu
const duplicatedImages = [...carouselImages, ...carouselImages];

// Liste des 24 gouvernorats tunisiens pour la sélection de la ville
const governorates = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
  "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

// Fallback statique robuste pour le produit
const FALLBACK_PRODUCT = {
  id: 1,
  badge: "NOUVEAU",
  categorie: "COLLECTION 2026",
  nom: "SET COMPLET RICHA",
  sousNom: "HAUT DRAPÉ + PANTALON WIDE-LEG",
  prix: 120,
  couleur: "BEIGE NATUREL",
  description: "Set deux pièces composé d'un haut drapé et d'un pantalon wide-leg en lin 100% naturel. Silhouette architecturale et fluide. Fait à la main en Tunisie.",
  tailles: ["XS", "S", "M", "L", "XL"],
  taillesDisponibles: ["S", "M", "L", "XL"],
  mannequin: "Mannequin : 170 cm de taille / Taille M",
  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
};

export default function Commande() {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();

  // États du produit
  const [product, setProduct] = useState(FALLBACK_PRODUCT);
  const [loading, setLoading] = useState(true);

  // Modale Guide des tailles
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // État de la taille sélectionnée
  const [selectedSize, setSelectedSize] = useState(null);

  // État d'affichage du tiroir/modal de commande
  const [showCheckoutDrawer, setShowCheckoutDrawer] = useState(false);

  // États du message d'erreur pour la taille
  const [sizeError, setSizeError] = useState("");

  // États du formulaire simple
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [gouvernorat, setGouvernorat] = useState("");
  const [adresse, setAdresse] = useState("");

  // États de validation
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // État de l'animation de lecture du carrousel (play/paused)
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(true);

  // Récupérer les produits du serveur
  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les produits");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setProduct(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de chargement API, utilisation du fallback statique :", err);
        setLoading(false);
      });
  }, []);

  // Actionneur du bouton ACHETER
  const handleAcheterClick = () => {
    setSizeError("");
    if (!selectedSize) {
      setSizeError("Veuillez sélectionner une taille");
      return;
    }
    // Ouvre le tiroir de commande
    setShowCheckoutDrawer(true);
  };

  // Validation et confirmation finale de la commande
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    // Vérifier les champs requis
    const tempErrors = {};
    if (!nom.trim()) {
      tempErrors.nom = "Le nom est obligatoire.";
    }
    if (!prenom.trim()) {
      tempErrors.prenom = "Le prénom est obligatoire.";
    }
    if (!telephone.trim()) {
      tempErrors.telephone = "Le numéro de téléphone est obligatoire.";
    } else if (!/^\d{8}$/.test(telephone.trim())) {
      tempErrors.telephone = "Le numéro doit comporter exactement 8 chiffres.";
    }
    if (!gouvernorat) {
      tempErrors.gouvernorat = "Veuillez sélectionner un gouvernorat.";
    }
    if (!adresse.trim()) {
      tempErrors.adresse = "L'adresse complète est obligatoire.";
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      // Préparation du payload
      const orderPayload = {
        nom: `${prenom.trim()} ${nom.trim()}`,
        telephone: telephone.trim(),
        gouvernorat,
        adresse: adresse.trim(),
        note: `Taille sélectionnée : ${selectedSize}`,
        articles: [{
          produitId: product.id ? product.id.toString() : "1",
          nom: product.nom,
          taille: selectedSize,
          quantite: 1,
          prix: product.prix
        }],
        total: product.prix
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.details || data.error || "Une erreur est survenue lors de la commande.");
        return;
      }

      // Redirection immédiate
      clearCart();
      setShowCheckoutDrawer(false);
      navigate("/confirmation", { state: { order: data } });

    } catch (err) {
      console.error(err);
      setSubmitError("Erreur de connexion au serveur. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bershka-page">
      
      {/* SECTION 1 — NAVBAR */}
      <nav className="bershka-navbar">
        <a href="/" className="bershka-logo">RICHA</a>
      </nav>

      {/* SECTION 2 & 3 — CARROUSEL + DROITE CARD */}
      <div className="bershka-layout">
        
        {/* Carrousel horizontal défilant automatiquement */}
        <div className="bershka-carousel-section">
          <div
            className="bershka-carousel-track"
            style={{ animationPlayState: isCarouselPlaying ? "running" : "paused" }}
          >
            {duplicatedImages.map((imgUrl, index) => (
              <img
                key={index}
                src={imgUrl}
                alt={`Slide ${index}`}
                className="bershka-carousel-image"
              />
            ))}
          </div>

          {/* Contrôle de lecture (style Bershka) */}
          <div
            className="bershka-carousel-controls"
            onClick={() => setIsCarouselPlaying(!isCarouselPlaying)}
          >
            <span>[ ]</span>
            <span>{isCarouselPlaying ? "PAUSE" : "PLAY"}</span>
          </div>
        </div>

        {/* Fiche produit à côté des images (Bershka overlay style) */}
        <div className="bershka-details-card">
          
          <div className="bershka-details-header">
            <h1 className="bershka-product-title">{product.nom}</h1>
            <span className="bershka-product-price">{product.prix} DT</span>
          </div>

          <div className="bershka-product-ref">
            {product.couleur || "BEIGE NATUREL"} · Réf. 2026/012/800
          </div>

          {/* Sélecteur de tailles */}
          <div>
            <div className="bershka-tailles-header">
              <span className="bershka-tailles-title">TAILLES</span>
              <button
                type="button"
                className="bershka-size-guide-btn"
                onClick={() => setIsSizeGuideOpen(true)}
              >
                AFFICHER LES DIMENSIONS
              </button>
            </div>

            <div className="bershka-sizes-pills">
              {product.tailles.map((size) => {
                const isAvailable = product.taillesDisponibles.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    className={`bershka-size-pill ${selectedSize === size ? "selected" : ""} ${!isAvailable ? "sold-out" : ""}`}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedSize(size);
                        setSizeError("");
                      }
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <p className="bershka-mannequin">
              {product.mannequin || "Mannequin : 170 cm de taille / Taille M"}
            </p>
          </div>

          {/* Message d'erreur de taille */}
          {sizeError && <p className="product-error-msg" style={{ marginBottom: "12px" }}>{sizeError}</p>}

          {/* Bouton Acheter très visible */}
          <button
            type="button"
            className="bershka-btn-acheter"
            onClick={handleAcheterClick}
          >
            ACHETER
          </button>

          {/* Info livraison simple */}
          <div className="bershka-delivery-info">
            <div className="bershka-delivery-line">
              <span>🏪</span>
              <span>Retrait en magasin GRATUIT</span>
            </div>
            <div className="bershka-delivery-line">
              <span>🚚</span>
              <span>Livraison standard GRATUITE partout en Tunisie</span>
            </div>
          </div>

        </div>

      </div>

      {/* TIROIR DE COMMANDE SIMPLE (SLIDE-IN BERSHKA EXPERIENECE) */}
      {showCheckoutDrawer && (
        <div className="checkout-overlay-premium" onClick={() => setShowCheckoutDrawer(false)}>
          <div className="checkout-drawer-premium" onClick={(e) => e.stopPropagation()}>
            
            <div className="drawer-header">
              <h3>FINALISER LA COMMANDE</h3>
              <button
                className="drawer-close-btn"
                type="button"
                onClick={() => setShowCheckoutDrawer(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleOrderSubmit}>
              
              {/* Prénom */}
              <div className="drawer-form-group">
                <label htmlFor="drawer-prenom">PRÉNOM *</label>
                <input
                  id="drawer-prenom"
                  type="text"
                  placeholder="Votre prénom"
                  className="drawer-input"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
                {errors.prenom && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.prenom}</p>}
              </div>

              {/* Nom */}
              <div className="drawer-form-group">
                <label htmlFor="drawer-nom">NOM *</label>
                <input
                  id="drawer-nom"
                  type="text"
                  placeholder="Votre nom de famille"
                  className="drawer-input"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
                {errors.nom && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.nom}</p>}
              </div>

              {/* Téléphone */}
              <div className="drawer-form-group">
                <label htmlFor="drawer-tel">TÉLÉPHONE *</label>
                <div className="drawer-tel-wrapper">
                  <span className="drawer-tel-prefix">+216</span>
                  <input
                    id="drawer-tel"
                    type="tel"
                    placeholder="XXXXXXXX"
                    maxLength="8"
                    className="drawer-input"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                {errors.telephone && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.telephone}</p>}
              </div>

              {/* Ville (Gouvernorat) */}
              <div className="drawer-form-group">
                <label htmlFor="drawer-gouvernorat">VILLE / GOUVERNORAT *</label>
                <select
                  id="drawer-gouvernorat"
                  className="drawer-input"
                  value={gouvernorat}
                  onChange={(e) => setGouvernorat(e.target.value)}
                >
                  <option value="">Sélectionner votre ville</option>
                  {governorates.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
                {errors.gouvernorat && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.gouvernorat}</p>}
              </div>

              {/* Adresse */}
              <div className="drawer-form-group">
                <label htmlFor="drawer-adresse">ADRESSE COMPLÈTE *</label>
                <textarea
                  id="drawer-adresse"
                  placeholder="Numéro de rue, appartement, ville..."
                  className="drawer-input"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                />
                {errors.adresse && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.adresse}</p>}
              </div>

              {/* Récapitulatif simple */}
              <div className="drawer-recap-box">
                <span className="drawer-recap-title">VOTRE SÉLECTION :</span>
                <div className="drawer-recap-item">
                  <span>{product.nom} (Taille {selectedSize})</span>
                  <span>{product.prix} DT</span>
                </div>
              </div>

              {/* Checkbox cash on delivery */}
              <div className="drawer-payment-card">
                <input type="checkbox" checked disabled />
                <div>
                  <span className="drawer-payment-title">PAIEMENT À LA LIVRAISON — CASH</span>
                  <span className="drawer-payment-sub">DISPONIBLE PARTOUT EN TUNISIE</span>
                </div>
              </div>

              {submitError && <p className="product-error-msg" style={{ marginBottom: "15px" }}>{submitError}</p>}

              {/* Bouton de validation */}
              <button
                type="submit"
                className="drawer-confirm-btn"
                disabled={submitting}
              >
                {submitting ? "CONFIRMATION EN COURS..." : `CONFIRMER LA COMMANDE (${product.prix} DT) →`}
              </button>

              <p className="drawer-secure-text">
                🔒 COMMANDE SÉCURISÉE · LIVRAISON 2–4 JOURS
              </p>

            </form>

          </div>
        </div>
      )}

      {/* Guide des tailles modale */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

    </div>
  );
}
