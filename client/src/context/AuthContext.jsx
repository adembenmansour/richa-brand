import React, { createContext, useContext, useState } from "react";

// Création du contexte d'authentification pour l'administration
const AuthContext = createContext();

// Fournisseur du contexte d'authentification
export function AuthProvider({ children }) {
  // Récupérer le token initial depuis le stockage local (si existant)
  const [token, setToken] = useState(
    localStorage.getItem("richa_admin_token") || null
  );
  
  // Récupérer les informations de l'administrateur depuis le stockage local (si existantes)
  const [admin, setAdmin] = useState(
    JSON.parse(localStorage.getItem("richa_admin_info") || "null")
  );

  // Fonction de connexion pour enregistrer le jeton et les infos administrateur
  const login = (token, adminInfo) => {
    localStorage.setItem("richa_admin_token", token);
    localStorage.setItem("richa_admin_info", JSON.stringify(adminInfo));
    setToken(token);
    setAdmin(adminInfo);
  };

  // Fonction de déconnexion pour effacer le jeton et les infos du stockage
  const logout = () => {
    localStorage.removeItem("richa_admin_token");
    localStorage.removeItem("richa_admin_info");
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser plus simplement le contexte d'authentification
export const useAuth = () => useContext(AuthContext);
