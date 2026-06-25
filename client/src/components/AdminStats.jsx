import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Sous-composant pour l'affichage des statistiques du tableau de bord admin
export default function AdminStats() {
  const { token, admin } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Récupération des données depuis le serveur
  useEffect(() => {
    fetch("/api/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur de chargement des statistiques.");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Erreur lors de la récupération des données de statistiques.");
        setLoading(false);
      });
  }, [token]);

  // Formater la date du jour
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return <div className="admin-stats-loading">CHARGEMENT DES STATISTIQUES EN COURS...</div>;
  }

  if (error) {
    return <div className="admin-stats-error">{error}</div>;
  }

  // Sécurité division par zéro pour le calcul des pourcentages de répartition
  const total = stats.totalCommandes || 1;
  const pEnAttente = Math.round((stats.statuts.enAttente / total) * 100);
  const pConfirmees = Math.round((stats.statuts.confirmees / total) * 100);
  const pExpediees = Math.round((stats.statuts.expediees / total) * 100);
  const pLivrees = Math.round((stats.statuts.livrees / total) * 100);

  return (
    <>
      <style>{`
        .admin-stats-loading {
          padding: 80px;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .admin-stats-error {
          padding: 40px;
          color: #cc0000;
          font-weight: 700;
          letter-spacing: 1px;
          border-left: 3px solid #cc0000;
          background-color: #fff;
          margin-bottom: 24px;
          text-transform: uppercase;
        }

        .admin-stats-header {
          margin-bottom: 40px;
        }

        .admin-stats-welcome {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #888888;
          text-transform: uppercase;
          margin: 0 0 8px 0;
        }

        .admin-stats-title {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 1px;
          margin: 0 0 6px 0;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .admin-stats-date {
          font-size: 13px;
          color: #888888;
          margin: 0;
        }

        /* Grille des KPI Cards (2x2) */
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 30px;
        }

        .admin-kpi-card {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 32px;
          box-sizing: border-box;
          border-radius: 0px !important;
        }

        .admin-kpi-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #888888;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .admin-kpi-value {
          font-size: 36px;
          font-weight: 900;
          margin: 0;
          letter-spacing: -1px;
        }

        .admin-kpi-value.orange {
          color: #d97706;
        }

        .admin-kpi-value.green {
          color: #16a34a;
        }

        /* Grille des Stats Secondaires (1x4) */
        .admin-secondary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .admin-secondary-card {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 20px;
          box-sizing: border-box;
          border-radius: 0px !important;
        }

        .admin-secondary-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #888888;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .admin-secondary-value {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-secondary-sub {
          font-size: 11px;
          color: #888888;
          margin-top: 4px;
          margin-bottom: 0;
        }

        /* Section de répartition */
        .admin-repartition-section {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 32px;
          box-sizing: border-box;
          border-radius: 0px !important;
        }

        .admin-repartition-title {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-top: 0;
          margin-bottom: 24px;
          text-transform: uppercase;
        }

        .admin-repartition-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .admin-repartition-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-repartition-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .admin-repartition-count {
          color: #888888;
        }

        /* Barre CSS simple */
        .admin-progress-bar-bg {
          height: 12px;
          background-color: #f5f5f5;
          width: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 0px !important;
        }

        .admin-progress-bar-fill {
          height: 100%;
          background-color: #000000;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0px !important;
        }

        .admin-progress-bar-fill.orange {
          background-color: #d97706;
        }

        .admin-progress-bar-fill.green {
          background-color: #16a34a;
        }

        .admin-progress-bar-fill.blue {
          background-color: #2563eb;
        }

        @media (max-width: 992px) {
          .admin-secondary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .admin-kpi-grid {
            grid-template-columns: 1fr;
          }
          .admin-secondary-grid {
            grid-template-columns: 1fr;
          }
          .admin-stats-title {
            font-size: 32px;
          }
        }
      `}</style>

      <div className="admin-stats-header">
        <p className="admin-stats-welcome">Bienvenue, {admin ? admin.nom : "Administrateur"}</p>
        <h1 className="admin-stats-title">Tableau de bord</h1>
        <p className="admin-stats-date">{today}</p>
      </div>

      {/* Grille principale KPI */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Chiffre d'affaires</div>
          <h3 className="admin-kpi-value">{stats.chiffreAffaires || 0} DT</h3>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total Commandes</div>
          <h3 className="admin-kpi-value">{stats.totalCommandes || 0}</h3>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">En attente</div>
          <h3 className="admin-kpi-value orange">{stats.statuts.enAttente || 0}</h3>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Livrées</div>
          <h3 className="admin-kpi-value green">{stats.statuts.livrees || 0}</h3>
        </div>
      </div>

      {/* Grille secondaire */}
      <div className="admin-secondary-grid">
        <div className="admin-secondary-card">
          <div className="admin-secondary-label">Produit Top</div>
          <h4 className="admin-secondary-value" title={stats.produitTopVente.nom}>
            {stats.produitTopVente.nom}
          </h4>
          <p className="admin-secondary-sub">{stats.produitTopVente.ventes} ventes</p>
        </div>

        <div className="admin-secondary-card">
          <div className="admin-secondary-label">Gouvernorat Top</div>
          <h4 className="admin-secondary-value">{stats.gouvernoratTop.nom}</h4>
          <p className="admin-secondary-sub">{stats.gouvernoratTop.nb} commandes</p>
        </div>

        <div className="admin-secondary-card">
          <div className="admin-secondary-label">Cette semaine</div>
          <h4 className="admin-secondary-value">{stats.commandesSemaine}</h4>
          <p className="admin-secondary-sub">7 derniers jours</p>
        </div>

        <div className="admin-secondary-card">
          <div className="admin-secondary-label">Produits Actifs</div>
          <h4 className="admin-secondary-value">{stats.totalProduits}</h4>
          <p className="admin-secondary-sub">En catalogue</p>
        </div>
      </div>

      {/* Section de répartition des commandes */}
      <div className="admin-repartition-section">
        <h4 className="admin-repartition-title">Répartition des commandes par statut</h4>
        <div className="admin-repartition-list">
          {/* En attente */}
          <div className="admin-repartition-row">
            <div className="admin-repartition-info">
              <span>En attente</span>
              <span className="admin-repartition-count">{stats.statuts.enAttente} ({pEnAttente}%)</span>
            </div>
            <div className="admin-progress-bar-bg">
              <div className="admin-progress-bar-fill orange" style={{ width: `${pEnAttente}%` }}></div>
            </div>
          </div>

          {/* Confirmées */}
          <div className="admin-repartition-row">
            <div className="admin-repartition-info">
              <span>Confirmées</span>
              <span className="admin-repartition-count">{stats.statuts.confirmees} ({pConfirmees}%)</span>
            </div>
            <div className="admin-progress-bar-bg">
              <div className="admin-progress-bar-fill blue" style={{ width: `${pConfirmees}%` }}></div>
            </div>
          </div>

          {/* Expédiées */}
          <div className="admin-repartition-row">
            <div className="admin-repartition-info">
              <span>Expédiées</span>
              <span className="admin-repartition-count">{stats.statuts.expediees} ({pExpediees}%)</span>
            </div>
            <div className="admin-progress-bar-bg">
              <div className="admin-progress-bar-fill" style={{ width: `${pExpediees}%` }}></div>
            </div>
          </div>

          {/* Livrées */}
          <div className="admin-repartition-row">
            <div className="admin-repartition-info">
              <span>Livrées</span>
              <span className="admin-repartition-count">{stats.statuts.livrees} ({pLivrees}%)</span>
            </div>
            <div className="admin-progress-bar-bg">
              <div className="admin-progress-bar-fill green" style={{ width: `${pLivrees}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
