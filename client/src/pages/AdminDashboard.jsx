import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminStats from "../components/AdminStats";
import AdminOrders from "../components/AdminOrders";
import AdminProducts from "../components/AdminProducts";
import AdminMedia from "./AdminMedia";
import useNotifications from "../hooks/useNotifications";
import NotificationPanel from "../components/NotificationPanel";

// Tableau de bord principal de l'administration
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  
  // Onglet actif : "dashboard", "orders", "products" ou "media"
  const [activeTab, setActiveTab] = useState("dashboard");
  // État d'ouverture de la barre latérale sur mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialisation du hook des notifications SSE en temps réel
  const {
    notifications,
    nonLues,
    connecte,
    marquerToutesLues,
    marquerLue,
    supprimerNotif
  } = useNotifications();

  // État d'affichage du panneau latéral des notifications
  const [panelOuvert, setPanelOuvert] = useState(false);

  // Fonction de déconnexion
  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      <style>{`
        .admin-dashboard-container {
          display: flex;
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #000000;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Barre latérale noire fixe à gauche */
        .admin-sidebar {
          width: 240px;
          background-color: #000000;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
          padding: 30px 24px;
          box-sizing: border-box;
          transition: transform 0.3s ease;
          border-radius: 0px !important;
        }

        .admin-sidebar-header {
          margin-bottom: 24px;
        }

        .admin-sidebar-logo {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
          text-transform: uppercase;
        }

        .admin-sidebar-sub {
          font-size: 10px;
          color: #888888;
          font-weight: 500;
          letter-spacing: 3px;
          margin-top: 4px;
          margin-bottom: 0;
          text-transform: uppercase;
        }

        .admin-sidebar-divider {
          height: 1px;
          background-color: #333333;
          margin: 20px 0;
          width: 100%;
        }

        .admin-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }

        .admin-nav-item {
          background: none;
          border: none;
          color: #888888;
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 0px !important;
        }

        .admin-nav-item:hover, .admin-nav-item.active {
          color: #ffffff;
          background-color: #1a1a1a;
        }

        .admin-nav-item-icon {
          font-size: 14px;
        }

        .admin-logout-btn {
          background-color: #cc0000;
          color: #ffffff;
          border: none;
          padding: 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          width: 100%;
          text-transform: uppercase;
          transition: background-color 0.2s ease;
          border-radius: 0px !important;
          margin-top: auto;
        }

        .admin-logout-btn:hover {
          background-color: #990000;
        }

        /* Contenu principal décalé de la largeur de la sidebar */
        .admin-main-content {
          margin-left: 240px;
          padding: 40px;
          flex-grow: 1;
          box-sizing: border-box;
          min-width: 0; /* Évite les débordements avec Flexbox */
        }

        /* Bouton Menu Hamburger Mobile */
        .admin-mobile-toggle {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #000000;
          color: #ffffff;
          border: 1px solid #333333;
          border-radius: 0px !important;
          width: 56px;
          height: 56px;
          font-size: 20px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          z-index: 110;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
        }

        /* Overlay d'arrière-plan sur mobile */
        .admin-sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 90;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .admin-main-content {
            margin-left: 0;
            padding: 24px;
          }

          .admin-mobile-toggle {
            display: flex;
          }

          .admin-sidebar-overlay.open {
            display: block;
          }
        }
      `}</style>

      <div className="admin-dashboard-container">
        {/* Overlay pour fermer le menu mobile en cliquant à côté */}
        <div
          className={`admin-sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        {/* Barre latérale d'administration */}
        <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="admin-sidebar-header">
            <h2 className="admin-sidebar-logo">RICHA</h2>
            <p className="admin-sidebar-sub">Admin Panel</p>
          </div>
          
          <div className="admin-sidebar-divider"></div>
          
          <nav className="admin-sidebar-nav">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setIsSidebarOpen(false);
              }}
              className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            >
              <span className="admin-nav-item-icon">📊</span>
              Tableau de bord
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                setIsSidebarOpen(false);
              }}
              className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
            >
              <span className="admin-nav-item-icon">📦</span>
              Commandes
            </button>
            <button
              onClick={() => {
                setActiveTab("products");
                setIsSidebarOpen(false);
              }}
              className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
            >
              <span className="admin-nav-item-icon">👗</span>
              Produits
            </button>
            <button
              onClick={() => {
                setActiveTab("media");
                setIsSidebarOpen(false);
              }}
              className={`admin-nav-item ${activeTab === "media" ? "active" : ""}`}
            >
              <span className="admin-nav-item-icon">🖼️</span>
              Médias
            </button>
          </nav>

          <div className="admin-sidebar-divider"></div>

          {/* Bouton d'ouverture du panneau latéral des notifications */}
          <button
            onClick={() => setPanelOuvert(true)}
            className="admin-nav-item"
            style={{ color: "#ffffff", padding: "12px 16px", marginBottom: "16px", width: "100%" }}
          >
            <span className="admin-nav-item-icon">🔔</span>
            Notifications
            {nonLues > 0 && (
              <span style={{
                background: "#CC0000",
                color: "#FFF",
                borderRadius: "0px", // ← border-radius: 0px obligatoire
                width: "20px", 
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "bold",
                marginLeft: "auto"
              }}>
                {nonLues > 99 ? "99+" : nonLues}
              </span>
            )}
          </button>

          <button onClick={handleLogout} className="admin-logout-btn">
            Déconnexion
          </button>
        </aside>

        {/* Bouton Hamburger pour mobile */}
        <button
          className="admin-mobile-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Menu de navigation"
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>

        {/* Contenu principal de l'onglet actif */}
        <main className="admin-main-content">
          {/* Indicateur d'état de connexion SSE en temps réel */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1px",
              color: connecte ? "#16a34a" : "#cc0000",
              textTransform: "uppercase"
            }}>
              {connecte ? "● Temps Réel Actif" : "○ Déconnecté"}
            </span>
          </div>

          {activeTab === "dashboard" && <AdminStats />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "media" && <AdminMedia />}
        </main>

        {/* Panneau de notification coulissant et overlay d'arrière-plan */}
        {panelOuvert && (
          <NotificationPanel
            notifications={notifications}
            nonLues={nonLues}
            connecte={connecte}
            marquerToutesLues={marquerToutesLues}
            marquerLue={marquerLue}
            supprimerNotif={supprimerNotif}
            onClose={() => setPanelOuvert(false)}
            onViewOrders={() => setActiveTab("orders")}
          />
        )}

        {panelOuvert && (
          <div
            onClick={() => setPanelOuvert(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.3)",
              zIndex: 299
            }}
          />
        )}
      </div>
    </>
  );
}
