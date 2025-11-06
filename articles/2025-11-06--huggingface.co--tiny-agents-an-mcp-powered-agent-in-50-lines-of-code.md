---
title: "Tiny Agents: an MCP-powered agent in 50 lines of code"
title_ja: ""
source_url: "https://huggingface.co/blog/tiny-agents"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、MCP (Model Context Protocol) を活用し、わずか50行のTypeScriptコードで強力なLLMエージェントを構築する方法を公開しました。MCPはLLMにツールを公開するための標準APIであり、LLMのネイティブなツール呼び出し機能と組み合わせることで、エージェント開発が劇的に簡素化されることを示しています。これにより、開発者は複雑なツール呼び出しロジックではなく、エージェントのコア機能に集中できるようになります。

## 重要ポイント

*   **MCP (Model Context Protocol) の活用**: LLMにフックできるツールのセットを公開する標準APIとしてMCPが導入され、エージェント開発の基盤となります。
*   **エージェントの簡素化**: MCPクライアントがあれば、エージェントは「その上のwhileループ」に過ぎず、わずか50行のコードで実装可能であることが実証されました。
*   **LLMのネイティブなツール呼び出しサポート**: 最新のLLM（クローズド・オープン問わず）が関数呼び出し（ツール利用）に最適化されていることが、この実装の鍵です。
*   **Hugging FaceのSDK利用**: `@huggingface/inference` (JS) と`huggingface_hub` (Python) のクライアントSDKをMCPクライアントとして拡張し、ツールをLLM推論に統合します。
*   **実用的なデモ**: ファイルシステムアクセスやサンドボックス化されたChromiumブラウザ利用など、具体的なツールを使ったエージェントのデモが提供されています。

## 詳細レポート

### What happened/背景

Hugging Faceは、MCP (Model Context Protocol) の可能性を探求し、LLMのネイティブなツール呼び出し機能と組み合わせることで、エージェントの構築が驚くほど簡単になることを発見しました。MCPは、LLMが利用できるツールのセットを標準APIとして公開するプロトコルであり、これにより、エージェントが外部環境と対話するためのインターフェースが統一されます。この発見に基づき、Hugging FaceはTypeScriptでわずか50行のコードで動作する「Tiny Agent」を実装し、その詳細を公開しました。

### 影響

このアプローチは、エージェントAIの開発を大幅に簡素化します。開発者は、ツールの定義やLLMとの連携方法に関する複雑な詳細に煩わされることなく、エージェントのロジックや利用するツールそのものに集中できるようになります。これにより、より迅速かつ効率的なエージェントのプロトタイピングと展開が可能になります。

### 関係者

*   **Hugging Face**: `InferenceClient`、`@huggingface/mcp-client`、`huggingface.js`モノリポの開発者。
*   **MCP (Model Context Protocol)**: LLMにツールを公開する標準API。
*   **OpenAI**: LLMのツール呼び出し機能の事実上の標準を確立し、多くのモデルがこれに準拠しています。
*   **LLMプロバイダー**: Nebius (デフォルトでQwen/Qwen2.5-72B-Instructを提供)。
*   **MCPサーバー**: ファイルシステムサーバー、Playwright MCPサーバーなど、エージェントに機能を提供するローカルプロセス。

### データ

| 項目                 | 詳細

---
## Source URL（必須）
https://huggingface.co/blog/tiny-agents

