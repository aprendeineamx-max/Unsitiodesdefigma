export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Cargando datos...</p>
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg h-[400px] animate-pulse">
          <div className="h-48 bg-gray-200 dark:bg-gray-700" />
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
