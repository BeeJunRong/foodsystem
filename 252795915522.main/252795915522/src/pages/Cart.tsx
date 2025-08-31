import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { orderApi, paymentApi } from '@/services/api';
import { restaurant } from '@/lib/mockData';
import CartItem from '@/components/CartItem';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Cart() {
  const [submitting, setSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const { items, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState(localStorage.getItem('tableNumber') || '未知桌号');

  // 处理订单提交
  const handleSubmitOrder = async () => {
    if (items.length === 0) return;
    
    setSubmitting(true);
    setPaymentStep(false);
    
    try {
      // 获取桌号（在实际应用中，桌号应该从上下文中获取）
      const tableNumber = localStorage.getItem('tableNumber') || 'T101';
      
      // 1. 创建订单
      const orderResponse = await orderApi.createOrder(tableNumber, items);
      
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || '创建订单失败');
      }
      
      const { orderId, estimatedTime } = orderResponse.data;
      
      // 2. 处理支付（模拟）
      setPaymentStep(true);
      
      const paymentResponse = await paymentApi.processPayment(orderId, totalAmount);
      
      if (!paymentResponse.success || !paymentResponse.data?.success) {
        throw new Error(paymentResponse.error || '支付失败');
      }
      
      // 3. 支付成功，清空购物车并跳转到订单状态页面
      clearCart();
      toast.success('订单提交成功！', {
        description: `您的订单号: ${orderId}，预计${estimatedTime}分钟后送达`
      });
      navigate(`/order-status/${orderId}`);
    } catch (error: any) {
      toast.error('提交订单失败', {
        description: error.message || '请稍后重试'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 保存桌号到本地存储（在实际应用中，应该在扫码后设置）
  useEffect(() => {
    if (!localStorage.getItem('tableNumber')) {
      // 从URL参数获取桌号或使用默认值
      const params = new URLSearchParams(window.location.search);
      const tableNumber = params.get('table') || 'T101';
      localStorage.setItem('tableNumber', tableNumber);
    }
  }, []);

  // 返回菜单页面
  const handleBackToMenu = () => {
    navigate('/menu');
  };

  // 购物车为空时显示
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 导航栏 */}
        <header className="bg-white shadow-sm py-4 px-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/menu')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> 返回
            </button>
            <h1 className="text-xl font-semibold text-gray-900">我的购物车</h1>
            <div className="w-8"></div> {/* 占位元素，保持标题居中 */}
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-shopping-cart text-4xl text-gray-300"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2">购物车是空的</h2>
            <p className="text-gray-500 mb-8">您还没有添加任何菜品，快去点餐吧！</p>
            <button
              onClick={handleBackToMenu}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02]"
            >
              <i className="fa-solid fa-utensils mr-2"></i> 去点餐
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 导航栏 */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/menu')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-1"></i> 返回菜单
          </button>
          <h1 className="text-xl font-semibold text-gray-900">我的购物车</h1>
          <button
            onClick={clearCart}
            className="text-gray-500 hover:text-red-600 text-sm transition-colors"
          >
            <i className="fa-solid fa-trash-can mr-1"></i> 清空
          </button>
        </div>
      </header>

      {/* 餐厅和桌号信息 */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fa-solid fa-map-marker-alt text-gray-500 mr-2"></i>
            <span className="text-gray-700">{restaurant.name}</span>
          </div>
          <div className="flex items-center text-blue-600">
            <i className="fa-solid fa-table mr-1"></i>
            <span>桌号: {tableNumber}</span>
          </div>
        </div>
        
        {/* 简单操作提示 */}
        <div className="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="flex items-center">
            <i className="fa-solid fa-lightbulb mr-2 text-yellow-500"></i>
            提示：点击菜品可调整数量或移除，确认无误后点击"提交订单"
          </p>
        </div>
      </div>

      {/* 购物车商品列表 */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>
      </main>

      {/* 订单摘要和结算 */}
      <div className="bg-white border-t border-gray-200 py-4 px-6 shadow-lg">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>商品总价</span>
            <span>¥{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>服务费</span>
            <span>¥0.00</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>配送费</span>
            <span>免费</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
            <span>应付金额</span>
            <span>¥{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={submitting}
          className={cn(
            "w-full font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center",
            submitting
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {submitting ? (
            paymentStep ? (
              <>
                <i className="fa-solid fa-credit-card mr-2"></i> 处理支付中...
              </>
            ) : (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i> 创建订单中...
              </>
            )
          ) : (
            <>
              <span>提交订单</span>
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
}