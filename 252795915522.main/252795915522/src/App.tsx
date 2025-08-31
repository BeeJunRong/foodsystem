import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';
import { CartProvider } from '@/contexts/CartContext';

// 页面导入
import Home from "@/pages/Home";
import Scanner from "@/pages/Scanner";
import MerchantLogin from "@/pages/MerchantLogin";
import MerchantDashboard from "@/pages/MerchantDashboard";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import OrderStatus from "@/pages/OrderStatus";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scanner setTableNumber={setTableNumber} />} />
          <Route path="/menu" element={<Menu tableNumber={tableNumber} />} />
           <Route path="/cart" element={<Cart />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          <Route path="/merchant/login" element={<MerchantLogin />} />
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
        </Routes>
      </CartProvider>
    </AuthContext.Provider>
  );
}
