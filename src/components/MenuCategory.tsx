import { cn } from '@/lib/utils';

interface MenuCategoryProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function MenuCategory({ 
  categories, 
  activeCategory, 
  onSelectCategory 
}: MenuCategoryProps) {
  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto">
      <div className="flex space-x-2 px-4 py-3 min-w-max">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}