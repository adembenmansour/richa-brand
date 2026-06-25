import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        RICHA
      </Link>
      <Link to="/commande" className="navbar-cart">
        PANIER ({totalItems})
      </Link>
    </nav>
  );
}
