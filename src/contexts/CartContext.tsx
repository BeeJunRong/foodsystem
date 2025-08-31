import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { MenuItem } from '@/lib/types';

// 定义购物车商品类型
export interface CartItem extends MenuItem {
  quantity: number;
}

// 定义购物车状态类型
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

// 定义购物车操作类型
type CartAction =
  | { type: 'ADD_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' };

// 定义购物车上下文类型
interface CartContextType extends CartState {
  addToCart: (item: MenuItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

// 初始状态
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

// 创建上下文
const CartContext = createContext<CartContextType | undefined>(undefined);

// 计算总数和总金额
const calculateTotals = (items: CartItem[]): { totalItems: number; totalAmount: number } => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  return { totalItems, totalAmount };
};

// 购物车 reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      let updatedItems;
      
      if (existingItemIndex >= 0) {
        // 如果商品已存在，增加数量
        updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
      } else {
        // 如果商品不存在，添加新商品
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      
      const { totalItems, totalAmount } = calculateTotals(updatedItems);
      
      // 保存到本地存储
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalAmount
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity < 1) return state;
      
      const updatedItems = state.items.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      const { totalItems, totalAmount } = calculateTotals(updatedItems);
      
      // 保存到本地存储
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalAmount
      };
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload.id);
      
      const { totalItems, totalAmount } = calculateTotals(updatedItems);
      
      // 保存到本地存储
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalAmount
      };
    }
    
    case 'CLEAR_CART': {
      // 清除本地存储
      localStorage.removeItem('cart');
      
      return initialState;
    }
    
    default:
      return state;
  }
};

// 购物车提供者组件
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // 从本地存储加载购物车数据
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        const { totalItems, totalAmount } = calculateTotals(parsedCart);
        
        // 使用 dispatch 而不是直接修改 state
        dispatch({ type: 'CLEAR_CART' });
        parsedCart.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
            dispatch({ type: 'ADD_ITEM', payload: item });
          }
        });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      localStorage.removeItem('cart');
    }
  }, []);
  
  // 定义购物车操作方法
  const addToCart = (item: MenuItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  return (
    <CartContext.Provider value={{ 
      ...state, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

// 自定义 hook 方便使用购物车上下文
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};