import { useState } from 'react';
import { CartItem as CartItemType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // 处理数量增加
  const handleIncrement = () => {
    setIsUpdating(true);
    onUpdateQuantity(item.id, item.quantity + 1);
    
    // 短暂延迟后重置状态，以显示更新动画
    setTimeout(() => setIsUpdating(false), 300);
  };

  // 处理数量减少
  const handleDecrement = () => {
    if (item.quantity <= 1) return;
    
    setIsUpdating(true);
    onUpdateQuantity(item.id, item.quantity - 1);
    
    // 短暂延迟后重置状态，以显示更新动画
    setTimeout(() => setIsUpdating(false), 300);
  };

  // 处理删除商品
  const handleRemove = () => {
    setIsRemoving(true);
    onRemove(item.id);
  };

  return (
    <div className={cn(
      "p-4 border-b border-gray-100 flex items-center",
      isRemoving ? "opacity-0 transition-opacity duration-300" : ""
    )}>
      {/* 商品图片 */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 商品信息 */}
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <p className="text-gray-500 text-sm line-clamp-1">{item.description}</p>
        <div className="flex justify-between items-center mt-1">
          <span className="font-bold text-gray-900">¥{item.price.toFixed()}</span>
          
          {/* 数量调整控件 */}
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || isUpdating}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <i className="fa-solid fa-minus text-sm"></i>
            </button>
            <span className="w-10 text-center font-medium">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <i className="fa-solid fa-plus text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}