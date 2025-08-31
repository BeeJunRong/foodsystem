import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '@/services/api';
import { restaurant } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Order } from '@/lib/types';

// 订单状态类型
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed';

// 订单状态配置
const statusConfig = {
  pending: {
    label: '已提交',
    description: '订单已提交，等待餐厅确认',
    icon: 'fa-clock',
    color: 'bg-yellow-100 text-yellow-800'
  },
  preparing: {
    label: '制作中',
    description: '厨师正在精心制作您的美食',
    icon: 'fa-fire',
    color: 'bg-orange-100 text-orange-800'
  },
  ready: {
    label: '已备好',
    description: '您的美食已制作完成，等待服务员送达',
    icon: 'fa-check-circle',
    color: 'bg-blue-100 text-blue-800'
  },
  served: {
    label: '已送达',
    description: '您的美食已送达餐桌，请享用',
    icon: 'fa-utensils',
    color: 'bg-green-100 text-green-800'
  },
  completed: {
    label: '已完成',
    description: '订单已完成，感谢您的光临',
    icon: 'fa-star',
    color: 'bg-purple-100 text-purple-800'
  }
};

export default function OrderStatusPage() {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('pending');
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>(15); // 预计等待时间（分钟）
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // 获取订单状态
  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    
    // 获取初始订单状态
    const fetchOrderStatus = async () => {
      setLoading(true);
      try {
        const response = await orderApi.getOrderStatus(orderId);
        if (response.success && response.data) {
          setCurrentStatus(response.data.status);
          setProgress(response.data.progress);
          setEstimatedTime(response.data.estimatedTime);
          setError(null);
        } else {
          setError(response.error || '获取订单状态失败');
        }
      } catch (err) {
        setError('网络错误，无法获取订单状态');
        console.error('Error fetching order status:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderStatus();
    
    // 定期轮询更新订单状态
    const statusInterval = setInterval(fetchOrderStatus, 30000); // 每30秒更新一次
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  // 获取当前状态配置
  const currentConfig = statusConfig[currentStatus];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 导航栏 */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-1"></i> 返回首页
          </button>
          <h1 className="text-xl font-semibold text-gray-900">订单状态</h1>
          <div className="w-8"></div> {/* 占位元素，保持标题居中 */}
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          {/* 订单号 */}
          <div className="bg-white rounded-xl p-4 mb-6 text-center shadow-sm">
            <p className="text-gray-500 text-sm mb-1">订单编号</p>
            <p className="font-mono font-medium text-gray-900">{orderId}</p>
          </div>

          {/* 订单状态卡片 */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-medium text-gray-700">加载订单状态中...</h3>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <i className="fa-solid fa-exclamation-circle text-5xl text-red-300 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-700 mb-2">{error}</h3>
                <button
                  onClick={() => orderApi.getOrderStatus(orderId!).then(response => {
                    if (response.success && response.data) {
                      setCurrentStatus(response.data.status);
                      setProgress(response.data.progress);
                      setEstimatedTime(response.data.estimatedTime);
                      setError(null);
                    }
                  })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-refresh mr-2"></i> 重试
                </button>
              </div>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-full ${currentConfig.color} flex items-center justify-center mx-auto mb-4`}>
                  <i className={`fa-solid ${currentConfig.icon} text-2xl`}></i>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">{currentConfig.label}</h2>
                <p className="text-gray-500 text-center mb-6">{currentConfig.description}</p>
                
                {/* 订单进度条 */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>订单进度</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 预计等待时间 */}
                {estimatedTime !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm mb-1">预计等待时间</p>
                    <p className="text-3xl font-bold text-gray-900">{estimatedTime} <span className="text-lg font-normal">分钟</span></p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 订单进度 */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">订单进度 ({progress}%)</h3>
            
            <div className="space-y-6">
              {Object.entries(statusConfig).map(([status, config], index, array) => {
                const isCurrent = status === currentStatus;
                const isCompleted = Object.keys(statusConfig).indexOf(status) < Object.keys(statusConfig).indexOf(currentStatus);
                
                return (
                  <div key={status} className="relative">
                    <div className="flex items-start">
                      {/* 状态图标 */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted || isCurrent ? config.color : 'bg-gray-100 text-gray-400'
                      }`}>
                        <i className={`fa-solid ${config.icon}`}></i>
                      </div>
                      
                      {/* 状态信息 */}
                      <div className="ml-4">
                        <h4 className={`font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                          {config.label}
                        </h4>
                        <p className={`text-sm ${isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>
                          {config.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* 连接线 */}
                    {index < array.length - 1 && (
                      <div className={`absolute top-10 left-5 w-0.5 h-full ${
                        index < Object.keys(statusConfig).indexOf(currentStatus) 
                          ? statusConfig[Object.keys(statusConfig)[index + 1] as keyof typeof statusConfig].color.split(' ')[0] 
                          : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors hover:bg-gray-50"
            >
              <i className="fa-solid fa-plus mr-2"></i> 继续点餐
            </button>
            <button
              onClick={() => alert('客服电话：400-123-4567')}
              className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors hover:bg-gray-50"
            >
              <i className="fa-solid fa-phone mr-2"></i> 联系客服
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}