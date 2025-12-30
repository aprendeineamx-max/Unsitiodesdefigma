import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'popular' | 'rating' | 'price-low' | 'price-high' | 'newest';

interface SortOptionsProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortOptions({ selectedSort, onSortChange }: SortOptionsProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: 'Más populares' },
    { value: 'rating', label: 'Mejor calificados' },
    { value: 'price-low', label: 'Precio: menor a mayor' },
    { value: 'price-high', label: 'Precio: mayor a menor' },
    { value: 'newest', label: 'Más recientes' }
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-gray-700">
        <ArrowUpDown className="w-4 h-4" />
        <span className="text-sm">Ordenar por:</span>
      </div>
      <select 
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20 transition-colors"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
