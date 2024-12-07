import React, { useEffect } from 'react'

interface ShippingFormProps {
  setShippingCost: (cost: number) => void
}

export function ShippingForm({ setShippingCost }: ShippingFormProps) {
  useEffect(() => {
    // Set default shipping cost to $5.99
    setShippingCost(5.99)
  }, [setShippingCost])

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Shipping</span>
        <span>$5.99</span>
      </div>
    </div>
  )
}

