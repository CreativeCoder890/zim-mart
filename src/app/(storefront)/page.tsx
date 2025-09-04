'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Keep your original data fetching logic
import { getProducts } from '@/lib/products'; // <-- adjust this import to your actual fetch
import { Product } from '@/types'; // <-- adjust this import to your actual type

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-600 tracking-wide">Zim Mart</h1>
          <input
            type="search"
            placeholder="Search products..."
            className="border rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />
          <Link href="/cart" className="text-orange-600 font-semibold hover:underline">
            Cart
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-64 bg-white rounded shadow p-4 hidden md:block">
          <h2 className="font-semibold mb-4 text-lg">Filters</h2>
          {/* Example filter */}
          <div>
            <label className="block mb-2 text-sm">Category</label>
            <select className="w-full border rounded p-2">
              <option>All</option>
              {/* Dynamically add categories if needed */}
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <section className="flex-1">
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col border border-transparent hover:border-orange-200"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={product.images?.[0]?.url || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover rounded-t"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <span className="font-semibold text-lg truncate">{product.name}</span>
                    <span className="text-orange-600 font-bold text-xl mt-auto">${Number(product.price_usd).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}