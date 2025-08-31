import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuApi } from '@/services/api';
import { MenuItem as MenuItemType } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import MenuItem from '@/components/MenuItem';
import MenuCategory from '@/components/MenuCategory';
import { cn } from '@/lib/utils';
import { menuItems } from '@/lib/mockData';
import { restaurant } from '@/lib/mockData';

interface MenuProps {
  tableNumber: string | null;
}

export default function Menu({ tableNumber }: MenuProps) {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const { addToCart, totalItems, totalAmount } = useCart();
  const navigate = useNavigate();

  // 监听滚动事件，用于导航栏样式变化
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 从API获取菜单数据
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await menuApi.getMenuItems();
        if (response.success && response.data) {
          setAllItems(response.data);
          
          // 提取所有分类
          const categoriesSet = new Set(response.data.map(item => item.category));
          setCategories(['全部', ...Array.from(categoriesSet)]);
        } else {
          setError(response.error || '获取菜单失败');
        }
      } catch (err) {
        setError('网络错误，无法加载菜单');
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);

  // 根据选中的分类筛选菜品
  useEffect(() => {
    if (activeCategory === '全部') {
      setFilteredItems(allItems);
    } else {
      setFilteredItems(allItems.filter(item => item.category === activeCategory));
    }
  }, [activeCategory, allItems]);

  // 如果没有桌号，重定向到扫描页面
  useEffect(() => {
    if (!tableNumber) {
      navigate('/scan');
    }
  }, [tableNumber, navigate]);

  // 添加菜品到购物车
  const handleAddToCart = (item: typeof menuItems[0]) => {
    addToCart(item);
  };

  // 重新加载菜单数据
  const reloadMenu = () => {
    setLoading(true);
    menuApi.getMenuItems().then(response => {
      if (response.success && response.data) {
        setAllItems(response.data);
        setError(null);
        
        // 更新分类
        const categoriesSet = new Set(response.data.map(item => item.category));
        setCategories(['全部', ...Array.from(categoriesSet)]);
      } else {
        setError(response.error || '获取菜单失败');
      }
    }).catch(() => {
      setError('网络错误，无法加载菜单');
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 导航栏 */}
      <header className={cn(
        "py-4 px-6 sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white shadow-md py-3" : "bg-transparent"
      )}>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/scan')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-1"></i> 返回
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
            {tableNumber && (
              <p className="text-sm text-gray-500">桌号: {tableNumber}</p>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/cart')}
            className="relative text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="fa-solid fa-shopping-cart text-xl"></i>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 餐厅信息 */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{restaurant.name}</h2>
            <p className="text-gray-600 text-sm mb-2">{restaurant.description}</p>
            <div className="flex items-center text-gray-500 text-sm">
              <i className="fa-solid fa-map-marker-alt mr-1"></i>
              <span>{restaurant.address}</span>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2" title="使用帮助">
            <i className="fa-solid fa-question-circle mr-1"></i> 帮助
          </button>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" title="联系服务员">
            <i className="fa-solid fa-phone mr-1"></i> 联系服务员
          </button>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-2 px-4 py-3 min-w-max">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
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

      {/* 菜品列表 */}
      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-medium text-gray-700 mb-1">加载菜单中...</h3>
            <p className="text-gray-500">请稍候，正在获取最新菜品信息</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <i className="fa-solid fa-exclamation-circle text-5xl text-red-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-700 mb-2">{error}</h3>
            <button
              onClick={reloadMenu}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-refresh mr-2"></i> 重试
            </button>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <MenuItem 
                key={item.id} 
                item={item} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <i className="fa-solid fa-utensils text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-700 mb-1">暂无菜品</h3>
            <p className="text-gray-500">该分类下暂无菜品，请选择其他分类</p>
          </div>
        )}
      </main>

      {/* 底部购物车栏 */}
      {totalItems > 0 && (
        <div className="bg-white border-t border-gray-200 py-4 px-6 shadow-lg">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-between transition-all transform hover:scale-[1.02]"
          >
            <div>
              <span className="font-bold text-lg mr-1">{totalItems}</span>
              <span>件商品</span>
               <span className="ml-4 font-bold text-lg">¥{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center">
              <span>去结算</span>
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}