import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { orderApi, menuApi, revenueApi } from '@/services/api';
import { Order, MenuItem, RevenueData } from '@/lib/types';
import { restaurant } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

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

// 格式化日期为YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
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
  // 基础状态
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'revenue'>('orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // 订单管理状态
  const [orders, setOrders] = useState<Array<Order & { createdAt: string }>>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  
  // 菜单管理状态
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    tags: '',
    popular: false,
    image: ''
  });
  
  // 收入分析状态
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [startDate, setStartDate] = useState(formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))); // 7天前
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // 表单引用
  const menuFormRef = useRef<HTMLFormElement>(null);
  
  // 检查商家登录状态
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('merchantLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/merchant/login');
      return;
    }
    
    // 根据活动标签加载相应数据
    switch (activeTab) {
      case 'orders':
        fetchOrders();
        break;
      case 'menu':
        fetchMenuItems();
        break;
      case 'revenue':
        fetchRevenueData();
        break;
    }
    
    // 订单页面定期刷新
    if (activeTab === 'orders') {
      const interval = setInterval(fetchOrders, 5000); // 每5秒刷新一次
      return () => clearInterval(interval);
    }
  }, [activeTab, navigate, startDate, endDate]);
  
  // 获取订单数据
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.getOrderHistory();
      if (response.success && response.data) {
        // 按创建时间排序（最新的在前）
        const sortedOrders = response.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
        
        // 如果有选中的订单，更新其状态
        if (selectedOrder) {
          const updatedOrder = sortedOrders.find((o: any) => o.id === selectedOrder.id);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      } else {
        setError(response.error || '获取订单失败');
        toast.error('获取订单失败', { description: response.error || '请稍后重试' });
      }
    } catch (err: any) {
      setError('网络错误，无法加载订单');
      toast.error('获取订单失败', { description: err.message || '网络连接问题' });
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取菜单数据
  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuApi.getMenuItems();
      if (response.success && response.data) {
        setMenuItems(response.data);
      } else {
        setError(response.error || '获取菜单失败');
        toast.error('获取菜单失败', { description: response.error || '请稍后重试' });
      }
    } catch (err: any) {
      setError('网络错误，无法加载菜单');
      toast.error('获取菜单失败', { description: err.message || '网络连接问题' });
      console.error('Failed to fetch menu items:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取收入数据
  const fetchRevenueData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await revenueApi.getRevenueData(startDate, endDate);
      if (response.success && response.data) {
        setRevenueData(response.data);
        
        // 计算总计
        const totalRev = response.data.reduce((sum: number, item: RevenueData) => sum + item.revenue, 0);
        const totalOrd = response.data.reduce((sum: number, item: RevenueData) => sum + item.orderCount, 0);
        
        setTotalRevenue(totalRev);
        setTotalOrders(totalOrd);
      } else {
        setError(response.error || '获取收入数据失败');
        toast.error('获取收入数据失败', { description: response.error || '请稍后重试' });
      }
    } catch (err: any) {
      setError('网络错误，无法加载收入数据');
      toast.error('获取收入数据失败', { description: err.message || '网络连接问题' });
      console.error('Failed to fetch revenue data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 更新订单状态
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setLoading(true);
      const response = await orderApi.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        toast.success('订单状态已更新');
        fetchOrders();
      } else {
        toast.error('更新订单状态失败', { description: response.error || '请稍后重试' });
      }
    } catch (err: any) {
      toast.error('更新订单状态失败', { description: err.message || '网络连接问题' });
      console.error('Failed to update order status:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 添加新菜品
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!menuFormData.name || !menuFormData.price || !menuFormData.category) {
      toast.error('请填写必填字段', { description: '菜品名称、价格和分类为必填项' });
      return;
    }
    
    try {
      setLoading(true);
      
      // 处理标签
      const tags = menuFormData.tags ? menuFormData.tags.split(',').map(tag => tag.trim()) : [];
      
      // 生成图片URL
      const encodedName = encodeURIComponent(menuFormData.name);
      const imageUrl = `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=${encodedName}%20Chinese%20food%20dish%20photo`;
      
      const newItem = {
        ...menuFormData,
        price: Number(menuFormData.price),
        tags: tags.length > 0 ? tags : undefined,
        image: menuFormData.image || imageUrl
      };
      
      const response = await menuApi.addMenuItem(newItem);
      
      if (response.success && response.data) {toast.success('菜品添加成功');
        setIsAddMenuModalOpen(false);
        resetMenuForm();
        fetchMenuItems();
      } else {
        toast.error('添加菜品失败', { description: response.error || '请稍后重试' });
      }
    } catch (err: any) {
      toast.error('添加菜品失败', { description: err.message || '网络连接问题' });
      console.error('Failed to add menu item:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 更新菜品
  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMenuItem) return;
    
    if (!menuFormData.name || !menuFormData.price || !menuFormData.category) {
      toast.error('请填写必填字段', { description: '菜品名称、价格和分类为必填项' });
      return;
    }
    
    try {
      setLoading(true);
      
      // 处理标签
      const tags = menuFormData.tags ? menuFormData.tags.split(',').map(tag => tag.trim()) : [];
      
      const updates = {
        ...menuFormData,
        price: Number(menuFormData.price),
        tags: tags.length > 0 ? tags : undefined
      };
      
      const response = await menuApi.updateMenuItem(currentMenuItem.id, updates);
      
      if (response.success && response.data) {
        toast.success('菜品更新成功');
        setIsEditMenuModalOpen(false);
        setCurrentMenuItem(null);
        resetMenuForm();
        fetchMenuItems();
      } else {
        toast.error('更新菜品失败', { description: response.error || '请稍后重试' });
      }
    } catch (err: any) {
      toast.error('更新菜品失败', { description: err.message || '网络连接问题' });
      console.error('Failed to update menu item:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 删除菜品
  const handleDeleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`确定要删除菜品"${name}"吗？此操作不可撤销。`)) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await menuApi.deleteMenuItem(id);
      
      if (response.success) {
        toast.success('菜品已删除');
        fetchMenuItems();
      } else {
        toast.error('删除菜品失败', { description: response.error || '请稍后重试' });
      }
    } catch (err: any) {
      toast.error('删除菜品失败', { description: err.message || '网络连接问题' });
      console.error('Failed to delete menu item:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 打开编辑菜品模态框
  const openEditMenuModal = (item: MenuItem) => {
    setCurrentMenuItem(item);
    setMenuFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      tags: item.tags ? item.tags.join(', ') : '',
      popular: item.popular || false,
      image: item.image || ''
    });
    setIsEditMenuModalOpen(true);
  };
  
  // 重置菜单表单
  const resetMenuForm = () => {
    setMenuFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      tags: '',
      popular: false,
      image: ''
    });
  };
  
  // 筛选订单
  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === orderFilter);
  
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
              <p className="text-gray-500 text-sm">商家管理平台</p>
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
      
      {/* 导航标签 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('orders');
                setSelectedOrder(null);
              }}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-all whitespace-nowrap",
                activeTab === 'orders'
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <i className="fa-solid fa-file-invoice mr-2"></i> 订单管理
            </button>
            <button
              onClick={() => {
                setActiveTab('menu');
                setSelectedOrder(null);
                fetchMenuItems();
              }}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-all whitespace-nowrap",
                activeTab === 'menu'
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <i className="fa-solid fa-utensils mr-2"></i> 菜单管理
            </button>
            <button
              onClick={() => {
                setActiveTab('revenue');
                setSelectedOrder(null);
                fetchRevenueData();
              }}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-all whitespace-nowrap",
                activeTab === 'revenue'
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <i className="fa-solid fa-chart-line mr-2"></i> 收入分析
            </button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* 订单管理标签内容 */}
        {activeTab === 'orders' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">订单管理</h2>
                
                <div className="flex space-x-3">
                  <div className="relative">
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
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
                    onClick={fetchOrders}
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
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <i className="fa-solid fa-exclamation-circle text-5xl text-red-300 mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">{error}</h3>
                  <button
                    onClick={fetchOrders}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <i className="fa-solid fa-refresh mr-2"></i> 重试
                  </button>
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
          </>
        )}
        
        {/* 菜单管理标签内容 */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">菜单管理</h2>
              
              <button
                onClick={() => {
                  resetMenuForm();
                  setIsAddMenuModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <i className="fa-solid fa-plus mr-2"></i> 添加新菜品
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">加载菜单中...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fa-solid fa-exclamation-circle text-5xl text-red-300 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-700 mb-2">{error}</h3>
                <button
                  onClick={fetchMenuItems}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-refresh mr-2"></i> 重试
                </button>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-utensils text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">菜单为空</h3>
                <p className="text-gray-500 max-w-md mb-6">当前菜单中没有菜品，请添加新菜品</p>
                <button
                  onClick={() => {
                    resetMenuForm();
                    setIsAddMenuModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-plus mr-2"></i> 添加第一个菜品
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">图片</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">菜品名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-12 w-12 rounded-md overflow-hidden">
                            <img 
                              className="h-full w-full object-cover" 
                              src={item.image} 
                              alt={item.name} 
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{item.description || '无描述'}</div>
                            </div>
                            {item.popular && (
                              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                热门
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ¥{item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.available ? '可售' : '停售'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openEditMenuModal(item)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id, item.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* 收入分析标签内容 */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">收入分析</h2>
              
              <div className="flex space-x-3">
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500"
                  />
                </div>
                <span className="flex items-center text-gray-500">至</span>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500"
                  />
                </div>
                <button
                  onClick={fetchRevenueData}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  查询
                </button>
              </div>
            </div>
            
            {/* 收入统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">总销售额</p>
                <p className="text-3xl font-bold text-gray-900">¥{totalRevenue.toFixed(2)}</p>
                <div className="mt-2 flex items-center text-green-600 text-sm">
                  <i className="fa-solid fa-arrow-up mr-1"></i>
                  <span>共 {totalOrders} 订单</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">平均客单价</p>
                <p className="text-3xl font-bold text-gray-900">
                  ¥{totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
                </p>
                <div className="mt-2 flex items-center text-gray-500 text-sm">
                  <i className="fa-solid fa-coins mr-1"></i>
                  <span>每单平均消费</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">数据周期</p>
                <p className="text-2xl font-bold text-gray-900">
                  {startDate === endDate 
                    ? startDate 
                    : `${startDate} 至 ${endDate}`}
                </p>
                <div className="mt-2 flex items-center text-gray-500 text-sm">
                  <i className="fa-solid fa-calendar mr-1"></i>
                  <span>{revenueData.length} 天数据</span>
                </div>
              </div>
            </div>
            
            {/* 图表区域 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">收入趋势</h3>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <i className="fa-solid fa-exclamation-circle text-5xl text-red-300 mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">{error}</h3>
                  <button
                    onClick={fetchRevenueData}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <i className="fa-solid fa-refresh mr-2"></i> 重试
                  </button>
                </div>
              ) : revenueData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-chart-line text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">暂无数据</h3>
                  <p className="text-gray-500 max-w-md">所选日期范围内没有订单数据</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `¥${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`¥${value}`, '销售额']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {/* 收入明细 */}
            {revenueData.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">收入明细</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单数</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">销售额</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均客单价</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueData.map((item) => (
                        <tr key={item.date} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.orderCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ¥{item.revenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ¥{(item.orderCount > 0 ? item.revenue / item.orderCount : 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* 添加/编辑菜品模态框 */}
      {(isAddMenuModalOpen || isEditMenuModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {isAddMenuModalOpen ? '添加新菜品' : '编辑菜品'}
              </h3>
              <button
                onClick={() => {
                  setIsAddMenuModalOpen(false);
                  setIsEditMenuModalOpen(false);
                  setCurrentMenuItem(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <form 
              ref={menuFormRef}
              onSubmit={isAddMenuModalOpen ? handleAddMenuItem : handleUpdateMenuItem}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">菜品名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">菜品描述</label>
                  <textarea
                    value={menuFormData.description}
                    onChange={(e) => setMenuFormData({...menuFormData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={3}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格 (¥) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData({...menuFormData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类 <span className="text-red-500">*</span></label>
                  <select
                    value={menuFormData.category}
                    onChange={(e) => setMenuFormData({...menuFormData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">选择分类</option>
                    <option value="热菜">热菜</option>
                    <option value="凉菜">凉菜</option>
                    <option value="主食">主食</option>
                    <option value="汤品">汤品</option>
                    <option value="甜品">甜品</option>
                    <option value="饮品">饮品</option>
                    <option value="招牌菜">招牌菜</option>
                    <option value="素菜">素菜</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
                  <input
                    type="text"
                    value={menuFormData.tags}
                    onChange={(e) => setMenuFormData({...menuFormData, tags: e.target.value})}
                    placeholder="例如: 川菜,招牌,辣"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">图片URL (可选)</label>
                  <input
                    type="text"
                    value={menuFormData.image}
                    onChange={(e) => setMenuFormData({...menuFormData, image: e.target.value})}
                    placeholder="输入图片URL地址"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">不填则自动生成菜品图片</p>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={menuFormData.popular}
                    onChange={(e) => setMenuFormData({...menuFormData, popular: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="popular" className="ml-2 block text-sm text-gray-700">
                    标记为热门菜品
                  </label>
                </div>
                
                {isEditMenuModalOpen && currentMenuItem && (
                  <div className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      id="available"
                      checked={currentMenuItem.available}
                      onChange={(e) => {
                        setCurrentMenuItem({...currentMenuItem, available: e.target.checked});
                        menuApi.updateMenuItem(currentMenuItem.id, {available: e.target.checked});
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                      {currentMenuItem.available ? '当前可售，取消勾选则停售' : '当前停售，勾选则恢复可售'}
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMenuModalOpen(false);
                    setIsEditMenuModalOpen(false);
                    setCurrentMenuItem(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i> 保存中...
                    </span>
                  ) : isAddMenuModalOpen ? '添加菜品' : '更新菜品'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <footer className="py-4 px-6 text-center text-gray-500 text-sm">
        <p>商家管理系统 &copy; {new Date().getFullYear()} {restaurant.name}</p>
      </footer>
    </div>
  );
}