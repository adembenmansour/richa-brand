import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Composant enveloppe pour protéger les routes de l'espace administrateur
export default function ProtectedRoute({ children }) {
  const { isAuth } = useAuth();
  
  // Rediriger vers l'écran de connexion si l'administrateur n'est pas connecté
  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Afficher les composants enfants s'il est authentifié
  return children;
}
