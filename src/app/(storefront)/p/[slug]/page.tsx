// eslint-disable @next/next/no-img-element
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/lib/cart';
import { getPublicSupabaseEnv } from '@/lib/env';

type Product = { 
  id: string; 
  name: string; 
  price_usd: number; 
  description?: string; 
  images: { url?: string }[]; 
  supplier_id: string 
};

async function fetchProduct(slug: string) {
  const { url, anon } = getPublicSupabaseEnv();
  const res = await fetch(`${url}/rest/v1/products?select=*&slug=eq.${slug}`, {
    headers: {
      apikey: anon,
      authorization: `Bearer ${anon}`,
    },
    cache: 'no-store',
  });
  const data = await res.json();
  return data?.[0] as Product | undefined;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct(slug)
      .then((p) => setProduct(p ?? null))
      .catch((e) => setError(e.message));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        name: product.name,
        priceUsd: Number(product.price_usd),
        quantity: qty,
        imageUrl: img,
        supplierId: product.supplier_id
      });
      // Optional: Add success feedback here
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100">
          <div className="text-red-500 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading product...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch the details</p>
        </div>
      </div>
    );
  }

  const img = Array.isArray(product.images) && product.images[0]?.url ? product.images[0].url : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            
            {/* Product Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
                {img ? (
                  <Image 
                    src={img} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Image overlay for better visual appeal */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold">
                      ${Number(product.price_usd).toFixed(2)}
                    </span>
                    <span className="text-sm opacity-90 ml-1">USD</span>
                  </div>
                  
                  {/* Trust badge */}
                  <div className="flex items-center space-x-1 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">In Stock</span>
                  </div>
                </div>

                {product.description && (
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Product Description</h3>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Quantity and Add to Cart Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="font-semibold text-gray-700">Quantity:</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      className="w-16 text-center py-2 border-0 focus:outline-none focus:ring-0" 
                      min={1} 
                      value={qty} 
                      onChange={(e) => setQty(parseInt(e.target.value || '1', 10))}
                    />
                    <button 
                      onClick={() => setQty(qty + 1)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  
                  <Link 
                    href="/checkout" 
                    className="block w-full text-center bg-white border-2 border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-md"
                  >
                    Go to Checkout →
                  </Link>
                </div>

                {/* Features/Trust indicators */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v8a1 1 0 001 1h2a1 1 0 001-1V8a1 1 0 00-1-1h-2z" />
                    </svg>
                    <span>Fast Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}