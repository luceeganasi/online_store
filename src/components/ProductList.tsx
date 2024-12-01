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
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return <div>Loading products...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <section aria-labelledby="products-heading">
      <h2 id="products-heading" className="sr-only">Products</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.Product_ID} className="border rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold">{product.Product_Name}</h3>
            <p className="text-2xl font-bold mt-2">${parseFloat(product.Price).toFixed(2)}</p>
            <p className="mt-1">Size: {product.Size}, Color: {product.Color}</p>
            <p className="mt-1">In stock: {product.Stock}</p>
            <button 
              onClick={() => addToCart(product)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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

