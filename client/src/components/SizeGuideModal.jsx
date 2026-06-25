import React from "react";

export default function SizeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Fermer la modale si on clique sur le fond semi-transparent
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Fermer la modale">
          ✕
        </button>
        <h2 className="modal-title">GUIDE DES TAILLES</h2>
        
        <table className="size-table">
          <thead>
            <tr>
              <th>TAILLE</th>
              <th>POITRINE</th>
              <th>TAILLE (TAILLE)</th>
              <th>HANCHES</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>XS</td>
              <td>80–83 cm</td>
              <td>60–63 cm</td>
              <td>86–89 cm</td>
            </tr>
            <tr>
              <td>S</td>
              <td>84–87 cm</td>
              <td>64–67 cm</td>
              <td>90–93 cm</td>
            </tr>
            <tr>
              <td>M</td>
              <td>88–92 cm</td>
              <td>68–72 cm</td>
              <td>94–98 cm</td>
            </tr>
            <tr>
              <td>L</td>
              <td>93–98 cm</td>
              <td>73–78 cm</td>
              <td>99–104 cm</td>
            </tr>
            <tr>
              <td>XL</td>
              <td>99–105 cm</td>
              <td>79–85 cm</td>
              <td>105–112 cm</td>
            </tr>
          </tbody>
        </table>

        <p className="modal-note">
          * Pour un ajustement parfait, prenez vos mesures avec un ruban à mesurer.
        </p>
      </div>
    </div>
  );
}
