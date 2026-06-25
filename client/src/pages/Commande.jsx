import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
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

// Images pour la galerie (3 miniatures)
const galleryImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
  "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=800"
];

// Liste complète des 24 gouvernorats tunisiens
const governorates = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
  "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

// Fallback statique robuste pour le produit au cas où l'API échoue ou est lente
const FALLBACK_PRODUCT = {
  id: 1,
  badge: "NOUVEAU",
  categorie: "COLLECTION 2026",
  nom: "SET COMPLET RICHA",
  sousNom: "HAUT DRAPÉ + PANTALON WIDE-LEG",
  prix: 120,
  couleur: "BEIGE NATUREL",
  description: "Set deux pièces composé d'un haut drapé et d'un pantalon wide-leg en lin 100% naturel. Silhouette architecturale et fluide. Fait à la main en Tunisie.",
  composition: "100% Lin naturel · Lavage à la main recommandé · Ne pas mettre au sèche-linge · Repassage à basse température",
  tailles: ["XS", "S", "M", "L", "XL"],
  taillesDisponibles: ["S", "M", "L", "XL"],
  mannequin: "Mannequin : 170 cm de taille / Taille M",
  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
};

export default function Commande() {
  const navigate = useNavigate();
  const { items, addToCart, totalPrice, clearCart } = useCart();

  // États du produit
  const [product, setProduct] = useState(FALLBACK_PRODUCT);
  const [loading, setLoading] = useState(true);

  // Modale Guide des tailles
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // État de l'image principale de la galerie
  const [mainImage, setMainImage] = useState(galleryImages[0]);

  // État pour la taille sélectionnée localement
  const [selectedSize, setSelectedSize] = useState(null);

  // Accordéon infos produit
  const [accordionDetails, setAccordionDetails] = useState(false);
  const [accordionCare, setAccordionCare] = useState(false);

  // États pour les notifications de panier (messages rouge/vert)
  const [sizeError, setSizeError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // États du formulaire
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [gouvernorat, setGouvernorat] = useState("");
  const [adresse, setAdresse] = useState("");
  const [note, setNote] = useState("");

  // États de validation
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Récupérer le produit unique depuis le serveur
  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les produits");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          // On prend le premier produit (qui est notre unique SET COMPLET RICHA)
          setProduct(data[0]);
          // Met à jour l'image de départ
          setMainImage(data[0].image || galleryImages[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de chargement API, utilisation du fallback statique :", err);
        setLoading(false);
      });
  }, []);

  // Défilement fluide vers une section par ID
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Ajout au panier
  const handleAddToCart = (directOrder = false) => {
    setSizeError("");
    setSuccessMessage("");

    if (!selectedSize) {
      setSizeError("Veuillez sélectionner une taille");
      return false;
    }

    // Ajoute au panier global
    addToCart({
      id: product.id || 1,
      nom: product.nom,
      prix: product.prix,
      taille: selectedSize,
      image: mainImage
    });

    setSuccessMessage("✓ Article ajouté — Complétez votre commande ci-dessous");
    
    // Scroll fluide vers le formulaire de livraison
    setTimeout(() => {
      scrollToSection("formulaire");
    }, 100);

    return true;
  };

  // Validation et envoi du formulaire de commande
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    // Vérifier que le panier contient bien un article
    if (items.length === 0) {
      setSubmitError("Veuillez d'abord sélectionner une taille");
      scrollToSection("tailles-section");
      return;
    }

    // Validation des champs obligatoires
    const tempErrors = {};
    if (!nom.trim()) {
      tempErrors.nom = "Le nom complet est obligatoire.";
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

    // Arrêter s'il y a des erreurs
    if (Object.keys(tempErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          telephone: telephone.trim(),
          gouvernorat,
          adresse: adresse.trim(),
          note: note.trim(),
          articles: items.map(item => ({
            produitId: item.id ? item.id.toString() : "1",
            nom: item.nom,
            taille: item.taille,
            quantite: item.qte,
            prix: item.prix
          })),
          total: totalPrice
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.details || data.error || "Une erreur est survenue lors de la commande.");
        return;
      }

      // Vider le panier et rediriger vers la page confirmation
      clearCart();
      navigate("/confirmation", { state: { order: data } });

    } catch (err) {
      console.error(err);
      setSubmitError("Erreur de connexion au serveur. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // Récupère l'article du panier s'il existe
  const cartItem = items.length > 0 ? items[0] : null;

  return (
    <div className="commande-page-premium">
      
      {/* SECTION 1 — NAVBAR */}
      <nav className="product-navbar">
        <a href="/" className="product-navbar-logo">RICHA</a>
      </nav>

      {/* SECTION 2 — CARROUSEL HORIZONTAL AUTO-SCROLL */}
      <div className="carousel-container">
        <div className="carousel-track">
          {duplicatedImages.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={`Richa Slide ${index}`}
              className="carousel-image"
            />
          ))}
        </div>
      </div>

      {/* SECTION 3 — FICHE PRODUIT (2 colonnes) */}
      <div className="product-layout">
        
        {/* Colonne gauche : Image principale + miniatures */}
        <div className="product-gallery">
          <div className="product-main-img-container">
            <span className="product-nouveau-badge">{product.badge}</span>
            <img
              src={mainImage}
              alt={product.nom}
              className="product-main-img"
            />
          </div>

          <div className="product-thumbnails">
            {galleryImages.map((imgUrl, index) => (
              <img
                key={index}
                src={imgUrl}
                alt={`Miniature ${index + 1}`}
                className={`product-thumbnail ${mainImage === imgUrl ? "active" : ""}`}
                onClick={() => setMainImage(imgUrl)}
              />
            ))}
          </div>
        </div>

        {/* Colonne droite : Informations produit */}
        <div className="product-info-col">
          <span className="product-category">{product.categorie}</span>
          <h1 className="product-name-title">{product.nom}</h1>
          <p className="product-subtitle">{product.sousNom || "HAUT DRAPÉ + PANTALON WIDE-LEG"}</p>
          
          <h2 className="product-price-large">{product.prix} DT</h2>
          <p className="product-subprice">Livraison gratuite partout en Tunisie</p>

          <div className="product-separator"></div>

          {/* Couleur */}
          <div className="product-color-section">
            <div className="product-color-label">COULEUR</div>
            <div className="product-color-value">{product.couleur || "BEIGE NATUREL"}</div>
          </div>

          {/* Tailles section */}
          <div id="tailles-section">
            <div className="product-size-header">
              <span className="product-size-label">TAILLES</span>
              <button
                type="button"
                className="product-size-guide-link"
                onClick={() => setIsSizeGuideOpen(true)}
              >
                AFFICHER LES DIMENSIONS
              </button>
            </div>

            <div className="product-size-pills">
              {product.tailles.map((size) => {
                const isAvailable = product.taillesDisponibles.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    className={`product-size-pill ${selectedSize === size ? "selected" : ""} ${!isAvailable ? "sold-out" : ""}`}
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

            <p className="product-mannequin">{product.mannequin || "Mannequin : 170 cm de taille / Taille M"}</p>
          </div>

          {/* Messages d'erreur ou succès */}
          {sizeError && <p className="product-error-msg">{sizeError}</p>}
          {successMessage && <p className="product-success-msg">{successMessage}</p>}

          {/* Actions d'ajout au panier */}
          <button
            type="button"
            className="product-add-btn"
            onClick={() => handleAddToCart(false)}
          >
            AJOUTER AU PANIER
          </button>

          <button
            type="button"
            className="product-direct-btn"
            onClick={() => handleAddToCart(true)}
          >
            COMMANDER DIRECTEMENT
          </button>

          <div className="product-separator"></div>

          {/* Informations livraison */}
          <div className="product-delivery-info">
            <div className="product-delivery-line">
              <span>🏪</span>
              <span>Retrait en magasin GRATUIT</span>
            </div>
            <div className="product-delivery-line">
              <span>🚚</span>
              <span>Livraison standard à domicile GRATUITE partout en Tunisie</span>
            </div>
          </div>

          {/* Description et composition (accordéon) */}
          <div className="product-accordion-item">
            <div
              className="product-accordion-header"
              onClick={() => setAccordionDetails(!accordionDetails)}
            >
              <span>DÉTAILS DU PRODUIT</span>
              <span>{accordionDetails ? "−" : "+"}</span>
            </div>
            {accordionDetails && (
              <div className="product-accordion-content">
                {product.description}
              </div>
            )}
          </div>

          <div className="product-accordion-item">
            <div
              className="product-accordion-header"
              onClick={() => setAccordionCare(!accordionCare)}
            >
              <span>COMPOSITION & ENTRETIEN</span>
              <span>{accordionCare ? "−" : "+"}</span>
            </div>
            {accordionCare && (
              <div className="product-accordion-content">
                {product.composition || "100% Lin naturel · Lavage à la main recommandé · Ne pas mettre au sèche-linge · Repassage à basse température"}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* SECTION 4 — FORMULAIRE COMMANDE INTÉGRÉ */}
      <div className="order-form-container" id="formulaire">
        
        <header className="order-form-header">
          <span className="order-form-step">ÉTAPE FINALE</span>
          <h2 className="order-form-title">INFORMATIONS DE LIVRAISON</h2>
        </header>

        <div className="order-form-layout">
          
          {/* Formulaire à gauche */}
          <form onSubmit={handleOrderSubmit}>
            
            {/* Nom Complet */}
            <div className="form-group-premium">
              <label htmlFor="premium-nom">NOM COMPLET *</label>
              <input
                id="premium-nom"
                type="text"
                placeholder="Votre nom complet"
                className="form-input-premium"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
              {errors.nom && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.nom}</p>}
            </div>

            {/* Téléphone */}
            <div className="form-group-premium">
              <label htmlFor="premium-tel">TÉLÉPHONE *</label>
              <div className="tel-wrapper-premium">
                <span className="tel-prefix-premium">+216</span>
                <input
                  id="premium-tel"
                  type="tel"
                  placeholder="XXXXXXXX"
                  maxLength="8"
                  className="form-input-premium"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {errors.telephone && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.telephone}</p>}
            </div>

            {/* Gouvernorat */}
            <div className="form-group-premium">
              <label htmlFor="premium-gouvernorat">GOUVERNORAT *</label>
              <select
                id="premium-gouvernorat"
                className="form-input-premium"
                value={gouvernorat}
                onChange={(e) => setGouvernorat(e.target.value)}
              >
                <option value="">Sélectionner votre gouvernorat</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
              {errors.gouvernorat && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.gouvernorat}</p>}
            </div>

            {/* Adresse */}
            <div className="form-group-premium">
              <label htmlFor="premium-adresse">ADRESSE COMPLÈTE *</label>
              <textarea
                id="premium-adresse"
                placeholder="Numéro de rue, appartement, ville, code postal"
                className="form-input-premium"
                style={{ minHeight: "80px", resize: "vertical" }}
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
              {errors.adresse && <p className="product-error-msg" style={{ marginTop: "4px" }}>{errors.adresse}</p>}
            </div>

            {/* Note optionnelle */}
            <div className="form-group-premium">
              <label htmlFor="premium-note">NOTE (OPTIONNEL)</label>
              <textarea
                id="premium-note"
                placeholder="Instructions pour la livraison (ex: code de porte, horaires...)"
                className="form-input-premium"
                style={{ minHeight: "60px", resize: "vertical" }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Récapitulatif commande au-dessus du bouton */}
            <div className="order-form-recap-box">
              <span className="order-form-recap-title">VOTRE SÉLECTION :</span>
              {!cartItem ? (
                <p className="order-form-recap-empty">
                  Aucun article —{" "}
                  <a onClick={() => scrollToSection("tailles-section")}>choisissez une taille ci-dessus</a>
                </p>
              ) : (
                <div className="order-form-recap-item">
                  <span>{cartItem.nom} (Taille {cartItem.taille})</span>
                  <span>{cartItem.prix} DT</span>
                </div>
              )}
            </div>

            {/* Checkbox Paiement à la livraison */}
            <div className="payment-checkbox-card">
              <input type="checkbox" checked disabled />
              <div>
                <span className="payment-checkbox-title">PAIEMENT À LA LIVRAISON — CASH UNIQUEMENT</span>
                <span className="payment-checkbox-sub">DISPONIBLE PARTOUT EN TUNISIE</span>
              </div>
            </div>

            {submitError && <p className="product-error-msg" style={{ marginBottom: "15px" }}>{submitError}</p>}

            {/* Bouton de confirmation */}
            <button
              type="submit"
              className="order-confirm-btn"
              disabled={submitting}
            >
              {submitting ? "CONFIRMATION EN COURS..." : "CONFIRMER LA COMMANDE →"}
            </button>

            <p className="order-confirm-secure-text">
              🔒 COMMANDE SÉCURISÉE · LIVRAISON 2–4 JOURS OUVRABLES
            </p>

          </form>

          {/* Récapitulatif collant sombre à droite */}
          <div className="order-sticky-recap">
            <span className="order-sticky-label">RÉCAPITULATIF</span>
            <h3 className="order-sticky-title">VOTRE COMMANDE</h3>
            
            <div className="order-sticky-separator"></div>

            {/* Article */}
            {cartItem ? (
              <div className="order-sticky-item">
                <div>
                  <span className="order-sticky-item-name">{cartItem.nom}</span>
                  <span className="order-sticky-item-desc" style={{ display: "block" }}>
                    Taille : {cartItem.taille} | Qté : {cartItem.qte}
                  </span>
                </div>
                <span className="order-sticky-item-price">{cartItem.prix} DT</span>
              </div>
            ) : (
              <p style={{ color: "#AAA", fontStyle: "italic", fontSize: "13px" }}>
                Aucun article sélectionné.
              </p>
            )}

            <div className="order-sticky-separator"></div>

            {/* Lignes de prix */}
            <div className="order-sticky-row">
              <span>SOUS-TOTAL</span>
              <span>{cartItem ? totalPrice : 0} DT</span>
            </div>
            <div className="order-sticky-row">
              <span>LIVRAISON</span>
              <span style={{ fontWeight: "bold", color: "#FFF" }}>GRATUITE</span>
            </div>

            <div className="order-sticky-separator"></div>

            <div className="order-sticky-row total-row">
              <span>TOTAL</span>
              <span>{cartItem ? totalPrice : 0} DT</span>
            </div>

            {/* 4 Pictogrammes en grille */}
            <div className="order-sticky-badges">
              <div className="order-sticky-badge">
                <span>🚚</span>
                <span>Livraison gratuite</span>
              </div>
              <div className="order-sticky-badge">
                <span>💳</span>
                <span>Paiement livraison</span>
              </div>
              <div className="order-sticky-badge">
                <span>🌿</span>
                <span>Lin naturel</span>
              </div>
              <div className="order-sticky-badge">
                <span>⭐</span>
                <span>Édition limitée</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 5 — BANNIÈRE 4 GARANTIES */}
      <section className="guarantees-banner-premium">
        <div className="guarantees-cell-premium">
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>🚚</div>
          <h3 className="guarantees-title-premium">LIVRAISON RAPIDE</h3>
          <span className="guarantees-sub-premium">PARTOUT EN TUNISIE</span>
        </div>
        <div className="guarantees-cell-premium">
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>💳</div>
          <h3 className="guarantees-title-premium">PAIEMENT LIVRAISON</h3>
          <span className="guarantees-sub-premium">AUCUN RISQUE</span>
        </div>
        <div className="guarantees-cell-premium">
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>🌿</div>
          <h3 className="guarantees-title-premium">LIN NATUREL</h3>
          <span className="guarantees-sub-premium">100% QUALITÉ PREMIUM</span>
        </div>
        <div className="guarantees-cell-premium">
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⭐</div>
          <h3 className="guarantees-title-premium">ÉDITION LIMITÉE</h3>
          <span className="guarantees-sub-premium">STOCK LIMITÉ</span>
        </div>
      </section>

      {/* Guide des tailles modale */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* SECTION 6 — FOOTER */}
      <Footer onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />

    </div>
  );
}
