/**
 * 模拟API服务层，用于客户端与服务端交互
 */
import { Order, MenuItem, CartItem } from '@/lib/types';

// 模拟延迟，模拟网络请求
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟API响应格式
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 餐桌相关API
 */
export const tableApi = {
  /**
   * 验证桌号是否有效
   */
  validateTable: async (tableNumber: string): Promise<ApiResponse<{ valid: boolean; message: string }>> => {
    await delay(500); // 模拟网络延迟
    
    // 简单验证逻辑：桌号必须以T开头，后跟数字
    const isValid = /^T\d+$/.test(tableNumber);
    
    return {
      success: true,
      data: {
        valid: isValid,
        message: isValid ? '桌号验证成功' : '无效的桌号格式'
      }
    };
  }
};

/**
 * 菜单相关API
 */
export const menuApi = {
  /**
   * 获取所有菜品
   */
  getMenuItems: async (): Promise<ApiResponse<MenuItem[]>> => {
    await delay(800); // 模拟网络延迟
    
    // 在实际应用中，这里会从服务器获取数据
    // 现在我们从本地导入模拟数据
    const { menuItems } = await import('@/lib/mockData');
    
    return {
      success: true,
      data: menuItems
    };
  },
  
  /**
   * 获取菜品详情
   */
  getMenuItemDetail: async (id: string): Promise<ApiResponse<MenuItem>> => {
    await delay(500); // 模拟网络延迟
    
    const { menuItems } = await import('@/lib/mockData');
    const item = menuItems.find(item => item.id === id);
    
    if (!item) {
      return {
        success: false,
        error: '菜品不存在'
      };
    }
    
    return {
      success: true,
      data: item
    };
  }
};

/**
 * 订单相关API
 */
export const orderApi = {
  /**
   * 创建新订单
   */
  createOrder: async (tableNumber: string, items: CartItem[]): Promise<ApiResponse<{ orderId: string; estimatedTime: number }>> => {
    await delay(1000); // 模拟网络延迟
    
    // 模拟订单创建成功
    const orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    const estimatedTime = Math.floor(Math.random() * 15) + 10; // 预计10-25分钟
    
    // 在实际应用中，这里会将订单数据发送到服务器
    // 我们这里仅模拟成功响应
    
     // 保存订单到localStorage
     const newOrder: Order = {
       id: orderId,
       tableNumber,
       items,
       totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
       status: 'pending',
       createdAt: new Date().toISOString(),
       estimatedTime
     };
     
     // 获取现有订单
     const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
     existingOrders.push(newOrder);
     
     // 保存订单
     localStorage.setItem('orders', JSON.stringify(existingOrders));
     
     return {
       success: true,
       data: {
         orderId,
         estimatedTime
       }
     };
  },
  
  /**
   * 获取订单状态
   */
  getOrderStatus: async (orderId: string): Promise<ApiResponse<{ status: Order['status']; progress: number; estimatedTime?: number }>> => {
    await delay(500); // 模拟网络延迟
    
    // 模拟订单状态
    // 在实际应用中，这里会从服务器获取真实订单状态
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'served', 'completed'];
    
    // 根据订单ID的哈希值生成一个伪随机但一致的进度
    let hash = 0;
    for (let i = 0; i < orderId.length; i++) {
      hash = (hash << 5) - hash + orderId.charCodeAt(i);
    }
    const progress = Math.abs(hash) % 100;
    const statusIndex = Math.min(Math.floor(progress / 20), statuses.length - 1);
    
    return {
      success: true,
      data: {
        status: statuses[statusIndex],
        progress,
        estimatedTime: statusIndex < 2 ? Math.floor((100 - progress) / 5) : undefined
      }
    };
  },
  
  /**
   * 获取历史订单
   */
  getOrderHistory: async (tableNumber: string): Promise<ApiResponse<Array<{ id: string; date: string; totalAmount: number; status: Order['status'] }>>> => {
    await delay(800); // 模拟网络延迟
    
    // 模拟历史订单数据
    return {
      success: true,
      data: [
        {
          id: 'ORD' + (Date.now() - 86400000).toString().slice(-8),
          date: new Date(Date.now() - 86400000).toLocaleString(),
          totalAmount: 128,
          status: 'completed'
        },
        {
          id: 'ORD' + (Date.now() - 172800000).toString().slice(-8),
          date: new Date(Date.now() - 172800000).toLocaleString(),
          totalAmount: 96,
          status: 'completed'
        }
      ]
    };
  }
};

/**
 * 支付相关API
 */
export const paymentApi = {
  /**
   * 处理支付
   */
  processPayment: async (orderId: string, amount: number): Promise<ApiResponse<{ transactionId: string; success: boolean }>> => {
    await delay(1500); // 模拟网络延迟
    
    // 模拟支付处理，95%成功率
    const paymentSuccess = Math.random() < 0.95;
    
    if (!paymentSuccess) {
      return {
        success: false,
        error: '支付处理失败，请重试'
      };
    }
    
    return {
      success: true,
      data: {
        transactionId: 'TRX' + Date.now() + Math.floor(Math.random() * 1000),
        success: true
      }
    };
  }
};