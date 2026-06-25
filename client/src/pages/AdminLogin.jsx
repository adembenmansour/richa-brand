import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Page de connexion pour l'espace administrateur
export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("Réponse login:", response.status, data);

      if (!response.ok) {
        setError(data.error || "Identifiants incorrects.");
        return;
      }

      // Succès: sauvegarder token et rediriger
      login(data.token, data.admin);
      navigate("/admin/dashboard");

    } catch (err) {
      // Erreur réseau = serveur injoignable
      console.error("Erreur réseau login:", err);
      setError(
        "Impossible de joindre le serveur. " +
        "Vérifiez que le backend tourne sur le port 3001."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .admin-login-wrapper {
          background-color: #000000;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          box-sizing: border-box;
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 30px;
          width: 100%;
          max-width: 420px;
        }

        .admin-login-logo {
          color: #ffffff;
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 6px;
          margin: 0;
          text-transform: uppercase;
        }

        .admin-login-subtitle {
          color: #888888;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 3px;
          margin-top: 10px;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .admin-login-divider {
          height: 1px;
          background-color: #333333;
          width: 100%;
        }

        .admin-login-card {
          background-color: #ffffff;
          border: 1px solid #000000;
          padding: 48px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.5);
          box-sizing: border-box;
          border-radius: 0px !important;
        }

        .admin-login-form-group {
          margin-bottom: 24px;
        }

        .admin-login-form-group label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 8px;
          color: #000000;
          text-transform: uppercase;
        }

        .admin-login-input {
          width: 100%;
          border: 1px solid #000000;
          background-color: #ffffff;
          padding: 12px;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          border-radius: 0px !important;
          transition: border-color 0.2s ease;
        }

        .admin-login-input:focus {
          border-color: #555555;
        }

        .admin-login-button {
          width: 100%;
          background-color: #000000;
          color: #ffffff;
          border: none;
          padding: 14px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 0px !important;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-login-button:hover:not(:disabled) {
          background-color: #333333;
        }

        .admin-login-button:disabled {
          background-color: #888888;
          cursor: not-allowed;
        }

        .admin-login-error {
          color: #cc0000;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
          border-left: 2px solid #cc0000;
          padding-left: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-login-footer {
          color: #888888;
          font-size: 12px;
          text-align: center;
          margin-top: 30px;
          letter-spacing: 1px;
        }
      `}</style>
      
      <div className="admin-login-wrapper">
        <div className="admin-login-header">
          <h1 className="admin-login-logo">RICHA</h1>
          <p className="admin-login-subtitle">Espace Administrateur</p>
          <div className="admin-login-divider"></div>
        </div>

        <div className="admin-login-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="admin-login-error">{error}</div>}

            <div className="admin-login-form-group">
              <label htmlFor="email">Adresse Email</label>
              <input
                id="email"
                type="email"
                className="admin-login-input"
                placeholder="admin@richa.tn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="admin-login-form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="admin-login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? "CONNEXION EN COURS..." : "SE CONNECTER →"}
            </button>
          </form>
        </div>

        <p className="admin-login-footer">Accès réservé à l'équipe RICHA</p>
      </div>
    </>
  );
}
