import { useState, useEffect, useRef } from 'react';
import { Mail, Check, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VerifyEmailPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function VerifyEmailPage({ onBack, onSuccess }: VerifyEmailPageProps) {
  const { pendingVerificationEmail, verifyEmail, resendVerificationCode } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Resend timer
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      
      // Focus last filled input
      const lastIndex = Math.min(index + pastedCode.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newCode.every(digit => digit !== '') && !isVerifying) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const verificationCode = codeToVerify || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Por favor ingresa el código completo');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const verified = await verifyEmail(verificationCode);
      
      if (verified) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError('Código incorrecto. Por favor verifica e intenta de nuevo.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Error al verificar el código');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      await resendVerificationCode();
      setCanResend(false);
      setResendTimer(60);
      setError('');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el código');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121f3d] via-[#1a2d5a] to-[#0d1628] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              success 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {success ? (
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : (
                <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
            {success ? '¡Email Verificado!' : 'Verifica tu Email'}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            {success ? (
              'Tu cuenta ha sido verificada exitosamente'
            ) : (
              <>
                Hemos enviado un código de 6 dígitos a<br />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {pendingVerificationEmail}
                </span>
              </>
            )}
          </p>

          {!success && (
            <>
              {/* Code Inputs */}
              <div className="flex justify-center gap-2 md:gap-3 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 rounded-xl transition-all ${
                      error
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : digit
                        ? 'border-[#98ca3f] bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98ca3f] focus:border-transparent`}
                    disabled={isVerifying || success}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-6 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={() => handleVerify()}
                disabled={isVerifying || code.some(d => !d)}
                className="w-full py-4 bg-[#98ca3f] hover:bg-[#87b935] disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors mb-4"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  'Verificar Email'
                )}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  ¿No recibiste el código?
                </p>
                <button
                  onClick={handleResend}
                  disabled={!canResend}
                  className={`text-sm font-medium transition-colors ${
                    canResend
                      ? 'text-[#98ca3f] hover:text-[#87b935]'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {canResend ? (
                    'Reenviar código'
                  ) : (
                    `Reenviar en ${resendTimer}s`
                  )}
                </button>
              </div>
            </>
          )}

          {success && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                <Check className="w-5 h-5" />
                Redirigiendo...
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-white/60 text-sm mt-6">
          Revisa tu bandeja de entrada y carpeta de spam
        </p>
      </div>
    </div>
  );
}
