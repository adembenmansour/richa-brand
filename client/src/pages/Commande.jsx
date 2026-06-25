import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SizeGuideModal from "../components/SizeGuideModal";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/CartContext";

export default function Commande() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  // États pour les produits de l'API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);

  // État de la modale du guide des tailles
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // États du formulaire de livraison
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [gouvernorat, setGouvernorat] = useState("");
  const [adresse, setAdresse] = useState("");
  const [note, setNote] = useState("");

  // États de validation et de soumission
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Récupérer les produits du serveur et mapper les images dynamiques actives
  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les produits");
        return res.json();
      }),
      fetch("/api/media/active?type=image").then((res) => {
        if (!res.ok) return []; // Fallback silencieux en cas d'erreur de chargement média
        return res.json();
      })
    ])
      .then(([productsData, mediaData]) => {
        const updatedProducts = productsData.map((product) => {
          let sectionName = "";
          // Mapper le nom du produit vers sa section média correspondante
          if (product.nom.toLowerCase().includes("set") || product.nom.toLowerCase().includes("complet")) {
            sectionName = "produit_set";
          } else if (product.nom.toLowerCase().includes("pull")) {
            sectionName = "produit_pull";
          } else if (product.nom.toLowerCase().includes("pantalon")) {
            sectionName = "produit_pantalon";
          }

          // Chercher s'il existe une image active pour cette section de produit
          const matchingMedia = mediaData.find(m => m.section === sectionName);
          if (matchingMedia) {
            return { ...product, image: matchingMedia.url };
          }
          return product;
        });

        setProducts(updatedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorProducts("Erreur lors de la récupération des produits.");
        setLoading(false);
      });
  }, []);

  const governorates = [
    "Ariana",
    "Béja",
    "Ben Arous",
    "Bizerte",
    "Gabès",
    "Gafsa",
    "Jendouba",
    "Kairouan",
    "Kasserine",
    "Kébili",
    "Le Kef",
    "Mahdia",
    "La Manouba",
    "Médenine",
    "Monastir",
    "Nabeul",
    "Sfax",
    "Sidi Bouzid",
    "Siliana",
    "Sousse",
    "Tataouine",
    "Tozeur",
    "Tunis",
    "Zaghouan",
  ];

  // Gestion de la soumission de la commande
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const cart = { items };
    const setError = setSubmitError;

    // Avant le fetch, vérifier que le panier n'est pas vide
    if (!cart.items || cart.items.length === 0) {
      setError("Veuillez ajouter au moins un article avant de confirmer.");
      return;
    }

    // Validation des champs
    const tempErrors = {};
    if (!nom.trim()) tempErrors.nom = "Le nom complet est obligatoire.";

    // Téléphone tunisien basique (8 chiffres)
    if (!telephone.trim()) {
      tempErrors.telephone = "Le numéro de téléphone est obligatoire.";
    } else if (!/^\d{8}$/.test(telephone.trim())) {
      tempErrors.telephone = "Le numéro doit comporter exactement 8 chiffres.";
    }

    if (!gouvernorat) tempErrors.gouvernorat = "Veuillez sélectionner un gouvernorat.";
    if (!adresse.trim()) tempErrors.adresse = "L'adresse complète est obligatoire.";

    setErrors(tempErrors);

    // Si des erreurs existent, on arrête la soumission (les erreurs s'affichent en rouge sous chaque champ)
    if (Object.keys(tempErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    const formData = {
      nom: nom.trim(),
      telephone: telephone.trim(),
      gouvernorat,
      adresse: adresse.trim(),
      note: note.trim()
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,           // ← champ "NOM COMPLET"
          telephone: formData.telephone,     // ← champ "TÉLÉPHONE" sans le +216
          gouvernorat: formData.gouvernorat,   // ← valeur du select
          adresse: formData.adresse,       // ← textarea adresse
          note: formData.note || "",    // ← textarea note (peut être vide)
          articles: cart.items.map(item => ({
            produitId: item.id?.toString() || "",
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
        // Afficher le détail de l'erreur retourné par l'API
        setError(data.details || data.error || "Erreur lors de la commande.");
        return;
      }

      // Succès
      clearCart();
      navigate("/confirmation", { state: { order: data } });

    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="commande-page">
      <Navbar />

      {/* En-tête de la page */}
      <header className="page-header">
        <span className="label-caps">COLLECTION 2026</span>
        <div className="page-header-row">
          <h1 className="page-header-title">SET & COMMANDE</h1>
          <button
            type="button"
            className="btn btn-secondary page-header-btn"
            onClick={() => setIsSizeGuideOpen(true)}
          >
            ○ VOIR LES TAILLES
          </button>
        </div>
      </header>

      {/* Section 1 : Catalogue produits */}
      <section>
        {loading ? (
          <div style={{ padding: "80px", textAlign: "center", fontSize: "16px", fontWeight: "bold" }}>
            CHARGEMENT DES PRODUITS...
          </div>
        ) : errorProducts ? (
          <div style={{ padding: "80px", textAlign: "center", color: "var(--color-error)", fontWeight: "bold" }}>
            {errorProducts}
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                style={{ animationDelay: `${idx * 150}ms` }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 2 : Tableau récapitulatif de commande (panier) */}
      <OrderSummary />

      {/* Section 3 : Formulaire de livraison & Résumé visuel */}
      <section className="checkout-layout">

        {/* Formulaire de livraison (gauche) */}
        <div className="checkout-form-section" id="delivery-form-section">
          <span className="label-caps">ÉTAPE FINALE</span>
          <h2 className="checkout-form-title">INFORMATIONS DE LIVRAISON</h2>

          <form onSubmit={handleCheckoutSubmit}>
            {/* Champ NOM COMPLET */}
            <div className="form-group">
              <label className="label-caps" htmlFor="nom">
                NOM COMPLET *
              </label>
              <input
                type="text"
                id="nom"
                placeholder="Votre nom complet"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
              {errors.nom && (
                <p style={{ color: "var(--color-error)", fontSize: "12px", marginTop: "4px" }}>
                  {errors.nom}
                </p>
              )}
            </div>

            {/* Champ TÉLÉPHONE */}
            <div className="form-group">
              <label className="label-caps" htmlFor="telephone">
                TÉLÉPHONE *
              </label>
              <div className="tel-input-wrapper">
                <span className="tel-prefix">+216</span>
                <input
                  className="tel-input"
                  type="tel"
                  id="telephone"
                  placeholder="XXXXXXXX"
                  maxLength="8"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {errors.telephone && (
                <p style={{ color: "var(--color-error)", fontSize: "12px", marginTop: "4px" }}>
                  {errors.telephone}
                </p>
              )}
            </div>

            {/* Champ GOUVERNORAT */}
            <div className="form-group">
              <label className="label-caps" htmlFor="gouvernorat">
                GOUVERNORAT *
              </label>
              <select
                id="gouvernorat"
                value={gouvernorat}
                onChange={(e) => setGouvernorat(e.target.value)}
              >
                <option value="">Sélectionner votre gouvernorat</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
              {errors.gouvernorat && (
                <p style={{ color: "var(--color-error)", fontSize: "12px", marginTop: "4px" }}>
                  {errors.gouvernorat}
                </p>
              )}
            </div>

            {/* Champ ADRESSE */}
            <div className="form-group">
              <label className="label-caps" htmlFor="adresse">
                ADRESSE COMPLÈTE *
              </label>
              <textarea
                id="adresse"
                placeholder="Numéro de rue, appartement, ville, code postal"
                style={{ minHeight: "80px" }}
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
              {errors.adresse && (
                <p style={{ color: "var(--color-error)", fontSize: "12px", marginTop: "4px" }}>
                  {errors.adresse}
                </p>
              )}
            </div>

            {/* Champ NOTE */}
            <div className="form-group">
              <label className="label-caps" htmlFor="note">
                NOTE (OPTIONNEL)
              </label>
              <textarea
                id="note"
                placeholder="Instructions pour la livraison (ex: code de porte, horaires d'appel...)"
                style={{ minHeight: "60px" }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Checkbox Moyen de paiement */}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked disabled />
                <span className="checkbox-text">
                  PAIEMENT À LA LIVRAISON — CASH UNIQUEMENT
                  <span className="checkbox-subtext">
                    DISPONIBLE PARTOUT EN TUNISIE
                  </span>
                </span>
              </label>
            </div>

            {submitError && (
              <p style={{ color: "var(--color-error)", fontWeight: "bold", marginBottom: "15px" }}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary checkout-submit-btn"
              disabled={submitting}
            >
              {submitting ? "CONFIRMATION EN COURS..." : "CONFIRMER LA COMMANDE →"}
            </button>

            <p className="checkout-footer-text">
              COMMANDE SÉCURISÉE · LIVRAISON 2–4 JOURS OUVRABLES
            </p>
          </form>
        </div>

        {/* Résumé de commande à droite (sticky) */}
        <div className="checkout-summary-sticky">
          <h3 className="checkout-summary-title">RÉCAPITULATIF — VOTRE COMMANDE</h3>
          <div className="checkout-summary-divider"></div>

          <div className="checkout-summary-items">
            {items.length === 0 ? (
              <p style={{ color: "#AAAAAA", fontStyle: "italic" }}>
                Aucun article dans votre panier.
              </p>
            ) : (
              items.map((item) => (
                <div className="checkout-summary-item" key={`${item.id}-${item.taille}`}>
                  <div>
                    <p className="checkout-summary-item-name">{item.nom}</p>
                    <p className="checkout-summary-item-desc">
                      Taille : {item.taille} | Qté : {item.qte}
                    </p>
                  </div>
                  <span className="checkout-summary-item-price">
                    {item.prix * item.qte} DT
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-summary-row">
            <span>SOUS-TOTAL</span>
            <span>{totalPrice} DT</span>
          </div>
          <div className="checkout-summary-row">
            <span>LIVRAISON</span>
            <span style={{ fontWeight: "bold" }}>GRATUITE</span>
          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-summary-row total">
            <span>TOTAL</span>
            <span>{totalPrice} DT</span>
          </div>

          {/* Grille de 4 pictos */}
          <div className="checkout-summary-badge-grid">
            <div className="checkout-summary-badge">
              <span>🚚</span>
              <span>LIVRAISON GRATUITE</span>
            </div>
            <div className="checkout-summary-badge">
              <span>💳</span>
              <span>PAIEMENT LIVRAISON</span>
            </div>
            <div className="checkout-summary-badge">
              <span>🌿</span>
              <span>LIN NATUREL</span>
            </div>
            <div className="checkout-summary-badge">
              <span>⭐</span>
              <span>ÉDITION LIMITÉE</span>
            </div>
          </div>
        </div>

      </section>

      {/* Modal du guide des tailles */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <Footer onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
    </div>
  );
}
