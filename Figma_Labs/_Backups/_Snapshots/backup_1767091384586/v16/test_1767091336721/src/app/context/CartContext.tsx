import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '../data/courses';

interface CartItem {
  course: Course;
  addedAt: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  totalItems: number;
  totalPrice: number;
  lastAddedCourse: Course | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('platzi-cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [lastAddedCourse, setLastAddedCourse] = useState<Course | null>(null);

  useEffect(() => {
    localStorage.setItem('platzi-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (course: Course) => {
    setItems(prev => {
      if (prev.some(item => item.course.id === course.id)) {
        return prev;
      }
      setLastAddedCourse(course);
      setTimeout(() => setLastAddedCourse(null), 3500);
      return [...prev, { course, addedAt: Date.now() }];
    });
  };

  const removeFromCart = (courseId: string) => {
    setItems(prev => prev.filter(item => item.course.id !== courseId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (courseId: string) => {
    return items.some(item => item.course.id === courseId);
  };

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.course.price, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      totalItems,
      totalPrice,
      lastAddedCourse
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}