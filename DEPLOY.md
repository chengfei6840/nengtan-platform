# 部署实证说明（2026-09-05 实测）

> 所有结论均来自本机真实服务器 + 浏览器实测，非推断。
> 产物：`dist/`（Vite 8 构建，SPA，BrowserRouter，`base='/'`）

## 一、实测结论矩阵

| 部署方式 | 入口页 | 客户端导航 | 刷新/直达深路由 | 结论 |
|---|---|---|---|---|
| 根路径 + vite preview（自带 fallback） | ✅ 200 | ✅ 正常 | ✅ 200 | 可用 |
| 根路径 + 纯静态服务器（python http.server） | ✅ 200 | ✅ 正常（实测导航到 /carbon/accounting 成功） | ❌ **404** | 仅首次从 / 进入可用 |
| 子目录部署（如 `/nengtan/`，base 未改） | ❌ **完全白屏**（JS 从 `/assets/` 加载 404，body 0 字符） | — | — | 不可用 |

**风险边界**：纯静态服务器下，演示者从 `http://host/` 进入后点菜单一切正常；**任何人刷新页面、收藏深链接、或直接把 `/carbon/accounting` 发给别人打开，就会 404**。演示场景极易触发。

## 二、部署要求（二选一）

### 方案 A：根路径部署（推荐，零改动）

`base` 保持默认 `/`，服务器配 SPA fallback。

nginx 配置：

```nginx
server {
    listen 80;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback，深路由刷新不 404
    }

    location /assets/ {
        expires 30d;                         # 带哈希的静态资源可长缓存
        add_header Cache-Control "public, immutable";
    }
}
```

其他静态托管对应配置：

| 平台 | 做法 |
|---|---|
| 阿里云 OSS 静态网站托管 | 默认支持（路由 404 时回源 index.html，控制台开"子目录首页"或设置 404 规则） |
| GitHub Pages | 会 404，需复制 `index.html` 为 `404.html`（`cp dist/index.html dist/404.html`） |
| Caddy | `try_files {path} /index.html` 一行 |

### 方案 B：子目录部署（如 `https://host/nengtan/`）

1. `vite.config.ts` 中设 **`base: '/nengtan/'`**（写死子路径）。
2. 重新 `npm run build`，产物放服务器 `/nengtan/` 下。
3. 服务器同样需要 SPA fallback（`try_files $uri $uri/ /nengtan/index.html`）。

**不要用 `base: './'`**：相对路径在深路由（如 `/carbon/accounting`）刷新时会解析成 `/carbon/assets/...`，直接炸——这是比子目录白屏更隐蔽的坑。

## 三、已修复

- favicon 指向脚手架残留 `/vite.svg`（404）→ 已改为 `/favicon.svg`（public/ 下实际存在），已重新构建。

## 四、已知未处理

- 单 JS 包 2.83MB（gzip 874KB），无代码分割。内网/演示可接受；公网首开慢 2~3 秒。优化需 manualChunks + 路由懒加载，有真实诉求再做。
