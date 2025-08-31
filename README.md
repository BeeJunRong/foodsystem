# 点餐系统

一个完整的点餐系统，包含手机扫码点餐和商家后台管理功能。

## 功能特点

- 顾客端：扫码点餐、菜单浏览、购物车管理、订单跟踪
- 商家端：订单管理、菜单管理、收入统计分析
- 纯前端实现，使用localStorage存储数据

## 本地开发

1. 克隆仓库
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm dev
```

4. 在浏览器中访问 `http://localhost:3000`

## 部署到GitHub Pages

1. 修改package.json中的homepage字段为你的仓库地址
```json
"homepage": "https://yourusername.github.io/your-repo-name"
```

2. 构建并部署
```bash
pnpm deploy
```

3. 在浏览器中访问 `https://yourusername.github.io/your-repo-name`

## 使用说明

### 顾客使用流程
1. 访问系统首页
2. 点击"扫码点餐"或直接访问"/scan"
3. 扫描餐桌二维码或手动输入桌号
4. 浏览菜单并添加菜品到购物车
5. 确认订单并提交

### 商家使用流程
1. 访问"/merchant/login"
2. 使用默认密码"admin123"登录
3. 在仪表盘管理订单、菜单和查看收入数据

## 技术栈
- React 18+
- TypeScript
- Tailwind CSS
- React Router
- Recharts