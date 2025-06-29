import React, { useState } from 'react';
import products from '../products';
import ProductCard from './ProductCard';
import { useLocation } from 'react-router-dom';

const categories = [
  'All',
  ...Array.from(new Set(products.map((p) => p.category))),
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ProductList({ onAddToCart }) {
  const query = useQuery();
  const urlCategory = query.get('category');
  const urlSearch = query.get('search');
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory || 'All'
  );
  React.useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlCategory]);
  let filtered =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);
  if (urlSearch && urlSearch.trim()) {
    const searchLower = urlSearch.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full border font-bold transition-colors ${
              selectedCategory === cat
                ? 'bg-[#b89b72] text-white border-[#b89b72]'
                : 'bg-white text-[#b89b72] border-[#b89b72]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-400 text-lg py-12">
            No products found for your search.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
