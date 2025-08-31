import { useNavigate } from "react-router-dom";
import { restaurant } from "@/lib/mockData";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
            {}
            <div className="h-40 bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute w-64 h-64 rounded-full bg-white -top-20 -left-20"></div>
                    <div className="absolute w-40 h-40 rounded-full bg-white top-10 right-10"></div>
                    <div className="absolute w-24 h-24 rounded-full bg-white bottom-10 left-1/3"></div>
                </div>
            </div>
            {}
            <main className="flex-1 -mt-24 px-6">
                <div className="max-w-md mx-auto">
                    {}
                    <div
                        className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-2xl">
                        <div className="h-48 bg-gray-200 relative">
                            <img
                                src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Modern%20Chinese%20restaurant%20interior%20design&sign=692a970be103ee8973df1c589c8fee2e"
                                alt={restaurant.name}
                                className="w-full h-full object-cover" />
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h1 className="text-2xl font-bold mb-1">{restaurant.name}</h1>
                                    <></>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-6">{restaurant.description}</p>
                            
                            {/* 使用指南卡片 */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                              <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                                <i className="fa-solid fa-info-circle mr-2"></i>如何点餐
                              </h3>
                              <ol className="text-blue-700 text-sm space-y-2 pl-6 list-decimal">
                                <li>点击"扫码点餐"按钮</li>
                                <li>扫描餐桌上的二维码</li>
                                <li>浏览菜单并添加喜欢的菜品</li>
                                <li>确认购物车并提交订单</li>
                                <li>在订单状态页查看进度</li>
                              </ol>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center text-gray-600">
                                    <i className="fa-solid fa-clock text-blue-500 mr-2"></i>
                                    <span>6:00 - 22:00</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <i className="fa-solid fa-phone text-blue-500 mr-2"></i>
                                    <span>{restaurant.contact}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate("/scan")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center">
                                    <i className="fa-solid fa-qrcode mr-2"></i>
                                    <span>扫码点餐</span>
                                </button>
                                <button
                                    onClick={() => navigate("/merchant/login")}
                                    className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center">
                                    <i className="fa-solid fa-tachometer-alt mr-2"></i>
                                    <span>商家入口</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <></>
                        <></>
                        <></>
                        <></>
                    </div>
                </div>
            </main>
            {}
            <footer className="py-6 px-6 text-center text-gray-500 text-sm">
                <p>欢迎使用扫码点餐系统</p>
                <p className="mt-1">如有问题，请联系服务员或拨打 {restaurant.contact}</p>
            </footer>
        </div>
    );
}