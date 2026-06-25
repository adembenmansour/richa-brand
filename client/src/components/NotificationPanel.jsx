import React from "react";

// Panneau latéral coulissant des notifications temps réel (SSE)
export default function NotificationPanel({ 
  notifications, 
  nonLues, 
  connecte, 
  marquerToutesLues, 
  marquerLue, 
  supprimerNotif, 
  onClose,
  onViewOrders // Callback pour changer d'onglet vers "orders" dans le dashboard
}) {

  // Fonction utilitaire pour calculer le temps écoulé de façon lisible
  const formatTimeElapsed = (dateInput) => {
    try {
      const now = new Date();
      const past = new Date(dateInput);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "à l'instant";
      if (diffMins < 60) return `il y a ${diffMins} min`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `il y a ${diffHours} h`;
      
      return past.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    } catch (e) {
      return "";
    }
  };

  return (
    <>
      <style>{`
        /* Styles Notification Panel avec border-radius: 0px absolu */
        .notif-panel-container {
          position: fixed;
          top: 0;
          right: 0;
          width: 380px;
          height: 100vh;
          background-color: #ffffff;
          border-left: 1px solid #000000;
          z-index: 300;
          display: flex;
          flex-direction: column;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          box-sizing: border-box;
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        /* En-tête du panneau */
        .notif-panel-header {
          background-color: #000000;
          color: #ffffff;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notif-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notif-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notif-title-text {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
          text-transform: uppercase;
        }

        .notif-badge-count {
          background-color: #cc0000;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 0px !important;
        }

        .notif-close-x {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notif-header-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .notif-mark-all-btn {
          background: none;
          border: none;
          color: #888888;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          text-transform: uppercase;
          padding: 0;
          transition: color 0.2s;
        }

        .notif-mark-all-btn:hover {
          color: #ffffff;
        }

        /* Indicateur de statut SSE */
        .notif-sse-status {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .notif-sse-status.connected {
          color: #22c55e;
        }

        .notif-sse-status.disconnected {
          color: #ef4444;
        }

        /* Corps de la liste */
        .notif-panel-body {
          flex-grow: 1;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .notif-empty-state {
          padding: 80px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notif-empty-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .notif-empty-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }

        .notif-empty-sub {
          font-size: 11px;
          color: #888888;
          margin: 0;
        }

        /* Cartes de notification */
        .notif-item-card {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          box-sizing: border-box;
        }

        .notif-item-card.non-lue {
          background-color: #f6f6f6;
        }

        .notif-item-card.lue {
          background-color: #ffffff;
        }

        .notif-item-card:hover {
          background-color: #f0f0f0;
        }

        .notif-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notif-item-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .notif-item-time {
          font-size: 10px;
          color: #888888;
        }

        .notif-item-client {
          font-size: 15px;
          font-weight: 700;
          margin: 2px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .notif-item-details {
          font-size: 12px;
          color: #666666;
          margin: 0;
          line-height: 1.4;
        }

        .notif-item-total {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          margin: 0;
        }

        .notif-item-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        /* Badge d'état de commande */
        .notif-status-badge {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-radius: 0px !important;
        }

        /* Actions de la carte */
        .notif-item-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .notif-action-btn-go {
          background-color: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          padding: 8px 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          text-transform: uppercase;
          border-radius: 0px !important;
          flex-grow: 1;
          text-align: center;
        }

        .notif-action-btn-go:hover {
          background-color: #222222;
        }

        .notif-action-btn-del {
          background-color: #ffffff;
          border: 1px solid #000000;
          color: #000000;
          width: 32px;
          height: 32px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0px !important;
          transition: background-color 0.2s;
        }

        .notif-action-btn-del:hover {
          background-color: #f5f5f5;
        }
      `}</style>

      <div className="notif-panel-container">
        {/* En-tête */}
        <header className="notif-panel-header">
          <div className="notif-header-top">
            <div className="notif-title-row">
              <h2 className="notif-title-text">Notifications</h2>
              {nonLues > 0 && <span className="notif-badge-count">{nonLues}</span>}
            </div>
            <button onClick={onClose} className="notif-close-x" aria-label="Fermer">
              ✕
            </button>
          </div>

          <div className="notif-header-bottom">
            <button onClick={marquerToutesLues} className="notif-mark-all-btn">
              Tout marquer comme lu
            </button>
            
            <span className={`notif-sse-status ${connecte ? "connected" : "disconnected"}`}>
              {connecte ? "● Temps Réel Actif" : "○ Déconnecté"}
            </span>
          </div>
        </header>

        {/* Liste des notifications */}
        <div className="notif-panel-body">
          {notifications.length === 0 ? (
            <div className="notif-empty-state">
              <span className="notif-empty-icon">🔔</span>
              <h3 className="notif-empty-title">Aucune notification</h3>
              <p className="notif-empty-sub">Les nouvelles commandes apparaîtront ici dès leur réception.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => marquerLue(notif.id)}
                className={`notif-item-card ${notif.lue ? "lue" : "non-lue"}`}
              >
                <div className="notif-item-header">
                  <span className="notif-item-label">🛒 Nouvelle Commande</span>
                  <span className="notif-item-time">{formatTimeElapsed(notif.timestamp)}</span>
                </div>

                <h3 className="notif-item-client">{notif.client}</h3>
                
                <p className="notif-item-details">
                  Gouvernorat : {notif.gouvernorat} · {notif.articles} article(s)
                </p>
                
                <div className="notif-item-meta-row">
                  <p className="notif-item-total">TOTAL : {notif.total} DT</p>
                  <span className="notif-status-badge">En attente</span>
                </div>

                <div className="notif-item-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      marquerLue(notif.id);
                      if (onViewOrders) onViewOrders();
                      onClose();
                    }}
                    className="notif-action-btn-go"
                  >
                    Voir commandes
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      supprimerNotif(notif.id);
                    }}
                    className="notif-action-btn-del"
                    title="Supprimer la notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
