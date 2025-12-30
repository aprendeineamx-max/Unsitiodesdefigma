export function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <div className="absolute top-0 left-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 opacity-20"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Cargando...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Por favor espera un momento</p>
        </div>
      </div>
    </div>
  );
}
