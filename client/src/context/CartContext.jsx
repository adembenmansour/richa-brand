import React, { createContext, useContext, useState } from "react";

// Création du Contexte du Panier
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Ajouter un article au panier (remplace tout article existant)
  const addToCart = (newItem) => {
    setItems([{
      id: newItem.id || 1,
      nom: newItem.nom,
      prix: newItem.prix,
      taille: newItem.taille,
      image: newItem.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
      qte: 1
    }]);
  };

  // Supprimer un article du panier
  const removeFromCart = (id, taille) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.taille === taille))
    );
  };

  // Vider complètement le panier
  const clearCart = () => {
    setItems([]);
  };

  // Calculs calculés (computed properties)
  const totalItems = items.reduce((sum, item) => sum + item.qte, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.prix * item.qte, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personnalisé pour consommer le CartContext facilement
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé au sein d'un CartProvider");
  }
  return context;
};
