// components/ProductList.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiStar, FiZoomIn, FiShoppingCart, FiFilter } from 'react-icons/fi';
import { addToCart } from '@/lib/cart';
import { getPublicSupabaseEnv } from '@/lib/env';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, priceRange, sortOption]);

  const fetchProducts = async () => {
    try {
      const { url, anon } = getPublicSupabaseEnv();
      const res = await fetch(`${url}/rest/v1/products?select=*`, {
        headers: {
          apikey: anon,
          authorization: `Bearer ${anon}`,
        },
      });
      const data = await res.json();
      setProducts(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setIsLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(product => 
      product.price_usd >= priceRange[0] && product.price_usd <= priceRange[1]
    );
    
    // Sort products
    switch(sortOption) {
      case 'price-low':
        filtered.sort((a, b) => a.price_usd - b.price_usd);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price_usd - a.price_usd);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // 'featured'
        // Default sorting - could be based on a featured field or creation date
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    setFilteredProducts(filtered);
  };

  const getCategories = () => {
    const categories = products
      .map(product => product.category)
      .filter(Boolean)
      .filter((category, index, arr) => arr.indexOf(category) === index);
    
    return ['all', ...categories];
  };

  const handleAddToCart = async (product) => {
    await addToCart({
      productId: product.id,
      name: product.name,
      priceUsd: Number(product.price_usd),
      quantity: 1,
      imageUrl: product.images && product.images[0]?.url,
      supplierId: product.supplier_id
    });
    
    // Show notification or feedback
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Filters */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h1>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center">
              <FiFilter className="text-gray-500 mr-2" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price Range Filter */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Sort Options */}
            <div>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700">No products found</h2>
            <p className="mt-2 text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart, onQuickView }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const img = product.images && product.images[0]?.url;

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center space-x-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={() => onQuickView(product)}
            className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Quick view"
          >
            <FiZoomIn className="text-gray-800" />
          </button>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 rounded-full shadow-md transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
            aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
          >
            <FiHeart className={isLiked ? "fill-current" : ""} />
          </button>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          {product.stock < 5 && product.stock > 0 && (
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">Low Stock</span>
          )}
          {product.stock === 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Out of Stock</span>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.short_description || product.description}</p>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-2xl font-bold text-blue-600">${product.price_usd}</span>
          
          <div className="flex items-center">
            {/* Star Ratings - would come from actual reviews in a real app */}
            <div className="flex mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar 
                  key={star} 
                  className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">(24)</span>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            <FiShoppingCart className="mr-2" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickViewModal({ product, onClose, onAddToCart }) {
  const img = product.images && product.images[0]?.url;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden">
              {img ? (
                <Image
                  src={img}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div>
              <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                      key={star} 
                      className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-gray-500">(24 reviews)</span>
              </div>
              
              <p className="text-2xl font-bold text-blue-600 mb-4">${product.price_usd}</p>
              
              <p className="text-gray-700 mb-6">
                {product.description || product.short_description}
              </p>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Details</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {product.category && (
                    <li><span className="font-medium">Category:</span> {product.category}</li>
                  )}
                  <li><span className="font-medium">Availability:</span> {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</li>
                  <li><span className="font-medium">SKU:</span> {product.id}</li>
                </ul>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) {
                      onAddToCart(product);
                    }
                    onClose();
                  }}
                  disabled={product.stock === 0}
                  className={`flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}