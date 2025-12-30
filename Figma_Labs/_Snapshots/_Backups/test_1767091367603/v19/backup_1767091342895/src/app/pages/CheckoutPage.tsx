import { useState } from 'react';
import { CreditCard, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

interface CheckoutPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function CheckoutPage({ onSuccess, onBack }: CheckoutPageProps) {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create payment intent (would call Stripe API in production)
      await api.createPaymentIntent(items);
      
      // Clear cart and show success
      clearCart();
      setStep('success');
      
      // Track conversion
      api.trackEvent('checkout_complete', { 
        total, 
        itemCount: items.length 
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl mb-4">¡Pago exitoso!</h1>
            <p className="text-gray-600 mb-8">
              Hemos enviado la confirmación a tu email. Ya puedes acceder a tus cursos.
            </p>
            <div className="space-y-3">
              <button 
                onClick={onSuccess}
                className="w-full bg-[#98ca3f] text-[#121f3d] py-3 rounded-lg hover:bg-[#87b935] transition-colors"
              >
                Ir a mis cursos
              </button>
              <button 
                onClick={onBack}
                className="w-full border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Checkout Form */}
          <div>
            <h1 className="text-3xl mb-6">Finalizar compra</h1>

            {/* Steps */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step === 'info' ? 'text-[#98ca3f]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'info' ? 'bg-[#98ca3f] text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Información</span>
              </div>
              <div className="flex-1 h-px bg-gray-300" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#98ca3f]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'payment' ? 'bg-[#98ca3f] text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Pago</span>
              </div>
            </div>

            {step === 'info' && (
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!email || !name}
                  className="w-full bg-[#98ca3f] text-[#121f3d] py-3 rounded-lg hover:bg-[#87b935] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar al pago
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Lock className="w-4 h-4" />
                  <span>Pago seguro con encriptación SSL</span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Número de tarjeta</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
                      placeholder="1234 5678 9012 3456"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Demo: usa 4242 4242 4242 4242
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de expiración</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) {
                          setExpiry(val.slice(0, 2) + '/' + val.slice(2, 4));
                        } else {
                          setExpiry(val);
                        }
                      }}
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
                      placeholder="MM/AA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVC</label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      maxLength={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20"
                      placeholder="123"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || !cardNumber || !expiry || !cvc}
                  className="w-full bg-[#98ca3f] text-[#121f3d] py-3 rounded-lg hover:bg-[#87b935] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Procesando...</>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pagar ${total}
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 pt-4 border-t">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-8" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-8" />
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl mb-4">Resumen del pedido</h2>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100">
                    <img src={item.image} alt={item.title} className="w-16 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.instructor}</p>
                    </div>
                    <span className="font-medium">${item.price}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuestos</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                <p className="font-medium mb-1">Garantía de devolución de 30 días</p>
                <p className="text-xs">Reembolso completo si no estás satisfecho</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
