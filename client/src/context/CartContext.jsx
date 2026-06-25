import React, { createContext, useContext, useState } from "react";

// Création du Contexte du Panier
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Ajouter un article au panier
  const addToCart = (newItem) => {
    setItems((prevItems) => {
      // Recherche si l'article existe déjà avec le même ID et la même TAILLE
      const existingIndex = prevItems.findIndex(
        (i) => i.id === newItem.id && i.taille === newItem.taille
      );

      if (existingIndex > -1) {
        // Si oui, on incrémente la quantité
        const updated = [...prevItems];
        updated[existingIndex].qte += 1;
        return updated;
      } else {
        // Sinon, on ajoute le nouvel article avec qte = 1
        return [...prevItems, { ...newItem, qte: 1 }];
      }
    });
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
