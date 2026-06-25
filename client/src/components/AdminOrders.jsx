import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const governorates = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba",
  "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
  "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

// Sous-composant de gestion des commandes pour le dashboard admin
export default function AdminOrders() {
  const { token } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // États pour les filtres
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [gouvernorat, setGouvernorat] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Charger les commandes depuis le serveur selon les filtres
  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statut) params.append("statut", statut);
    if (gouvernorat) params.append("gouvernorat", gouvernorat);
    if (search) params.append("search", search);

    fetch(`/api/admin/orders?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des commandes.");
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les commandes.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    setCurrentPage(1); // Réinitialiser à la première page lors d'un changement de filtre
  }, [search, statut, gouvernorat, token]);

  // Changer le statut d'une commande
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Erreur de mise à jour du statut.");
        return;
      }

      // Re-charger les commandes après mise à jour
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion lors du changement de statut.");
    }
  };

  // Supprimer une commande
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette commande ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        alert("Erreur lors de la suppression de la commande.");
        return;
      }

      // Re-charger les commandes après suppression
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Erreur réseau lors de la suppression.");
    }
  };

  // Formatage de la date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} à ${hours}:${minutes}`;
  };

  // Logique de pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;

  return (
    <>
      <style>{`
        .admin-orders-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
        }

        .admin-orders-title {
          font-size: 32px;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-orders-count {
          font-size: 13px;
          font-weight: 700;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Filtres */
        .admin-orders-filters {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .admin-filter-input, .admin-filter-select {
          border: 1px solid #000000;
          background-color: #ffffff;
          padding: 12px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          border-radius: 0px !important;
        }

        /* Tableau */
        .admin-table-container {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          overflow-x: auto;
          margin-bottom: 24px;
          border-radius: 0px !important;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .admin-table th {
          background-color: #000000;
          color: #ffffff;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 1px;
          padding: 16px;
          text-transform: uppercase;
          border: 1px solid #000000;
        }

        .admin-table td {
          padding: 16px;
          border: 1px solid #e0e0e0;
          vertical-align: middle;
        }

        .admin-table tr:hover {
          background-color: #fafafa;
        }

        .order-id-short {
          font-family: monospace;
          font-weight: 700;
          color: #555555;
        }

        .order-client-name {
          font-weight: 700;
        }

        .order-client-tel {
          color: #888888;
          font-size: 11px;
          margin-top: 4px;
        }

        /* Tooltip pour les articles */
        .articles-tooltip-wrapper {
          position: relative;
          cursor: pointer;
          text-decoration: underline dotted #000;
          font-weight: 700;
          display: inline-block;
        }

        .articles-tooltip {
          visibility: hidden;
          background-color: #000000;
          color: #ffffff;
          text-align: left;
          padding: 16px;
          position: absolute;
          z-index: 10;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          width: 280px;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
          border-radius: 0px !important;
          opacity: 0;
          transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        .articles-tooltip-wrapper:hover .articles-tooltip {
          visibility: visible;
          opacity: 1;
        }

        .tooltip-item {
          font-size: 11px;
          margin-bottom: 8px;
          border-bottom: 1px solid #222;
          padding-bottom: 8px;
          line-height: 1.4;
        }

        .tooltip-item:last-child {
          margin-bottom: 0;
          border-bottom: none;
          padding-bottom: 0;
        }

        /* Badges de statut */
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-radius: 0px !important;
          white-space: nowrap;
        }

        .status-badge.en-attente {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
        }

        .status-badge.confirmee {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .status-badge.expediee {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-badge.livree {
          background-color: #000000;
          color: #ffffff;
          border: 1px solid #000000;
        }

        .status-badge.annulee {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        /* Actions */
        .order-actions-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .status-select-inline {
          padding: 8px;
          font-size: 12px;
          border: 1px solid #000000;
          background-color: #ffffff;
          outline: none;
          cursor: pointer;
          border-radius: 0px !important;
        }

        .delete-order-btn {
          background-color: #cc0000;
          color: #ffffff;
          border: none;
          width: 32px;
          height: 32px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
          border-radius: 0px !important;
        }

        .delete-order-btn:hover {
          background-color: #990000;
        }

        /* Pagination */
        .admin-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .pagination-btn-group {
          display: flex;
          gap: 10px;
        }

        .pagination-btn {
          background-color: #ffffff;
          border: 1px solid #000000;
          color: #000000;
          padding: 8px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          border-radius: 0px !important;
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: #000000;
          color: #ffffff;
        }

        .pagination-btn:disabled {
          border-color: #cccccc;
          color: #cccccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .admin-orders-filters {
            grid-template-columns: 1fr;
          }
          .admin-orders-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>

      <div className="admin-orders-header">
        <h1 className="admin-orders-title">Gestion des Commandes</h1>
        <span className="admin-orders-count">{orders.length} commandes trouvées</span>
      </div>

      {/* Barre de filtrage */}
      <div className="admin-orders-filters">
        <input
          type="text"
          className="admin-filter-input"
          placeholder="Rechercher par nom de client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select
          className="admin-filter-select"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="En attente">En attente</option>
          <option value="Confirmée">Confirmée</option>
          <option value="Expédiée">Expédiée</option>
          <option value="Livrée">Livrée</option>
          <option value="Annulée">Annulée</option>
        </select>

        <select
          className="admin-filter-select"
          value={gouvernorat}
          onChange={(e) => setGouvernorat(e.target.value)}
        >
          <option value="">Tous les gouvernorats</option>
          {governorates.map((gov) => (
            <option key={gov} value={gov}>
              {gov}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau des commandes */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: "80px", textAlign: "center", fontWeight: "bold" }}>
            CHARGEMENT DES COMMANDES...
          </div>
        ) : currentOrders.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center", color: "#888888" }}>
            AUCUNE COMMANDE TROUVÉE.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th># ID</th>
                <th>Date</th>
                <th>Client</th>
                <th>Gouvernorat</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => {
                const totalArticles = (order.articles || []).reduce((sum, a) => sum + (a.quantite || 0), 0);
                const shortId = order._id ? order._id.substring(order._id.length - 6) : "";
                
                // Déterminer la classe CSS selon le statut
                let statusClass = "en-attente";
                if (order.statut === "Confirmée") statusClass = "confirmee";
                if (order.statut === "Expédiée") statusClass = "expediee";
                if (order.statut === "Livrée") statusClass = "livree";
                if (order.statut === "Annulée") statusClass = "annulee";

                return (
                  <tr key={order._id}>
                    <td className="order-id-short" title={order._id}>
                      #{shortId}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="order-client-name">{order.nom}</div>
                      <div className="order-client-tel">{order.telephone}</div>
                    </td>
                    <td>{order.gouvernorat}</td>
                    <td>
                      <div className="articles-tooltip-wrapper">
                        {totalArticles} article(s)
                        <div className="articles-tooltip">
                          {order.articles && order.articles.map((art, idx) => (
                            <div key={idx} className="tooltip-item">
                              <strong>{art.nom}</strong> ({art.taille})
                              <br />
                              Quantité : {art.quantite} | Prix unit. : {art.prix} DT
                            </div>
                          ))}
                          {order.note && (
                            <div className="tooltip-item" style={{ color: "#d97706", borderTop: "1px solid #333", paddingTop: "8px", marginTop: "8px" }}>
                              <strong>Note client:</strong> {order.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: "700" }}>{order.total || 0} DT</td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {order.statut || "En attente"}
                      </span>
                    </td>
                    <td>
                      <div className="order-actions-cell">
                        <select
                          className="status-select-inline"
                          value={order.statut || "En attente"}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="En attente">En attente</option>
                          <option value="Confirmée">Confirmée</option>
                          <option value="Expédiée">Expédiée</option>
                          <option value="Livrée">Livrée</option>
                          <option value="Annulée">Annulée</option>
                        </select>
                        <button
                          className="delete-order-btn"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Supprimer la commande"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="admin-pagination">
          <span>
            Page {currentPage} sur {totalPages} ({orders.length} commandes au total)
          </span>
          <div className="pagination-btn-group">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Précédent
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </>
  );
}
