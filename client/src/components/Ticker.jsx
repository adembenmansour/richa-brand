import React from "react";

export default function Ticker() {
  const text = "NOUVELLE COLLECTION · LIVRAISON RAPIDE · FAIT EN TUNISIE · ÉDITION LIMITÉE · ";
  // Répéter le texte pour s'assurer qu'il remplit l'écran
  const repeatedText = text.repeat(4);

  return (
    <div className="ticker-container">
      <div className="ticker-wrap">
        <div className="ticker-move">
          <span className="ticker-item">{repeatedText}</span>
          <span className="ticker-item">{repeatedText}</span>
        </div>
      </div>
    </div>
  );
}
