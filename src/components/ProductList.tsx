'use client'

import React, { useState, useEffect } from 'react'
import { Product } from '@/types/product'

interface ProductListProps {
  addToCart: (product: Product) => void
}

export function ProductList({ addToCart }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false);
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return <div className="text-center text-gray-700">Loading products...</div>
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>
  }

  if (products.length === 0) {
    return <div className="text-center text-gray-700">No products available.</div>
  }

  return (
    <section aria-labelledby="products-heading">
      <h2 id="products-heading" className="sr-only">Products</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.Variant_ID} className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{product.Product_Name}</h3>
            <p className="text-2xl font-bold mt-2 text-blue-600">${parseFloat(product.Price).toFixed(2)}</p>
            <p className="mt-1 text-gray-600">Size: {product.Size}, Color: {product.Color}</p>
            <p className="mt-1 text-gray-600">In stock: {product.Stock}</p>
            <button 
              onClick={() => addToCart(product)}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              aria-label={`Add ${product.Product_Name} to cart`}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

