interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
}

export function EmptyState({ 
  title = 'No hay datos', 
  message = 'No se encontraron registros para mostrar.', 
  icon = '📭' 
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

export function EmptyCoursesState() {
  return (
    <EmptyState 
      title="No se encontraron cursos" 
      message="Intenta ajustar los filtros o tu búsqueda para encontrar lo que necesitas."
      icon="🔍"
    />
  );
}
