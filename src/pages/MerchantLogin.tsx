import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { restaurant } from '@/lib/mockData';

export default function MerchantLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // 模拟商家登录验证
  const handleLogin = () => {
    // 简单密码验证（实际应用中应该使用更安全的验证方式）
    if (password === 'admin123') {
      // 保存商家登录状态
      localStorage.setItem('merchantLoggedIn', 'true');
      navigate('/merchant/dashboard');
    } else {
      setError('密码错误，请重试');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-1"></i> 返回
          </button>
          <h1 className="text-xl font-semibold text-gray-900">商家管理系统</h1>
          <div className="w-8"></div> {/* 占位元素 */}
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-utensils text-2xl text-blue-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{restaurant.name} 管理系统</h2>
              <p className="text-gray-500">请输入密码登录商家后台</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                <i className="fa-solid fa-exclamation-circle mr-2"></i>
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">管理员密码</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="请输入密码"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02]"
              >
                <i className="fa-solid fa-sign-in-alt mr-2"></i> 登录管理后台
              </button>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>默认密码: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code></p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-6 text-center text-gray-500 text-sm">
        <p>商家管理系统 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}