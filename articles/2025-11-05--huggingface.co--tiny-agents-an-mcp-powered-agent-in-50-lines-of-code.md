---
title: "Tiny Agents: an MCP-powered agent in 50 lines of code"
title_ja: "MCP搭載AIエージェント「Tiny Agents」わずか50行で実現"
source_url: "https://huggingface.co/blog/tiny-agents"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、MCP (Model Context Protocol) を活用し、わずか50行のTypeScriptコードで強力なAIエージェントを構築する方法を公開しました。MCPはLLMにツールを公開するためのシンプルかつ強力な標準APIであり、MCPクライアントがあればエージェントは外部ツールとの連携を制御するシンプルなwhileループとして実装できることを示しています。これにより、AIエージェントの開発が大幅に簡素化されます。

## 重要ポイント

*   **MCP (Model Context Protocol) の活用**: LLMに外部ツールセットを公開するための標準APIであり、シンプルながら強力な基盤を提供します。
*   **50行コードのエージェント**: MCPクライアントの上にwhileループを実装するだけで、Typescriptでわずか50行のコードで機能的なAIエージェントが実現可能です。
*   **LLMのネイティブツール呼び出しサポート**: 近年のLLMが関数呼び出し（ツール利用）に最適化されていることが、このエージェントの基盤となっています。
*   **デモの提供**: ファイルシステムアクセスやWebブラウジングが可能なMCPサーバーに接続するデモが公開されており、簡単に試すことができます。
*   **Hugging Faceエコシステムとの統合**: Hugging FaceのInferenceClientとMCPクライアントを組み合わせることで、多様なLLMプロバイダーと連携できます。

## 詳細レポート

### What happened/背景

Hugging FaceのエンジニアがMCP (Model Context Protocol) の可能性を探る中で、MCPクライアントがあればAIエージェントが非常にシンプルに実装できることに気づきました。この発見に基づき、TypeScriptでわずか50行のコードで「Tiny Agent」と呼ばれるエージェントを開発し、その実装方法と概念をブログ記事で公開しました。MCPは、LLMが外部の関数やサービス（ツール）を利用するための標準的なインターフェースを提供することを目的としています。

### 影響

この「Tiny Agent」のアプローチは、AIエージェントの開発を大幅に簡素化し、より多くの開発者がLLMのツール利用能力を最大限に引き出すアプリケーションを構築できるようになる可能性を秘めています。エージェントの複雑な制御ロジックを最小限に抑え、LLMの推論能力と外部ツールの連携に集中できる開発パラダイムを提示しています。

### 関係者

*   **Hugging Face**: 「Tiny Agent」の開発元であり、InferenceClientなどの関連SDKを提供。
*   **MCP (Model Context Protocol)**: LLMとツールの連携を標準化するプロトコル。
*   **OpenAI**: LLMの関数呼び出し機能において、事実上の業界標準を確立。
*   **Nebius**: デフォルトのLLMプロバイダーとして使用。

### データ

| 項目             | 内容                                                              |
| :--------------- | :---------------------------------------------------------------- |
| コード行数       | 約50行 (TypeScript)                                               |
| デフォルトLLM    | Qwen/Qwen2.5-72B-Instruct                                         |
| デフォルトプロバイダー | Nebius                                                            |
| 使用SDK          | @huggingface/inference (JS), @modelcontextprotocol/sdk/client (TypeScript) |
| デモサーバー     | ファイルシステム、Playwright (サンドボックス化されたChromiumブラウザ) |
| コードリポジトリ | huggingface.js mono-repoのmcp-clientサブパッケージ                |

## 引用（Notable quotes）

*   "MCP is a standard API to expose sets of Tools that can be hooked to LLMs."
*   "Once you have an MCP Client, an Agent is literally just a while loop on top of it."
*   "We encourage developers to exclusively use the tools field to pass tools, rather than manually injecting tool descriptions into your prompt and writing a separate parser for tool calls, as some have reported doing in the past."

## リスクと課題

*   **MCPサーバーのローカル性**: 現在のMCPサーバーはローカルプロセスとして動作しますが、リモートサーバーのサポートは今後追加される予定です。
*   **モデルによるツール解析の必要性**: Gemma 3などの一部のLLMモデルはネイティブツール呼び出しを直接サポートしないため、ツール呼び出しの解析を独自に実装する必要がある場合があります。
*   **プロバイダー・モデル間のパフォーマンス差**: 異なるLLMプロバイダーやモデルは関数呼び出しの最適化が異なるため、パフォーマンスにばらつきが生じる可能性があります。

## 今後の見通し/アクション

*   **多様なモデルでの実験**: Mistral-Small-3.1やGemma 3など、他のLLMモデルでのエージェントの動作を実験し、最適化を進めることが推奨されています。
*   **Inference Providersの活用**: Cerebras、Cohere、Fal、Fireworksなど、様々なInference Providersを試して、パフォーマンスや機能の違いを検証することが奨励されています。
*   **ローカルLLMとの連携**: llama.cppやLM Studioといったツールを使用して、ローカルで動作するLLMとエージェントを連携させる可能性が示唆されています。
*   **コミュニティ貢献の歓迎**: このプロジェクトはオープンソースであり、プルリクエストやコントリビューションが積極的に歓迎されています。

## Source URL

https://huggingface.co/blog/tiny-agents
