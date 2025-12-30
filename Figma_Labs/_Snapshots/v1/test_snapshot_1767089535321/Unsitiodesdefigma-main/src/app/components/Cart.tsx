import { X, Trash2, ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const { items, removeFromCart, clearCart, totalPrice, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-[#121f3d] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-xl">Carrito ({totalItems})</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl mb-2 text-gray-700">Tu carrito está vacío</h3>
              <p className="text-gray-500 text-sm">
                Agrega cursos para comenzar tu aprendizaje
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.course.id} className="bg-gray-50 rounded-lg p-3 flex gap-3">
                  <div className="w-24 h-16 flex-shrink-0 rounded overflow-hidden">
                    <ImageWithFallback 
                      src={item.course.image}
                      alt={item.course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm mb-1 line-clamp-2">{item.course.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{item.course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#121f3d]">${item.course.price}</span>
                      <button 
                        onClick={() => removeFromCart(item.course.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {items.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="w-full text-sm text-red-600 hover:text-red-700 py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Vaciar carrito
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Descuento:</span>
                <span className="text-green-600">-$0</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-lg">Total:</span>
                <span className="text-2xl text-[#121f3d]">${totalPrice.toLocaleString()}</span>
              </div>
            </div>
            
            <button 
              onClick={() => {
                onCheckout?.();
                onClose();
              }}
              disabled={items.length === 0}
              className="w-full bg-[#98ca3f] text-[#121f3d] py-3 rounded-lg hover:bg-[#87b935] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceder al pago (${totalPrice.toLocaleString()})
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Garantía de devolución de 30 días
            </p>
          </div>
        )}
      </div>
    </>
  );
}