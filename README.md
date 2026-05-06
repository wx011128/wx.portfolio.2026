# 危箫个人作品集网站

UX 设计师个人作品集网站。当前项目已经搭好 Vite + React + TypeScript 的前端环境，并按「首页、个人介绍、目录、四个作品」组织为 PDF 驱动的浏览结构。

## 常用命令

```bash
npm install
npm run dev
npm run build
```

## AI 作品集助手

网站右侧已经接入 AI 聊天助手，前端会请求 `/api/chat`，服务端接口会调用 OpenAI Responses API 并把回答流式返回给页面。

本地或部署环境需要配置：

```bash
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-5.4-mini
```

`OPENAI_MODEL` 可按需要替换；不要把真实 API Key 提交到代码仓库。

## 素材结构

AI 总览文件放在：

```text
source/portfolio-source.ai
```

页面素材按页面或项目放在 `public/assets/` 下的独立文件夹里，例如 `home/`、`about/`、`contents/`、`project-01/`。
