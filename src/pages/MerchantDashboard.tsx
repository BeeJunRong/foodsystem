import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { orderApi } from '@/services/api';
import { Order } from '@/lib/types';
import { restaurant } from '@/lib/mockData';

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 计算订单总金额
const calculateTotal = (items: any[]) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// 订单状态样式映射
const statusStyles = {
  pending: {
    label: '待确认',
    class: 'bg-yellow-100 text-yellow-800'
  },
  preparing: {
    label: '制作中',
    class: 'bg-blue-100 text-blue-800'
  },
  ready: {
    label: '已备好',
    class: 'bg-purple-100 text-purple-800'
  },
  served: {
    label: '已上菜',
    class: 'bg-green-100 text-green-800'
  },
  completed: {
    label: '已完成',
    class: 'bg-gray-100 text-gray-800'
  },
  cancelled: {
    label: '已取消',
    class: 'bg-red-100 text-red-800'
  }
};

export default function MerchantDashboard() {
  const [orders, setOrders] = useState<Array<Order & { createdAt: string }>>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  
  // 检查商家登录状态
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('merchantLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/merchant/login');
      return;
    }
    
    // 获取所有订单
    fetchOrders();
    
    // 定期刷新订单
    const interval = setInterval(fetchOrders, 5000); // 每5秒刷新一次
    return () => clearInterval(interval);
  }, [navigate]);
  
  // 从localStorage获取所有订单
  const fetchOrders = () => {
    setLoading(true);
    
    try {
      // 从localStorage获取所有订单
      const storedOrders = localStorage.getItem('orders');
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // 按创建时间排序（最新的在前）
      orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(orders);
      
      // 如果有选中的订单，更新其状态
      if (selectedOrder) {
        const updatedOrder = orders.find((o: any) => o.id === selectedOrder.id);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 更新订单状态
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // 获取当前订单
      const storedOrders = localStorage.getItem('orders');
      if (!storedOrders) return;
      
      const orders = JSON.parse(storedOrders);
      const orderIndex = orders.findIndex((o: any) => o.id === orderId);
      
      if (orderIndex !== -1) {
        // 更新订单状态
        orders[orderIndex].status = newStatus;
        
        // 保存回localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // 刷新订单列表
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };
  
  // 筛选订单
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);
  
  // 登出
  const handleLogout = () => {
    localStorage.removeItem('merchantLoggedIn');
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white mr-3">
              <i className="fa-solid fa-utensils text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{restaurant.name} 管理系统</h1>
              <p className="text-gray-500 text-sm">商家订单监控面板</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">当前登录</p>
              <p className="font-medium text-gray-900">管理员</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="退出登录"
            >
              <i className="fa-solid fa-sign-out-alt text-xl"></i>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">订单管理</h2>
            
            <div className="flex space-x-3">
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value="all">所有订单</option>
                  <option value="pending">待确认</option>
                  <option value="preparing">制作中</option>
                  <option value="ready">已备好</option>
                  <option value="served">已上菜</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setFilter('all');
                  fetchOrders();
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <i className="fa-solid fa-sync-alt mr-2"></i> 刷新
              </button>
            </div>
          </div>
          
          {/* 订单统计卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">总订单数</p>
              <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              <div className="mt-2 flex items-center text-green-600 text-sm">
                <i className="fa-solid fa-arrow-up mr-1"></i>
                <span>今日 {orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length} 单</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">待处理订单</p>
              <p className="text-3xl font-bold text-yellow-600">
                {orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length}
              </p>
              <div className="mt-2 flex items-center text-gray-500 text-sm">
                <i className="fa-solid fa-clock mr-1"></i>
                <span>需要及时处理</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">今日销售额</p>
              <p className="text-3xl font-bold text-green-600">
                ¥{orders
                  .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
                  .reduce((sum, order) => sum + calculateTotal(order.items), 0)
                  .toFixed(2)}
              </p>
              <div className="mt-2 flex items-center text-gray-500 text-sm">
                <i className="fa-solid fa-calendar mr-1"></i>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">完成率</p>
              <p className="text-3xl font-bold text-blue-600">
                {orders.length > 0 
                  ? Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100) 
                  : 0}%
              </p>
              <div className="mt-2 flex items-center text-gray-500 text-sm">
                <i className="fa-solid fa-check-circle mr-1"></i>
                <span>订单完成情况</span>
              </div>
            </div>
          </div>
          
          {/* 订单列表 */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">加载订单中...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-file-invoice text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">暂无订单</h3>
              <p className="text-gray-500 max-w-md">当前没有符合条件的订单。顾客扫码下单后，订单将显示在这里。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">桌号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.tableNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{calculateTotal(order.items).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[order.status as keyof typeof statusStyles].class}`}>
                          {statusStyles[order.status as keyof typeof statusStyles].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">查看</button>
                        {order.status === 'pending' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'preparing');
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            确认
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* 订单详情 */}
        {selectedOrder && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">订单详情 #{selectedOrder.id}</h2>
                <p className="text-gray-500">桌号: {selectedOrder.tableNumber} | 下单时间: {formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              
              <div className="flex space-x-3">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <i className="fa-solid fa-check mr-2"></i> 确认订单
                  </button>
                )}
                
                {selectedOrder.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <i className="fa-solid fa-utensils mr-2"></i> 标记为已备好
                  </button>
                )}
                
                {selectedOrder.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'served')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <i className="fa-solid fa-truck mr-2"></i> 标记为已上菜
                  </button>
                )}
                
                {selectedOrder.status === 'served' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <i className="fa-solid fa-check-circle mr-2"></i> 完成订单
                  </button>
                )}
                
                {['pending', 'preparing', 'ready'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <i className="fa-solid fa-times mr-2"></i> 取消订单
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">订单状态</h3>
              <div className="flex items-center space-x-4">
                {['pending', 'preparing', 'ready', 'served', 'completed'].map((status) => {
                  const isActive = selectedOrder.status === status;
                  const isCompleted = ['pending', 'preparing', 'ready', 'served', 'completed']
                    .indexOf(selectedOrder.status) > ['pending', 'preparing', 'ready', 'served', 'completed'].indexOf(status);
                  
                  return (
                    <div key={status} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive || isCompleted 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isActive || isCompleted ? (
                          <i className="fa-solid fa-check"></i>
                        ) : (
                          <span className="text-xs">{['待', '制', '备', '上', '完'][['pending', 'preparing', 'ready', 'served', 'completed'].indexOf(status)]}</span>
                        )}
                      </div>
                      <span className={`ml-2 text-sm ${
                        isActive ? 'font-medium text-blue-600' : 'text-gray-500'
                      }`}>
                        {statusStyles[status as keyof typeof statusStyles].label}
                      </span>
                      
                      {/* 连接线 */}
                      {status !== 'completed' && (
                        <div className={`w-12 h-0.5 ${
                          isCompleted || ['pending', 'preparing', 'ready', 'served', 'completed'].indexOf(status) < ['pending', 'preparing', 'ready', 'served', 'completed'].indexOf(selectedOrder.status)
                            ? 'bg-blue-600' 
                            : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">菜品列表</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">菜品</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单价</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">小计</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img className="h-10 w-10 rounded-md object-cover" src={item.image} alt={item.name} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">¥{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">订单汇总</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>菜品总价</span>
                      <span>¥{calculateTotal(selectedOrder.items).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>服务费</span>
                      <span>¥0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>配送费</span>
                      <span>¥0.00</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>订单总额</span>
                      <span className="text-blue-600">¥{calculateTotal(selectedOrder.items).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {selectedOrder.estimatedTime && (
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <i className="fa-solid fa-clock text-blue-500 mt-1"></i>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">预计完成时间</h4>
                          <div className="mt-1 text-sm text-blue-700">
                            <p>{selectedOrder.estimatedTime} 分钟</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-4 px-6 text-center text-gray-500 text-sm">
        <p>商家管理系统 &copy; {new Date().getFullYear()} {restaurant.name}</p>
      </footer>
    </div>
  );
}