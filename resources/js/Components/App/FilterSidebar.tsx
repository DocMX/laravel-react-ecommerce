import React from 'react';

interface FiltersSidebarProps {
  categories: Array<{ id: number; name: string }>;
  filters: {
    search: string;
    category: string;
    priceRange: string;
    sort: string;
  };
  isLoading: boolean;
  onFilterChange: (title: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function FiltersSidebar({
  categories,
  filters,
  isLoading,
  onFilterChange,
  onApply,
  onClear,
}: FiltersSidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-fit">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Filtros</h3>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full rounded-lg border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      {/* Categorías */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Categoría</label>
        <select
          className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={filters.category ?? ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rango de precios */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Precio</label>
        <select
          className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={filters.priceRange || ''}
          onChange={(e) => onFilterChange('priceRange', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="0-50">$0 - $50</option>
          <option value="50-100">$50 - $100</option>
          <option value="100-200">$100 - $200</option>
          <option value="200-500">$200 - $500</option>
          <option value="500+">$500+</option>
        </select>
      </div>

      {/* Orden */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ordenar por</label>
        <select
          className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={filters.sort || 'latest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          <option value="latest">Más recientes</option>
          <option value="price_asc">Precio: Menor a Mayor</option>
          <option value="price_desc">Precio: Mayor a Menor</option>
        </select>
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onApply}
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
        </button>

        <button
          onClick={onClear}
          disabled={isLoading}
          className="w-full rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
        >
          Limpiar Filtros
        </button>
      </div>
    </aside>
  );
}
