---
title: "Tiny Agents: an MCP-powered agent in 50 lines of code"
title_ja: "50行で実現！MCP搭載の超軽量エージェント「Tiny Agents」"
source_url: "https://huggingface.co/blog/tiny-agents"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

本記事は、MCP (Model Context Protocol) を活用することで、LLM (大規模言語モデル) ベースのエージェントをわずか50行のコードで実装できることを示しています。MCPはLLMにツールのセットを公開するためのシンプルな標準APIであり、このプロトコルに対応したクライアントがあれば、エージェントはツール呼び出しと結果フィードバックを繰り返す単純なwhileループとして機能します。これにより、エージェントAIの開発が大幅に簡素化されます。

## 重要ポイント

*   **MCP (Model Context Protocol) の定義**: LLMにツールのセットを公開するためのシンプルかつ強力な標準API。
*   **エージェントの簡素化**: MCPクライアントがあれば、エージェントはわずか50行のコードで実装可能なwhileループに過ぎない。
*   **LLMのネイティブなツール呼び出しサポート**: 最新のLLMは関数呼び出し（ツール利用）にネイティブに対応しており、開発者はツールのリストをLLMに渡し、その結果をフィードバックするだけでよい。
*   **Hugging Faceの実装**: Hugging Faceの`InferenceClient`をベースにMCPクライアントを構築し、TypeScriptでエージェントを実装。
*   **デモの提供**: `npx @huggingface/mcp-client`コマンドで、ファイルシステムやサンドボックス化されたWebブラウザにアクセスするエージェントのデモを簡単に実行可能。

## 詳細レポート

### What happened/背景

近年、LLMの機能が進化し、特に「関数呼び出し（ツール利用）」のネイティブサポートが普及しました。これは、LLMが外部ツール（APIなど）を呼び出して特定のアクションを実行し、その結果を推論に活用できる能力を指します。この背景のもと、Hugging Faceは、LLMにツールを公開するための標準プロトコルであるMCP (Model Context Protocol) に着目。MCPがLLMとツールの連携を標準化し、エージェント開発を簡素化する可能性を見出し、わずか50行のTypeScriptコードでMCPを活用したエージェントを実装しました。

### 影響

この「Tiny Agents」のアプローチは、エージェントAIの開発を劇的に簡素化する可能性を秘めています。複雑なフレームワークやプロンプトエンジニアリングに頼ることなく、LLMのツール呼び出し機能とMCPを組み合わせることで、開発者はより少ないコードで強力なエージェントを構築できるようになります。これにより、エージェントAIのアクセシビリティが向上し、より広範なアプリケーションでの利用が促進されると期待されます。

### 関係者

*   **Hugging Face**: 本記事の著者であり、MCPクライアントおよびTiny Agentの実装者。`huggingface.js`モノリポ内でコードを公開。
*   **MCP (Model Context Protocol)**: LLMにツールを公開するための標準プロトコル。
*   **OpenAI**: LLMの関数呼び出しに関するドキュメントが、事実上の業界標準として参照されている。
*   **Nebius**: デフォルトのLLMプロバイダーとして使用されている。

### データ

*   **エージェントのコード行数**: 約50行 (主要なwhileループ部分)
*   **実装言語**: TypeScript (JS)
*   **ベースクライアント**: Hugging Face `InferenceClient`
*   **デフォルトLLM**: "Qwen/Qwen2.5-72B-Instruct"
*   **デフォルトLLMプロバイダー**: Nebius
*   **デフォルトMCPサーバー**: ファイルシステムサーバー、Playwright MCPサーバー (サンドボックス化されたChromiumブラウザ用)
*   **MCPサーバーの現状**: 現在はすべてローカルプロセスとして動作（リモートサーバーは今後対応予定）。

## 引用（Notable quotes）

*   "Once you have an MCP Client, an Agent is literally just a while loop on top of it."
    （MCPクライアントがあれば、エージェントは文字通りその上のwhileループに過ぎない。）
*   "We encourage developers to exclusively use the tools field to pass tools, rather than manually injecting tool descriptions into your prompt and writing a separate parser for tool calls, as some have reported doing in the past."
    （開発者には、ツールの説明を手動でプロンプトに注入したり、ツール呼び出し用のパーサーを別途作成したりするのではなく、`tools`フィールドを使ってツールを渡すことを推奨する。）

## リスクと課題

*   **モデルによるツール解析の差異**: Gemma 3 27Bのような一部のモデルはネイティブなツール呼び出しを使用しないため、独自にツール解析を実装する必要がある。
*   **MCPサーバーのローカル性**: 現在、MCPサーバーはすべてローカルプロセスとして動作しており、リモートサーバーのサポートは今後の課題。
*   **プロバイダー・モデル間のパフォーマンス差**: 各推論プロバイダーやモデルは関数呼び出しに対して異なる最適化を行っており、パフォーマンスにばらつきが生じる可能性がある。

## 今後の見通し/アクション

*   **多様なモデルでの実験**: Mistral-Small-3.1-24B-Instruct-2503やGemma 3 27Bなど、他の関数呼び出しに最適化されたモデルでの実験。
*   **多様な推論プロバイダーの活用**: Cerebras、Cohere、Fal、Fireworksなど、様々な推論プロバイダーでのパフォーマンス比較と活用。
*   **ローカルLLMとの連携**: llama.cppやLM Studioといったツールを使用して、ローカルで動作するLLMとの統合。
*   **コミュニティ貢献の促進**: オープンソースプロジェクトとして、プルリクエストやコントリビューションを積極的に歓迎。

## Source URL

https://huggingface.co/blog/tiny-agents
