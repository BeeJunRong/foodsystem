import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ScannerProps {
  setTableNumber: (tableNumber: string) => void;
}

export default function Scanner({ setTableNumber }: ScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 模拟扫描结果处理
  const handleScanResult = (simulated?: boolean) => {
    setScanning(false);
    
    // 模拟扫描结果 - 实际应用中应替换为真实扫描逻辑
    const tableNumber = simulated ? "T102" : prompt("请输入桌号") || "T101";
    
    if (tableNumber) {
      // 保存桌号到本地存储
      localStorage.setItem('tableNumber', tableNumber);
      setTableNumber(tableNumber);
      navigate('/menu');
    } else {
      setError('无效的餐桌号，请重试');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 开始扫描
  const startScanner = () => {
    setError(null);
    setScanning(true);
    
    // 3秒后自动模拟扫描成功
    setTimeout(() => handleScanResult(true), 3000);
  };

  // 停止扫描
  const stopScanner = () => {
    setScanning(false);
  };

  // 切换扫描状态
  const toggleScanner = () => {
    if (scanning) {
      stopScanner();
    } else {
      startScanner();
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
          <h1 className="text-xl font-semibold text-gray-900">扫码点餐</h1>
          <div className="w-8"></div> {/* 占位元素，保持标题居中 */}
        </div>
      </header>

      {/* 扫描区域 */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto">
          {/* 扫描框 */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-square mb-8 shadow-lg">
            {/* 扫描未启动时显示的提示 */}
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-6 text-center">
                <i className="fa-solid fa-qrcode text-6xl mb-4 text-blue-400"></i>
                <h2 className="text-2xl font-bold mb-2">扫描餐桌二维码</h2>
                <p className="text-gray-300 mb-2">将摄像头对准餐桌上的二维码进行扫描</p>
                <p className="text-gray-400 text-sm mb-6">或点击"手动输入桌号"按钮</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <button 
                    onClick={startScanner}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-full transition-all transform hover:scale-105"
                  >
                    <i className="fa-solid fa-camera mr-2"></i> 开始扫描
                  </button>
                  <button 
                    onClick={() => handleScanResult(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-full transition-all transform hover:scale-105"
                  >
                    <i className="fa-solid fa-keyboard mr-2"></i> 手动输入
                  </button>
                </div>
              </div>
            )}
            
            {/* 扫描中显示的框架 */}
            {scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-6 text-center">
                <div className="w-64 h-64 border-4 border-blue-500 rounded-2xl relative mb-8">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-blue-500 -mt-2 rounded-full"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-blue-500 -mb-2 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-16 bg-blue-500 -ml-2 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-16 bg-blue-500 -mr-2 rounded-full"></div>
                  
                  {/* 扫描线动画 */}
                  <div className="absolute top-4 left-4 right-4 h-1 bg-blue-500 animate-[scan_2s_infinite]"></div>
                </div>
                
                <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
                <h2 className="text-2xl font-bold mb-2">正在扫描...</h2>
                <p className="text-gray-300 mb-6">请将二维码对准扫描框</p>
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <i className="fa-solid fa-exclamation-circle mr-2"></i>
              <span>{error}</span>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex justify-center">
            <button
              onClick={toggleScanner}
              className={cn(
                "flex items-center justify-center font-medium py-3 px-8 rounded-full transition-all transform hover:scale-105",
                scanning 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {scanning ? (
                <>
                  <i className="fa-solid fa-stop mr-2"></i> 停止扫描
                </>
              ) : (
                <>
                  <i className="fa-solid fa-play mr-2"></i> 继续扫描
                </>
              )}
            </button>
          </div>
          
          {/* 手动输入桌号选项 */}
          <div className="text-center mt-6">
            <button 
              onClick={() => handleScanResult(false)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <i className="fa-solid fa-keyboard mr-1"></i> 手动输入桌号
            </button>
          </div>
        </div>
      </main>

      {/* 底部提示 */}
      <footer className="py-4 px-6 text-center text-gray-500 text-sm">
        <p>如果无法扫描，请联系服务员协助</p>
      </footer>

      {/* 扫描动画样式 */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(calc(100% - 1rem)); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}