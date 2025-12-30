interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error al cargar datos</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Ha ocurrido un error inesperado.'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
