import React, { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, onOpenSizeGuide, style }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [error, setError] = useState(false);

  const handleAddClick = () => {
    if (!selectedSize) {
      setError(true);
      return;
    }

    addToCart({
      id: product.id,
      nom: product.nom,
      prix: product.prix,
      image: product.image,
      taille: selectedSize
    });

    // Reset de l'état local après l'ajout réussi
    setSelectedSize(null);
    setError(false);
  };

  const sizes = ["XS", "S", "M", "L", "XL"];

  return (
    <article className="product-card animate-card" style={style}>
      {product.badge && (
        <span className="product-card-badge">{product.badge}</span>
      )}

      <div className="product-card-img-wrap">
        <img
          src={product.image}
          alt={product.nom}
          className="product-card-img"
          loading="lazy"
        />
      </div>

      <div className="product-card-content">
        <span className="label-caps product-card-category">
          {product.categorie}
        </span>
        <h3 className="product-card-title">{product.nom}</h3>
        <p className="price product-card-price">{product.prix} DT</p>
        <p className="product-card-description">{product.description}</p>

        <button
          type="button"
          className="product-card-sizes-trigger"
          onClick={onOpenSizeGuide}
        >
          ○ VOIR LE GUIDE DES TAILLES
        </button>

        <div className="product-card-sizes-label label-caps">
          TAILLE
        </div>

        <div className="product-card-sizes-list">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              className={`product-card-size-btn ${selectedSize === size ? "selected" : ""
                }`}
              onClick={() => {
                setSelectedSize(size);
                setError(false);
              }}
            >
              {size}
            </button>
          ))}
        </div>

        {error && (
          <p className="product-card-error">
            Veuillez sélectionner une taille
          </p>
        )}

        <button
          type="button"
          className="btn btn-primary product-card-add-btn"
          onClick={handleAddClick}
        >
          AJOUTER AU PANIER
        </button>
      </div>
    </article>
  );
}
