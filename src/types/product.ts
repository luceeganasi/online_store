export interface Product {
  quantity: number;
  Product_ID: string;
  Product_Name: string;
  Price: string;
  Size: string;
  Color: string;
  Stock: number;
  Variant_ID: string;
  Bundle_ID: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// Add this new interface
export interface ProductVariant {
  Variant_ID: string;
  Product_ID: string;
  Size: string;
  Price: string;
  Stock: number;
  Color: string;
  Bundle_ID?: string;
}

