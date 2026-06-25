import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Composant pour l'administration des médias (Landing Page)
export default function AdminMedia() {
  const { token } = useAuth();
  
  // États de la liste des médias
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtre de section actif
  const [activeFilter, setActiveFilter] = useState("toutes");

  // États de la modale d'ajout
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "image",
    section: "hero",
    url: "",
    label: "",
    ordre: 1
  });
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  // Charger tous les médias de l'API
  const fetchMedias = () => {
    setLoading(true);
    fetch("/api/admin/media", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur de chargement des médias.");
        }
        return res.json();
      })
      .then((data) => {
        setMedias(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de récupérer le catalogue de médias.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedias();
  }, [token]);

  // Activer/Désactiver un média
  const handleToggleActive = async (mediaId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ actif: !currentStatus })
      });

      if (!response.ok) {
        alert("Impossible de modifier le statut de ce média.");
        return;
      }

      // Mettre à jour l'état local
      setMedias(prev =>
        prev.map(m => m._id === mediaId ? { ...m, actif: !currentStatus } : m)
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du média.");
    }
  };

  // Supprimer définitivement un média
  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce média de la Landing Page ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        alert("Erreur lors de la suppression du média.");
        return;
      }

      // Retirer du state local
      setMedias(prev => prev.filter(m => m._id !== mediaId));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    }
  };

  // Gérer la soumission du formulaire d'ajout
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!formData.url.trim()) {
      setModalError("L'URL du média est requise.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: formData.type,
          section: formData.section,
          url: formData.url.trim(),
          label: formData.label.trim(),
          ordre: Number(formData.ordre) || 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setModalError(data.error || "Erreur lors de la sauvegarde.");
        setSaving(false);
        return;
      }

      // Recharger la liste, réinitialiser le formulaire et fermer
      fetchMedias();
      setFormData({
        type: "image",
        section: "hero",
        url: "",
        label: "",
        ordre: 1
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setModalError("Erreur réseau lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  // Filtrer les médias à afficher selon l'onglet
  const filteredMedias = medias.filter(media => {
    if (activeFilter === "toutes") return true;
    return media.section === activeFilter;
  });

  // Fonction utilitaire pour formater les noms de sections
  const formatSectionName = (sec) => {
    switch (sec) {
      case "hero": return "Hero";
      case "produit_set": return "Set RICHA";
      case "produit_pull": return "Pull";
      case "produit_pantalon": return "Pantalon";
      default: return sec;
    }
  };

  return (
    <>
      <style>{`
        /* Styles AdminMedia avec border-radius: 0px obligatoire */
        .admin-media-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
        }

        .admin-media-title {
          font-size: 40px;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-media-subtitle {
          font-size: 13px;
          color: #888888;
          margin-top: 4px;
          margin-bottom: 0;
        }

        /* Onglets filtres horizontaux carrés */
        .admin-media-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 32px;
        }

        .admin-media-tab-btn {
          background-color: #ffffff;
          border: 1px solid #000000;
          color: #000000;
          padding: 12px 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          border-radius: 0px !important;
        }

        .admin-media-tab-btn.active {
          background-color: #000000;
          color: #ffffff;
        }

        .admin-media-tab-btn:hover:not(.active) {
          background-color: #f5f5f5;
        }

        /* Grille médias */
        .admin-media-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 50px;
        }

        .admin-media-card {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          border-radius: 0px !important;
          box-shadow: none;
        }

        .admin-media-preview-container {
          height: 200px;
          background-color: #f5f5f5;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-media-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background-color: #000000;
          color: #ffffff;
          padding: 4px 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          z-index: 10;
          border-radius: 0px !important;
        }

        .admin-media-preview-img, .admin-media-preview-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-media-details {
          padding: 16px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-media-section-badge {
          align-self: flex-start;
          background-color: #f5f5f5;
          color: #666666;
          padding: 3px 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-radius: 0px !important;
        }

        .admin-media-label {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          margin: 4px 0 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-media-url {
          font-size: 11px;
          color: #888888;
          font-family: monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        .admin-media-order {
          font-size: 12px;
          color: #888888;
          margin: 0;
        }

        /* Actions de la carte */
        .admin-media-actions {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-media-toggle-btn {
          background: none;
          border: none;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 8px;
        }

        .admin-media-toggle-btn.actif {
          color: #16a34a;
        }

        .admin-media-toggle-btn.inactif {
          color: #cc0000;
        }

        .admin-media-delete-btn {
          background: none;
          border: none;
          color: #cc0000;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .admin-media-delete-btn:hover {
          text-decoration: underline;
        }

        /* Bouton flottant d'ajout */
        .admin-media-float-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background-color: #000000;
          color: #ffffff;
          border: 1px solid #333333;
          padding: 16px 28px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.4);
          z-index: 90;
          transition: background-color 0.2s ease;
          border-radius: 0px !important;
        }

        .admin-media-float-btn:hover {
          background-color: #222222;
        }

        /* Modale Overlay */
        .admin-media-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .admin-media-modal-box {
          background-color: #ffffff;
          border: 1px solid #000000;
          width: 100%;
          max-width: 520px;
          padding: 40px;
          box-sizing: border-box;
          position: relative;
          border-radius: 0px !important;
        }

        .admin-media-modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        .admin-media-modal-title {
          font-size: 24px;
          font-weight: 900;
          margin-top: 0;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-media-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-media-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .admin-media-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-media-modal-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .admin-media-modal-input, .admin-media-modal-select {
          border: 1px solid #000000;
          background-color: #ffffff;
          padding: 12px;
          font-size: 13px;
          outline: none;
          border-radius: 0px !important;
          box-sizing: border-box;
          width: 100%;
        }

        /* Prévisualisation en direct */
        .admin-media-live-preview {
          margin-top: 8px;
          border: 1px solid #e0e0e0;
          height: 160px;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 0px !important;
        }

        .admin-media-live-preview img, .admin-media-live-preview video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-media-modal-submit-btn {
          background-color: #000000;
          color: #ffffff;
          border: none;
          padding: 14px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          width: 100%;
          margin-top: 10px;
          transition: background-color 0.2s;
          border-radius: 0px !important;
        }

        .admin-media-modal-submit-btn:hover:not(:disabled) {
          background-color: #222222;
        }

        .admin-media-modal-submit-btn:disabled {
          background-color: #888888;
          cursor: not-allowed;
        }

        .admin-media-modal-error {
          color: #cc0000;
          font-size: 12px;
          font-weight: 700;
          border-left: 2px solid #cc0000;
          padding-left: 10px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        @media (max-width: 992px) {
          .admin-media-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .admin-media-grid {
            grid-template-columns: 1fr;
          }
          .admin-media-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div>
        <div className="admin-media-header">
          <div>
            <h1 className="admin-media-title">Gestion des Médias</h1>
            <p className="admin-media-subtitle">Vidéos et images affichées sur la Landing Page et le catalogue</p>
          </div>
        </div>

        {/* Barre des filtres d'onglets carrés */}
        <div className="admin-media-tabs">
          <button
            onClick={() => setActiveFilter("toutes")}
            className={`admin-media-tab-btn ${activeFilter === "toutes" ? "active" : ""}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setActiveFilter("hero")}
            className={`admin-media-tab-btn ${activeFilter === "hero" ? "active" : ""}`}
          >
            Hero Vidéo
          </button>
          <button
            onClick={() => setActiveFilter("produit_set")}
            className={`admin-media-tab-btn ${activeFilter === "produit_set" ? "active" : ""}`}
          >
            Set RICHA
          </button>
          <button
            onClick={() => setActiveFilter("produit_pull")}
            className={`admin-media-tab-btn ${activeFilter === "produit_pull" ? "active" : ""}`}
          >
            Pull
          </button>
          <button
            onClick={() => setActiveFilter("produit_pantalon")}
            className={`admin-media-tab-btn ${activeFilter === "produit_pantalon" ? "active" : ""}`}
          >
            Pantalon
          </button>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div style={{ padding: "80px", textAlign: "center", fontWeight: "bold", letterSpacing: "1px" }}>
            CHARGEMENT DES MÉDIAS EN COURS...
          </div>
        ) : error ? (
          <div style={{ color: "#cc0000", padding: "40px", borderLeft: "3px solid #cc0000", background: "#fff", fontWeight: "bold" }}>
            {error}
          </div>
        ) : filteredMedias.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center", color: "#888888", border: "1px dashed #cccccc" }}>
            AUCUN MÉDIA ASSOCIÉ À CETTE SECTION.
          </div>
        ) : (
          <div className="admin-media-grid">
            {filteredMedias.map((media) => (
              <article key={media._id} className="admin-media-card">
                {/* Section Prévisualisation */}
                <div className="admin-media-preview-container">
                  <span className="admin-media-badge">{media.type === "video" ? "Vidéo" : "Image"}</span>
                  {media.type === "video" ? (
                    <video
                      src={media.url}
                      muted
                      controls
                      className="admin-media-preview-video"
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={media.label || "Aperçu média"}
                      className="admin-media-preview-img"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Section Informations */}
                <div className="admin-media-details">
                  <span className="admin-media-section-badge">{formatSectionName(media.section)}</span>
                  <h4 className="admin-media-label" title={media.label || "Sans titre"}>
                    {media.label || "Média sans label"}
                  </h4>
                  <p className="admin-media-url" title={media.url}>
                    {media.url}
                  </p>
                  <p className="admin-media-order">Ordre: {media.ordre}</p>
                </div>

                {/* Section Actions */}
                <div className="admin-media-actions">
                  <button
                    onClick={() => handleToggleActive(media._id, media.actif)}
                    className={`admin-media-toggle-btn ${media.actif ? "actif" : "inactif"}`}
                  >
                    {media.actif ? "● Actif" : "○ Inactif"}
                  </button>

                  <button
                    onClick={() => handleDeleteMedia(media._id)}
                    className="admin-media-delete-btn"
                  >
                    ✕ Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bouton d'action flottant au coin bas droit */}
        <button
          onClick={() => {
            setModalError("");
            setShowModal(true);
          }}
          className="admin-media-float-btn"
        >
          + Ajouter un média
        </button>

        {/* Modal d'ajout de média */}
        {showModal && (
          <div className="admin-media-modal-overlay">
            <div className="admin-media-modal-box">
              <button
                onClick={() => setShowModal(false)}
                className="admin-media-modal-close-btn"
              >
                ✕
              </button>
              
              <h2 className="admin-media-modal-title">Ajouter un média</h2>

              <form onSubmit={handleFormSubmit} className="admin-media-form">
                {modalError && <div className="admin-media-modal-error">{modalError}</div>}

                <div className="admin-media-form-row">
                  {/* Champ Type */}
                  <div className="admin-media-form-group">
                    <label className="admin-media-modal-label" htmlFor="f_type">Type *</label>
                    <select
                      id="f_type"
                      className="admin-media-modal-select"
                      value={formData.type}
                      onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                      required
                    >
                      <option value="image">Image</option>
                      <option value="video">Vidéo</option>
                    </select>
                  </div>

                  {/* Champ Section */}
                  <div className="admin-media-form-group">
                    <label className="admin-media-modal-label" htmlFor="f_section">Section *</label>
                    <select
                      id="f_section"
                      className="admin-media-modal-select"
                      value={formData.section}
                      onChange={(e) => setFormData(p => ({ ...p, section: e.target.value }))}
                      required
                    >
                      <option value="hero">Vidéo Hero (hero)</option>
                      <option value="produit_set">Photo Set RICHA (produit_set)</option>
                      <option value="produit_pull">Photo Pull (produit_pull)</option>
                      <option value="produit_pantalon">Photo Pantalon (produit_pantalon)</option>
                    </select>
                  </div>
                </div>

                {/* Champ URL */}
                <div className="admin-media-form-group">
                  <label className="admin-media-modal-label" htmlFor="f_url">URL du média *</label>
                  <input
                    id="f_url"
                    type="url"
                    className="admin-media-modal-input"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData(p => ({ ...p, url: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-media-form-row">
                  {/* Champ Label */}
                  <div className="admin-media-form-group">
                    <label className="admin-media-modal-label" htmlFor="f_label">Label</label>
                    <input
                      id="f_label"
                      type="text"
                      className="admin-media-modal-input"
                      placeholder="Ex: Version Été"
                      value={formData.label}
                      onChange={(e) => setFormData(p => ({ ...p, label: e.target.value }))}
                    />
                  </div>

                  {/* Champ Ordre */}
                  <div className="admin-media-form-group">
                    <label className="admin-media-modal-label" htmlFor="f_ordre">Ordre</label>
                    <input
                      id="f_ordre"
                      type="number"
                      min="0"
                      className="admin-media-modal-input"
                      placeholder="1"
                      value={formData.ordre}
                      onChange={(e) => setFormData(p => ({ ...p, ordre: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Prévisualisation en direct si URL renseignée */}
                {formData.url.trim() && (
                  <div className="admin-media-form-group">
                    <label className="admin-media-modal-label">Aperçu en direct</label>
                    <div className="admin-media-live-preview">
                      {formData.type === "video" ? (
                        <video src={formData.url.trim()} muted controls />
                      ) : (
                        <img src={formData.url.trim()} alt="Aperçu direct" />
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="admin-media-modal-submit-btn"
                  disabled={saving}
                >
                  {saving ? "ENREGISTREMENT EN COURS..." : "Enregistrer"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
