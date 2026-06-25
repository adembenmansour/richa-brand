import React from "react";
import { useCart } from "../context/CartContext";

export default function OrderSummary() {
  const { items, removeFromCart, totalPrice } = useCart();

  const scrollToCheckout = () => {
    const element = document.getElementById("delivery-form-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="order-summary-section">
      <div className="order-summary-header">
        <h2 className="label-caps" style={{ fontSize: "16px", color: "#000" }}>
          RÉCAPITULATIF DE COMMANDE
        </h2>
        <button
          type="button"
          className="btn btn-secondary page-header-btn"
          onClick={scrollToCheckout}
        >
          ○ FINALISER LA COMMANDE
        </button>
      </div>

      <table className="order-summary-table">
        <thead>
          <tr>
            <th>PRODUIT</th>
            <th>QTÉ</th>
            <th>TAILLE</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="4" className="order-summary-empty">
                AUCUN ARTICLE SÉLECTIONNÉ
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={`${item.id}-${item.taille}`}>
                <td className="order-summary-product-cell">
                  <img
                    src={item.image}
                    alt={item.nom}
                    className="order-summary-product-img"
                  />
                  <div className="order-summary-product-info">
                    <span className="order-summary-product-name">
                      {item.nom}
                    </span>
                    <button
                      type="button"
                      className="order-summary-remove"
                      onClick={() => removeFromCart(item.id, item.taille)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
                <td className="order-summary-qty-cell">{item.qte}</td>
                <td>{item.taille}</td>
                <td style={{ fontWeight: "bold" }}>
                  {item.prix * item.qte} DT
                </td>
              </tr>
            ))
          )}
          {items.length > 0 && (
            <tr className="order-summary-total-row">
              <td colSpan="3" style={{ textAlign: "right" }}>
                TOTAL :
              </td>
              <td>{totalPrice} DT</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
