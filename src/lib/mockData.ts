import { MenuItem, Restaurant, RevenueData } from './types';

export const restaurant: Restaurant = {
  id: 'rest-001',
  name: '悦香园餐厅',
  description: '提供正宗中式美食，新鲜食材，匠心烹饪',
  contact: '138-1234-5678',
  address: '北京市朝阳区建国路88号'
};

export const menuItems: MenuItem[] = [
  {
    id: 'dish-001',
    name: '宫保鸡丁',
    description: '传统川菜，鸡肉鲜嫩，花生香脆，微辣可口',
    price: 48,
    image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Kung%20Pao%20Chicken%20Chinese%20food%20dish%20photo&sign=7cd760f60829d219b0f92819249cf621',
    category: '热菜',
    popular: true,
    tags: ['川菜', '招牌'],
    available: true
  },
  {
    id: 'dish-002',
    name: '鱼香肉丝',
    description: '经典川菜，肉丝滑嫩，配菜丰富，酸甜可口',
    price: 42,
    image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Yuxiang%20Shredded%20Pork%20Chinese%20food%20dish%20photo&sign=5d291d0babbf506f5ef683e6d075aea7',
    category: '热菜',
    tags: ['川菜'],
    available: true
  },
  {
    id: 'dish-003',
    name: '北京烤鸭',
    description: '招牌菜，皮脆肉嫩，搭配葱丝、黄瓜和甜面酱',
    price: 168,
    image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Peking%20Duck%20Chinese%20food%20dish%20photo&sign=f3eedeed3d5bfb0827892f312f8a9ab1',
    category: '招牌菜',
    popular: true,
    tags: ['北京菜', '招牌'],
    available: true
  },
  {
    id: 'dish-004',
    name: '蒜蓉西兰花',
    description: '清爽素菜，西兰花脆嫩，蒜香浓郁',
    price: 32,
    image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Garlic%20Broccoli%20Chinese%20food%20dish%20photo&sign=d0a51223d7eaf3f26e76b58dfe1026bf',
    category: '素菜',
    tags: ['健康', '素食'],
    available: true
  },
  {
    id: 'dish-005',
    name: '担担面',
    description: '四川传统面食，麻辣鲜香，面条劲道',
    price: 28,
    image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Dan%20Dan%20Noodles%20Chinese%20food%20dish%20photo&sign=2f40c6f444e15fe282eb59f6c72dfcf5',
    category: '主食',
    tags: ['川菜', '面食'],
    available: true
  },
  {
    id: 'dish-006',
    name: '水果拼盘',
    description: '新鲜时令水果，营养丰富，清爽解腻',
    price: 38,
    image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Fruit%20Platter%20Chinese%20food%20dish%20photo&sign=281ad9df2d3fd3ce2c1dea949288070f',
    category: '甜品',
    tags: ['健康', '甜品'],
    available: true
  }
];

// 获取所有菜品种类
export const getCategories = (): string[] => {
  const categories = new Set(menuItems.map(item => item.category));
  return Array.from(categories);
};

// 生成过去30天的收入数据
export const generateRevenueData = (): RevenueData[] => {
  const revenueData: RevenueData[] = [];
  const today = new Date();
  
  // 生成过去30天的数据
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // 格式化日期为YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // 生成随机收入数据 (500-3000元)
    const revenue = Math.floor(Math.random() * 2500) + 500;
    
    // 生成随机订单数量 (5-30单)
    const orderCount = Math.floor(Math.random() * 25) + 5;
    
    revenueData.push({
      date: formattedDate,
      revenue,
      orderCount
    });
  }
  
  return revenueData;
};