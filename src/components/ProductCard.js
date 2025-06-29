import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product, onAddToCart }) {
  return (
    <Link to={`/product/${product.id}`} className="w-full">
      <div className="bg-card rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center cursor-pointer">
        <img
          src={product.image}
          alt={product.title}
          className="w-32 h-32 object-cover rounded-lg mb-2"
        />
        <h3 className="text-branding font-bold text-lg mb-1">
          {product.title}
        </h3>
        <p className="text-text text-sm mb-2 text-center min-h-[40px]">
          {product.description}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-price font-bold text-lg">${product.price}</span>
          {product.originalPrice && (
            <span className="text-oldprice line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(product);
          }}
          className="bg-branding text-white rounded px-4 py-2 font-semibold hover:bg-discount transition w-full mt-auto"
        >
          Add to Cart
        </button>
        {/* Quick-buy modal placeholder */}
      </div>
    </Link>
  );
}

export default ProductCard;
