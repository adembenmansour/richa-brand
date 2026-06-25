import React from "react";

export default function Footer({ onOpenSizeGuide }) {
  return (
    <footer className="footer">
      <div className="footer-logo">RICHA</div>

      <div className="footer-socials">
        {/* Instagram SVG */}
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>

        {/* Facebook SVG */}
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>

        {/* TikTok SVG */}
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" title="TikTok">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
          </svg>
        </a>
      </div>

      <ul className="footer-links">
        <li>
          <a onClick={() => alert("RICHA - Marque de mode Tunisienne de lin premium.")}>
            À PROPOS
          </a>
        </li>
        <li>
          <a onClick={() => alert("Retours gratuits sous 14 jours en Tunisie.")}>
            POLITIQUE DE RETOUR
          </a>
        </li>
        <li>
          <a onClick={onOpenSizeGuide ? onOpenSizeGuide : () => alert("Le guide des tailles est disponible sur la page de commande.")}>
            GUIDE DES TAILLES
          </a>
        </li>
        <li>
          <a onClick={() => alert("FAQ : Livraison 2-4 jours. Paiement à la livraison cash uniquement.")}>
            FAQ
          </a>
        </li>
      </ul>

      <div className="footer-copyright">
        © 2026 RICHA. TOUS DROITS RÉSERVÉS. FAIT EN TUNISIE.
      </div>
    </footer>
  );
}
