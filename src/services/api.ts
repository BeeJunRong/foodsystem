/**
 * 模拟API服务层，用于客户端与服务端交互
 */
import { Order, MenuItem, CartItem, RevenueData } from '@/lib/types';

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
    
    // 从localStorage获取可能已修改的菜单数据
    const storedMenuItems = localStorage.getItem('menuItems');
    if (storedMenuItems) {
      try {
        return {
          success: true,
          data: JSON.parse(storedMenuItems)
        };
      } catch (error) {
        console.error('Failed to parse stored menu items', error);
      }
    }
    
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
    
    const response = await menuApi.getMenuItems();
    if (!response.success || !response.data) {
      return {
        success: false,
        error: '获取菜单失败'
      };
    }
    
    const item = response.data.find(item => item.id === id);
    
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
  },
  
  /**
   * 添加新菜品
   */
  addMenuItem: async (item: Omit<MenuItem, 'id'>): Promise<ApiResponse<MenuItem>> => {
    await delay(800); // 模拟网络延迟
    
    const response = await menuApi.getMenuItems();
    if (!response.success || !response.data) {
      return {
        success: false,
        error: '获取菜单失败'
      };
    }
    
    // 创建新菜品ID
    const newId = `dish-${(response.data.length + 1).toString().padStart(3, '0')}`;
    const newItem: MenuItem = {
      id: newId,
      ...item,
      available: true
    };
    
    // 添加新菜品到菜单
    const updatedMenu = [...response.data, newItem];
    
    // 保存到localStorage
    localStorage.setItem('menuItems', JSON.stringify(updatedMenu));
    
    return {
      success: true,
      data: newItem
    };
  },
  
  /**
   * 更新菜品
   */
  updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> => {
    await delay(800); // 模拟网络延迟
    
    const response = await menuApi.getMenuItems();
    if (!response.success || !response.data) {
      return {
        success: false,
        error: '获取菜单失败'
      };
    }
    
    // 查找菜品索引
    const itemIndex = response.data.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return {
        success: false,
        error: '菜品不存在'
      };
    }
    
    // 更新菜品
    const updatedItem = { ...response.data[itemIndex], ...updates };
    const updatedMenu = [...response.data];
    updatedMenu[itemIndex] = updatedItem;
    
    // 保存到localStorage
    localStorage.setItem('menuItems', JSON.stringify(updatedMenu));
    
    return {
      success: true,
      data: updatedItem
    };
  },
  
  /**
   * 删除菜品
   */
  deleteMenuItem: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    await delay(800); // 模拟网络延迟
    
    const response = await menuApi.getMenuItems();
    if (!response.success || !response.data) {
      return {
        success: false,
        error: '获取菜单失败'
      };
    }
    
    // 过滤掉要删除的菜品
    const updatedMenu = response.data.filter(item => item.id !== id);
    
    // 保存到localStorage
    localStorage.setItem('menuItems', JSON.stringify(updatedMenu));
    
    return {
      success: true,
      data: { success: true }
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
    
    // 获取所有订单
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find((o: Order) => o.id === orderId);
    
    if (!order) {
      return {
        success: false,
        error: '订单不存在'
      };
    }
    
    // 根据订单状态计算进度
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'served', 'completed'];
    const statusIndex = statuses.indexOf(order.status);
    const progress = statusIndex >= 0 ? (statusIndex + 1) * 20 : 0;
    
    return {
      success: true,
      data: {
        status: order.status,
        progress,
        estimatedTime: order.estimatedTime
      }
    };
  },
  
  /**
   * 获取历史订单
   */
  getOrderHistory: async (startDate?: string, endDate?: string): Promise<ApiResponse<Order[]>> => {
    await delay(800); // 模拟网络延迟
    
    // 获取所有订单
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // 如果提供了日期范围，筛选订单
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const filteredOrders = orders.filter((order: Order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
      
      return {
        success: true,
        data: filteredOrders
      };
    }
    
    return {
      success: true,
      data: orders
    };
  },
  
  /**
   * 更新订单状态
   */
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<ApiResponse<Order>> => {
    await delay(500); // 模拟网络延迟
    
    // 获取所有订单
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex((o: Order) => o.id === orderId);
    
    if (orderIndex === -1) {
      return {
        success: false,
        error: '订单不存在'
      };
    }
    
    // 更新订单状态
    orders[orderIndex].status = status;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return {
      success: true,
      data: orders[orderIndex]
    };
  }
};

/**
 * 收入相关API
 */
export const revenueApi = {
  /**
   * 获取收入数据
   */
  getRevenueData: async (startDate?: string, endDate?: string): Promise<ApiResponse<RevenueData[]>> => {
    await delay(800); // 模拟网络延迟
    
    // 获取订单历史
    const response = await orderApi.getOrderHistory(startDate, endDate);
    if (!response.success || !response.data) {
      return {
        success: false,
        error: '获取订单历史失败'
      };
    }
    
    const orders = response.data;
    
    // 按日期分组计算收入
    const revenueMap: Record<string, RevenueData> = {};
    
    orders.forEach((order: Order) => {
      if (order.status === 'cancelled') return; // 忽略取消的订单
      
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!revenueMap[orderDate]) {
        revenueMap[orderDate] = {
          date: orderDate,
          revenue: 0,
          orderCount: 0
        };
      }
      
      revenueMap[orderDate].revenue += order.totalAmount;
      revenueMap[orderDate].orderCount += 1;
    });
    
    // 转换为数组并按日期排序
    const revenueData = Object.values(revenueMap).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return {
      success: true,
      data: revenueData
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