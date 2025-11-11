---
title: 'Tiny Agents: an MCP-powered agent in 50 lines of code'
title_ja: MCPで動く超軽量エージェント、たった50行で実現
source_url: 'https://huggingface.co/blog/tiny-agents'
date: '2025-11-06'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '# 概要 (TL;DR)'
key_points:
  - >-
    - Hugging Faceは、MCP (Model Context Protocol)
    とLLMのネイティブなツール呼び出し機能を活用し、わずか50行のTypeScriptコードで強力なLLMエージェントを実装する方法を公開しました。MCPは
  - '- # 重要ポイント'
  - >-
    - *   **MCPの活用**: MCP (Model Context Protocol)
    は、LLMにフックできるツールのセットを公開するための標準APIであり、シンプルながら強力です。
  - >-
    - *   **エージェントの簡素化**:
    MCPクライアントがあれば、エージェントは「その上にwhileループがあるだけ」という極めてシンプルな構造で実装可能です。
  - >-
    - *   **LLMのネイティブツールサポート**:
    最近のLLMが関数呼び出し（ツール利用）にネイティブ対応していることが、このエージェント実装の基盤となっています。
---
# 概要 (TL;DR)

Hugging Faceは、MCP (Model Context Protocol) とLLMのネイティブなツール呼び出し機能を活用し、わずか50行のTypeScriptコードで強力なLLMエージェントを実装する方法を公開しました。MCPはLLMにツールを接続するための標準APIであり、エージェントはMCPクライアントとシンプルなwhileループの組み合わせとして実現され、エージェントAI開発を大幅に簡素化します。

# 重要ポイント

*   **MCPの活用**: MCP (Model Context Protocol) は、LLMにフックできるツールのセットを公開するための標準APIであり、シンプルながら強力です。
*   **エージェントの簡素化**: MCPクライアントがあれば、エージェントは「その上にwhileループがあるだけ」という極めてシンプルな構造で実装可能です。
*   **LLMのネイティブツールサポート**: 最近のLLMが関数呼び出し（ツール利用）にネイティブ対応していることが、このエージェント実装の基盤となっています。
*   **50行コードでの実現**: ファイルシステム操作やWebブラウジングなど、多様なツールを利用できるLLMエージェントをわずか50行のTypeScriptコードで実現しました。
*   **デモの提供**: `npx @huggingface/mcp-client` コマンドで簡単に試せるデモが提供されています。

# 詳細レポート

### What happened/背景

Hugging Faceは、MCP (Model Context Protocol) を活用し、LLMエージェントの実装を劇的に簡素化する「Tiny Agents」を発表しました。この取り組みの背景には、MCPがLLMに接続可能なツールのセットを公開するための標準APIとして注目されていること、そして最近のLLM（クローズド・オープン問わず）が関数呼び出し（ツール利用）にネイティブ対応していることがあります。Hugging Faceは、自社のInferenceClientをMCPクライアントとして拡張し、MCPサーバーから提供されるツールをLLM推論にフックする仕組みを構築。これにより、MCPクライアントさえあれば、エージェントは「その上にwhileループがあるだけ」というシンプルな構造で実現できることを実証しました。

### 影響

このアプローチは、LLMエージェントの開発を大幅に簡素化し、よりアクセスしやすくすることで、エージェントAIの普及と進化を加速させる可能性を秘めています。開発者は複雑なツール統合やプロンプトエンジニアリングに時間を費やすことなく、エージェントのロジックに集中できるようになります。

### 関係者

*   **Hugging Face**: 記事の著者であり、InferenceClientやmcp-clientサブパッケージの開発元。
*   **MCP (Model Context Protocol)**: LLMにツールを接続するための標準プロトコル。
*   **OpenAI**: LLMの関数呼び出し機能において、事実上の業界標準を設定していると記事中で言及されています。

### データ

*   **コード行数**: エージェントの主要なwhileループ部分は約50行。
*   **実装言語**: TypeScript (JS)。Python版のコンパニオンポストも存在します。
*   **デフォルトモデル**: "Qwen/Qwen2.5-72B-Instruct"
*   **デフォルトプロバイダー**: Nebius
*   **デモ実行コマンド**: `npx @huggingface/mcp-client` または `pnpx @huggingface/mcp-client`
*   **デモで接続されるMCPサーバー**:
    *   ファイルシステムサーバー (デスクトップへのアクセス)
    *   Playwright MCPサーバー (サンドボックス化されたChromiumブラウザの利用)
*   **コードリポジトリ**: `https://github.com/huggingface/huggingface.js/tree/main/packages/mcp-client`

# 引用（Notable quotes）

*   "MCP is a standard API to expose sets of Tools that can be hooked to LLMs."
*   "Once you have an MCP Client, an Agent is literally just a while loop on top of it."
*   "We encourage developers to exclusively use the tools field to pass tools, rather than manually injecting tool descriptions into your prompt and writing a separate parser for tool calls, as some have reported doing in the past."

# リスクと課題

*   **MCPサーバーのローカル性**: 現在、すべてのMCPサーバーはローカルプロセスとして実行されています（リモートサーバーは今後登場予定）。
*   **モデルによるツール解析の必要性**: 一部のモデル（例: Gemma 3）はネイティブツールを使用しないため、開発者がツール解析を独自に実装する必要がある場合があります。
*   **プロバイダーとモデルによるパフォーマンス差**: 異なるInference Providersやモデルは関数呼び出しの最適化が異なるため、パフォーマンスにばらつきが生じる可能性があります。

# 今後の見通し/アクション

*   **多様なモデルでの実験**: Mistral-Small-3.1-24B-Instruct-2503やGemma 3 27Bなど、他のLLMでのエージェント性能の実験。
*   **Inference Providersの探索**: Cerebras, Cohere, Fal, Fireworks, Hyperbolic, Nebius, Novita, Replicate, SambaNova, Togetherなど、様々なInference Providersでの機能とパフォーマンスの検証。
*   **ローカルLLMとの連携**: llama.cppやLM Studioを用いたローカル環境でのLLMとの統合。
*   **コミュニティ貢献の促進**: オープンソースプロジェクトとして、プルリクエストや機能追加、改善提案などの貢献を歓迎しています。

# Source URL

https://huggingface.co/blog/tiny-agents
