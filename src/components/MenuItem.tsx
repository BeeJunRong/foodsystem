import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MenuItem as MenuItemType } from '@/lib/types';

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType) => void;
}

export default function MenuItem({ item, onAddToCart }: MenuItemProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    // 添加按钮点击效果
    setIsAdding(true);
    onAddToCart(item);
    
    // 1秒后恢复按钮状态
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
      {/* 菜品图片 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        
        {/* 热门标签 */}
        {item.popular && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            热门
          </div>
        )}
        
        {/* 分类标签 */}
        <div className="absolute top-2 right-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded">
          {item.category}
        </div>
      </div>
      
      {/* 菜品信息 */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
          <span className="font-bold text-lg text-gray-900">¥{item.price}</span>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>
        
        {/* 标签 */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* 添加到购物车按钮 */}
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className={cn(
            "w-full py-2.5 rounded-lg font-medium transition-all duration-300",
            isAdding
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          )}
        >
          {isAdding ? (
            <>
              <i className="fa-solid fa-check mr-2"></i> 已添加
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus mr-2"></i> 添加到购物车
            </>
          )}
        </button>
      </div>
    </div>
  );
}