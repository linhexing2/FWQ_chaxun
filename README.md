# 我的世界服务器状态查询 (Minecraft Server Status)

一个基于 React + Express 的全栈 Minecraft 服务器状态查询工具。界面圆润、动效平滑，支持 Java 版和基岩版服务器查询，并具备实时延迟监控功能。

## 功能特点

- **圆润 Q 弹 UI**：采用 Tailwind CSS 和 Framer Motion 打造，视觉体验极佳。
- **全栈架构**：内置 Express 后端代理，解决跨域 (CORS) 问题，查询更稳定。
- **多接口备份**：集成 mcstatus.io, mcsrvstat.us, minetools.eu 等多个顶级 API，确保 Hypixel 等大型服务器也能秒速解析。
- **实时监控**：每秒自动刷新服务器状态和延迟 (Latency)。
- **专属标识**：左上角带有“™木鈑”专属水印。

## 快速开始

### 1. 克隆仓库
```bash
git clone <你的仓库地址>
cd <项目目录>
```

### 2. 安装依赖
```bash
npm install
```

### 3. 本地开发
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000) 即可开始使用。

### 4. 生产环境部署
如果你想将本项目部署到 GitHub 或其他云平台（如 Railway, Zeabur, Render 等）：

1. **构建项目**：
   ```bash
   npm run build
   ```
2. **启动服务**：
   ```bash
   npm start
   ```

## 技术栈

- **前端**：React 19, Vite, Tailwind CSS, Lucide React, Framer Motion
- **后端**：Node.js, Express, tsx
- **API**：mcstatus.io (主要), mcsrvstat.us (备份), minetools.eu (备份)

## 贡献者

- **木鈑** (Project Owner)

## 许可证

Apache-2.0
