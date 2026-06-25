import React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DeliveryTimeline from "../components/DeliveryTimeline";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // Rediriger vers l'accueil si aucun état de commande n'est présent
  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="confirmation-page">
      <Navbar />

      {/* En-tête de page */}
      <header className="page-header">
        <span className="label-caps">COLLECTION 2026</span>
        <h1 className="page-header-title">CONFIRMATION</h1>
      </header>

      {/* Section principale */}
      <main className="confirmation-layout">
        
        {/* Colonne Gauche : Statut et Timeline */}
        <section className="confirmation-left">
          <div className="success-icon-box">✓</div>
          <span className="label-caps">COMMANDE CONFIRMÉE</span>
          
          <h2 className="confirmation-title">
            MERCI POUR<br />VOTRE COMMANDE
          </h2>
          <div className="confirmation-divider"></div>
          
          <p className="confirmation-text">
            Votre commande a été confirmée. Notre équipe vous contactera sous 24 heures pour organiser la livraison.
          </p>
          <p className="confirmation-meta-text">
            Livraison estimée : 2–4 jours ouvrables · Paiement à la livraison
          </p>

          {/* Ligne du temps verticale */}
          <DeliveryTimeline />

          {/* Contact Réseaux Sociaux */}
          <h3 className="contact-section-title">RESTEZ EN CONTACT</h3>
          <div className="confirmation-divider"></div>
          
          <p className="confirmation-text" style={{ marginBottom: "30px" }}>
            Pour toute question concernant votre commande, contactez-nous directement via nos réseaux sociaux.
          </p>

          {/* Grille de boutons de réseaux sociaux */}
          <div className="social-grid-buttons">
            <a
              href="https://wa.me/21620000000"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn-box primary"
            >
              <div className="social-btn-title">WHATSAPP</div>
              <div className="social-btn-subtitle">SUPPORT RAPIDE</div>
            </a>
            
            <a
              href="https://instagram.com/richa.tn"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn-box secondary"
            >
              <div className="social-btn-title">INSTAGRAM</div>
              <div className="social-btn-subtitle">@RICHA.TN</div>
            </a>
            
            <a
              href="https://facebook.com/richa.official"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn-box secondary"
            >
              <div className="social-btn-title">FACEBOOK</div>
              <div className="social-btn-subtitle">RICHA OFFICIAL</div>
            </a>
            
            <a
              href="https://tiktok.com/@richa.fashion"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn-box secondary"
            >
              <div className="social-btn-title">TIKTOK</div>
              <div className="social-btn-subtitle">@RICHA.FASHION</div>
            </a>
          </div>

          <p className="contact-footer-info">
            Email : contact@richa.tn · Téléphone : +216 20 000 000
          </p>
        </section>

        {/* Colonne Droite : Récapitulatif de la commande créée */}
        <section>
          <div className="order-summary-box">
            <h3 className="order-summary-box-title label-caps" style={{ color: "#000" }}>
              VOTRE COMMANDE #{order.orderId}
            </h3>
            
            <div className="order-summary-box-divider"></div>
            
            <div className="order-summary-box-items">
              {order.articles &&
                order.articles.map((item, idx) => (
                  <div className="order-summary-box-item" key={idx}>
                    <div>
                      <span className="order-summary-box-item-name">{item.nom}</span>
                      <span style={{ fontSize: "12px", color: "var(--color-gray-label)", marginLeft: "10px" }}>
                        Taille : {item.taille} | Qté : {item.quantite}
                      </span>
                    </div>
                    <span style={{ fontWeight: "bold" }}>{item.prix * item.quantite} DT</span>
                  </div>
                ))}
            </div>

            <div className="order-summary-box-divider"></div>

            <div className="order-summary-box-total">
              <span>TOTAL</span>
              <span>{order.total} DT</span>
            </div>
          </div>
        </section>

      </main>

      {/* Boutons en bas de page */}
      <section className="confirmation-bottom-buttons">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          ← RETOUR À L'ACCUEIL
        </button>
        
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/commande")}
        >
          NOUVELLE COMMANDE
        </button>
      </section>

      <Footer />
    </div>
  );
}
