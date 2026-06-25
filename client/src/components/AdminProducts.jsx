import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Sous-composant de gestion du catalogue de produits pour le dashboard admin
export default function AdminProducts() {
  const { token } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // États pour les modaux et formulaires
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Si null, c'est un ajout, sinon c'est une modification
  
  // États des champs du formulaire
  const [nom, setNom] = useState("");
  const [badge, setBadge] = useState("");
  const [categorie, setCategorie] = useState("");
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Charger la liste des produits
  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/admin/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur de chargement des produits.");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les produits.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // Ouvrir la modale en mode Ajout
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setNom("");
    setBadge("");
    setCategorie("");
    setPrix("");
    setDescription("");
    setImage("");
    setModalError("");
    setModalSuccess("");
    setIsModalOpen(true);
  };

  // Ouvrir la modale en mode Édition
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setNom(product.nom);
    setBadge(product.badge || "");
    setCategorie(product.categorie);
    setPrix(product.prix.toString());
    setDescription(product.description);
    setImage(product.image);
    setModalError("");
    setModalSuccess("");
    setIsModalOpen(true);
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Soumettre le formulaire d'ajout ou modification
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    // Validation simple
    if (!nom || !categorie || !prix || !description || !image) {
      setModalError("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }

    const priceNum = parseFloat(prix);
    if (isNaN(priceNum) || priceNum <= 0) {
      setModalError("Le prix doit être un nombre supérieur à 0.");
      return;
    }

    const productPayload = {
      nom,
      badge,
      categorie,
      prix: priceNum,
      description,
      image,
    };

    setSaving(true);

    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct._id}` 
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setModalError(responseData.error || "Une erreur est survenue lors de l'enregistrement.");
        setSaving(false);
        return;
      }

      setModalSuccess(editingProduct ? "Produit mis à jour avec succès !" : "Produit ajouté avec succès !");
      
      // Re-charger les produits
      fetchProducts();
      
      // Fermer après un petit délai de succès
      setTimeout(() => {
        handleCloseModal();
      }, 1000);

    } catch (err) {
      console.error(err);
      setModalError("Erreur réseau lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un produit du catalogue
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit du catalogue ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        alert("Erreur lors de la suppression du produit.");
        return;
      }

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Erreur réseau lors de la suppression.");
    }
  };

  return (
    <>
      <style>{`
        .admin-products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .admin-products-title {
          font-size: 32px;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-add-product-btn {
          background-color: #000000;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-radius: 0px !important;
        }

        .admin-add-product-btn:hover {
          background-color: #333333;
        }

        /* Grille produits */
        .admin-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .admin-product-card {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          position: relative;
          border-radius: 0px !important;
        }

        .admin-product-badge {
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
          z-index: 5;
          border-radius: 0px !important;
        }

        .admin-product-img-wrap {
          width: 100%;
          padding-top: 133%; /* Ratio 3:4 */
          position: relative;
          background-color: #f5f5f5;
          overflow: hidden;
        }

        .admin-product-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-product-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .admin-product-category {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #888888;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .admin-product-name {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-product-price {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .admin-product-desc {
          font-size: 12px;
          color: #666666;
          line-height: 1.5;
          margin: 0 0 20px 0;
          flex-grow: 1;
        }

        /* Actions sur la carte */
        .admin-product-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: auto;
        }

        .admin-product-edit-btn {
          background-color: #ffffff;
          border: 1px solid #000000;
          color: #000000;
          padding: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 0px !important;
          text-align: center;
        }

        .admin-product-edit-btn:hover {
          background-color: #000000;
          color: #ffffff;
        }

        .admin-product-delete-btn {
          background-color: #cc0000;
          border: 1px solid #cc0000;
          color: #ffffff;
          padding: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-radius: 0px !important;
          text-align: center;
        }

        .admin-product-delete-btn:hover {
          background-color: #990000;
          border-color: #990000;
        }

        /* Modal Overlay */
        .admin-modal-overlay {
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

        .admin-modal-box {
          background-color: #ffffff;
          border: 1px solid #000000;
          width: 100%;
          max-width: 540px;
          padding: 40px;
          box-sizing: border-box;
          box-shadow: 0px 10px 40px rgba(0,0,0,0.5);
          position: relative;
          border-radius: 0px !important;
        }

        .admin-modal-title {
          font-size: 24px;
          font-weight: 900;
          margin-top: 0;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .admin-modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-modal-form-group.full-width {
          grid-column: span 2;
        }

        .admin-modal-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .admin-modal-input, .admin-modal-textarea {
          border: 1px solid #000000;
          background-color: #ffffff;
          padding: 10px;
          font-size: 13px;
          outline: none;
          border-radius: 0px !important;
          box-sizing: border-box;
          width: 100%;
        }

        .admin-modal-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .admin-modal-msg-error {
          color: #cc0000;
          font-size: 12px;
          font-weight: 700;
          border-left: 2px solid #cc0000;
          padding-left: 10px;
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .admin-modal-msg-success {
          color: #16a34a;
          font-size: 12px;
          font-weight: 700;
          border-left: 2px solid #16a34a;
          padding-left: 10px;
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .admin-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .admin-btn-save {
          background-color: #000000;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 0px !important;
        }

        .admin-btn-save:hover:not(:disabled) {
          background-color: #333333;
        }

        .admin-btn-cancel {
          background-color: #ffffff;
          border: 1px solid #cccccc;
          color: #555555;
          padding: 12px 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 0px !important;
        }

        .admin-btn-cancel:hover {
          border-color: #000000;
          color: #000000;
        }

        @media (max-width: 992px) {
          .admin-products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .admin-products-grid {
            grid-template-columns: 1fr;
          }
          .admin-modal-form-grid {
            grid-template-columns: 1fr;
          }
          .admin-modal-form-group.full-width {
            grid-column: span 1;
          }
        }
      `}</style>

      <div className="admin-products-header">
        <h1 className="admin-products-title">Gestion des Produits</h1>
        <button className="admin-add-product-btn" onClick={handleOpenAddModal}>
          + Ajouter un produit
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "80px", textAlign: "center", fontWeight: "bold" }}>
          CHARGEMENT DES PRODUITS...
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: "80px", textAlign: "center", color: "#888888" }}>
          AUCUN PRODUIT DISPONIBLE DANS LE CATALOGUE.
        </div>
      ) : (
        <div className="admin-products-grid">
          {products.map((prod) => (
            <article className="admin-product-card" key={prod._id}>
              {prod.badge && (
                <span className="admin-product-badge">{prod.badge}</span>
              )}
              
              <div className="admin-product-img-wrap">
                <img
                  src={prod.image}
                  alt={prod.nom}
                  className="admin-product-img"
                  loading="lazy"
                />
              </div>

              <div className="admin-product-content">
                <span className="admin-product-category">{prod.categorie}</span>
                <h3 className="admin-product-name">{prod.nom}</h3>
                <p className="admin-product-price">{prod.prix} DT</p>
                <p className="admin-product-desc">{prod.description}</p>

                <div className="admin-product-actions">
                  <button
                    className="admin-product-edit-btn"
                    onClick={() => handleOpenEditModal(prod)}
                  >
                    Modifier
                  </button>
                  <button
                    className="admin-product-delete-btn"
                    onClick={() => handleDeleteProduct(prod._id)}
                  >
                    ✕ Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Ajouter/Modifier un produit */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <h2 className="admin-modal-title">
              {editingProduct ? `Modifier ${editingProduct.nom}` : "Ajouter un produit"}
            </h2>

            <form onSubmit={handleFormSubmit}>
              {modalError && <div className="admin-modal-msg-error">{modalError}</div>}
              {modalSuccess && <div className="admin-modal-msg-success">{modalSuccess}</div>}

              <div className="admin-modal-form-grid">
                <div className="admin-modal-form-group">
                  <label className="admin-modal-label" htmlFor="m_nom">Nom *</label>
                  <input
                    id="m_nom"
                    type="text"
                    className="admin-modal-input"
                    placeholder="Nom du produit"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-modal-form-group">
                  <label className="admin-modal-label" htmlFor="m_prix">Prix (DT) *</label>
                  <input
                    id="m_prix"
                    type="number"
                    step="0.01"
                    className="admin-modal-input"
                    placeholder="Ex: 120"
                    value={prix}
                    onChange={(e) => setPrix(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-modal-form-group">
                  <label className="admin-modal-label" htmlFor="m_category">Catégorie *</label>
                  <input
                    id="m_category"
                    type="text"
                    className="admin-modal-input"
                    placeholder="Ex: ENSEMBLE"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-modal-form-group">
                  <label className="admin-modal-label" htmlFor="m_badge">Badge</label>
                  <input
                    id="m_badge"
                    type="text"
                    className="admin-modal-input"
                    placeholder="Ex: POPULAIRE"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>

                <div className="admin-modal-form-group full-width">
                  <label className="admin-modal-label" htmlFor="m_image">URL Image *</label>
                  <input
                    id="m_image"
                    type="url"
                    className="admin-modal-input"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-modal-form-group full-width">
                  <label className="admin-modal-label" htmlFor="m_desc">Description *</label>
                  <textarea
                    id="m_desc"
                    className="admin-modal-textarea"
                    placeholder="Détails du produit..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-cancel" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn-save" disabled={saving}>
                  {saving ? "ENREGISTREMENT..." : "ENREGISTRER"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
