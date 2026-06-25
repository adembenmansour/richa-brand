import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Ticker from "../components/Ticker";
import Footer from "../components/Footer";

export default function Landing() {
  // États locaux avec valeurs par défaut (fallbacks)
  const [heroVideo, setHeroVideo] = useState(
    "https://player.vimeo.com/external/435674703.sd.mp4?s=7f60706240d4653e00344d56af71e2ef64d78ab4&profile_id=165&oauth2_token_id=57447761"
  );
  const [imageSet, setImageSet] = useState(
    "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800"
  );

  // Charger les médias de la page d'accueil dynamiquement depuis l'API active
  useEffect(() => {
    // Charger la vidéo hero
    fetch("/api/media/active?section=hero&type=video")
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) setHeroVideo(data[0].url);
      })
      .catch(() => {});

    // Charger l'image signature du Set RICHA
    fetch("/api/media/active?section=produit_set&type=image")
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) setImageSet(data[0].url);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="landing-page">
      <Navbar />

      {/* Section Hero */}
      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          src={heroVideo}
        />
      </section>

      {/* Ticker Marquee */}
      <Ticker />

      {/* Section Set RICHA (split layout) */}
      <section className="split-layout">
        <div className="split-left">
          <span className="new-badge">NOUVEAU</span>
          <img
            src={imageSet}
            alt="Femme en tenue en lin beige RICHA"
            className="animate-fade-in"
          />
        </div>
        
        <div className="split-right">
          <span className="label-caps">PIÈCE SIGNATURE</span>
          <h2 className="split-right-title">
            SET<br />RICHA
          </h2>
          <div className="split-right-divider"></div>
          <p className="split-right-text">
            Taillé dans un lin 100% naturel, le Set RICHA redéfinit
            l'élégance quotidienne. Haut drapé et pantalon wide-leg conçus pour
            une silhouette architecturale et fluide. Fait en Tunisie avec soin,
            pour la femme moderne qui ne compromet jamais le style.
          </p>
          <div className="split-right-stats">
            <span>
              <span className="stat-num">120 DT</span> · 100% LIN NATUREL · TN TUNISIE
            </span>
          </div>
          <div>
            <Link to="/commande">
              <button className="btn btn-primary" type="button">
                DÉCOUVRIR →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bannière 4 icônes */}
      <section className="features-banner">
        <div className="feature-cell">
          <span className="feature-icon">🚚</span>
          <h3 className="feature-title">LIVRAISON RAPIDE</h3>
          <span className="feature-subtitle">PARTOUT EN TUNISIE</span>
        </div>
        <div className="feature-cell">
          <span className="feature-icon">💳</span>
          <h3 className="feature-title">PAIEMENT LIVRAISON</h3>
          <span className="feature-subtitle">AUCUN RISQUE</span>
        </div>
        <div className="feature-cell">
          <span className="feature-icon">🌿</span>
          <h3 className="feature-title">LIN NATUREL</h3>
          <span className="feature-subtitle">100% QUALITÉ PREMIUM</span>
        </div>
        <div className="feature-cell">
          <span className="feature-icon">⭐</span>
          <h3 className="feature-title">ÉDITION LIMITÉE</h3>
          <span className="feature-subtitle">STOCK LIMITÉ</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
