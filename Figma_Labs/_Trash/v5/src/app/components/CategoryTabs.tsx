interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const allCategories = ['Todos', ...categories];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm mb-6 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-6 py-3 rounded-lg transition-all whitespace-nowrap font-semibold ${
              activeCategory === category
                ? 'bg-[#98ca3f] text-[#121f3d]'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
