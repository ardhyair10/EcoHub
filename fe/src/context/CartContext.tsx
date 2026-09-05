"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  id: string; // Cart item unique ID
  product_id: string;
  name: string;
  price_idr: number;
  max_point_discount: number;
  image_url: string | null;
  quantity: number;
  points_used: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any, quantity: number, points_used: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updatePoints: (id: string, points_used: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalPointsUsed: number;
  totalFinalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("ecohub_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart data", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("ecohub_cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addToCart = (product: any, quantity: number, points_used: number) => {
    setItems((prev) => {
      // Check if product already in cart
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity, points_used: Math.min(item.points_used + points_used, product.max_point_discount) }
            : item
        );
      }

      // Add new item
      return [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          product_id: product.id,
          name: product.name,
          price_idr: product.price_idr,
          max_point_discount: product.max_point_discount,
          image_url: product.image_url,
          quantity,
          points_used: Math.min(points_used, product.max_point_discount),
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const updatePoints = (id: string, points_used: number) => {
    setItems((prev) => 
      prev.map((item) => (item.id === id ? { ...item, points_used: Math.max(0, Math.min(points_used, item.max_point_discount)) } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price_idr * item.quantity, 0);
  const totalPointsUsed = items.reduce((acc, item) => acc + item.points_used, 0);
  const totalFinalPrice = items.reduce((acc, item) => {
    return acc + Math.max(0, (item.price_idr * item.quantity) - item.points_used);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updatePoints,
        clearCart,
        totalItems,
        totalPrice,
        totalPointsUsed,
        totalFinalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
