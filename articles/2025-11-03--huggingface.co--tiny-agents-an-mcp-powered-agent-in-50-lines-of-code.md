---
title: "Tiny Agents: an MCP-powered agent in 50 lines of code"
title_ja: "50行で動く！MCP活用エージェント「Tiny Agents」開発"
source_url: "https://huggingface.co/blog/tiny-agents"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、MCP (Model Context Protocol) を活用し、わずか50行のTypeScriptコードで機能的なAIエージェントを実装しました。MCPはLLMにツールセットを公開するための標準APIであり、このプロトコルとLLMのネイティブなツール呼び出しサポートを組み合わせることで、エージェントの実装が非常にシンプルになり、本質的にはMCPクライアント上の単なる「whileループ」として実現できることを示しています。

## 重要ポイント

*   **MCP (Model Context Protocol)**: LLMにツールセットを公開するためのシンプルかつ強力な標準API。
*   **エージェントの簡素化**: MCPクライアントがあれば、AIエージェントは本質的にその上に構築されたシンプルなwhileループとして実装可能。
*   **50行コードでの実現**: Hugging FaceのInferenceClientとTypeScriptを使用し、コアとなるエージェントロジックをわずか50行で記述。
*   **LLMのツール呼び出しネイティブサポート**: 最新のLLMが関数呼び出し（ツール利用）のために訓練されていることが、この実装の基盤。
*   **エージェントAI開発の効率化**: 複雑なツール解析やプロンプトエンジニアリングが不要になり、エージェントAIの開発が大幅に簡素化される。

## 詳細レポート

### What happened
Hugging Faceのエンジニアが、MCP (Model Context Protocol) とLLMのネイティブなツール呼び出し機能を活用し、TypeScriptでわずか50行のコードで動作するAIエージェント「Tiny Agents」を実装しました。このエージェントは、複数のMCPサーバーからツールをロードし、LLMの推論に組み込み、ツールの実行結果をLLMにフィードバックする一連のプロセスを自動化します。

### 背景
近年、多くのLLM（クローズドソース、オープンソース問わず）が関数呼び出し、すなわちツール利用のために訓練されるようになりました。ツールは名前、説明、JSONSchema形式のパラメータで定義され、LLMはこれらのツールを呼び出すかどうかを自律的に判断できます。MCPは、このようなツールをLLMに公開するための標準的なAPIとして登場し、Hugging Faceは自社のInferenceClientの上にMCPクライアントを実装することで、エージェント構築の基盤を確立しました。

### 影響
このアプローチにより、AIエージェントの開発が大幅に簡素化されます。開発者は、プロンプトに手動でツール記述を埋め込んだり、複雑なツール呼び出しパーサーを記述したりすることなく、LLMの`tools`フィールドを通じてツールを渡すだけでよくなります。これにより、エージェントAIの構築がよりアクセスしやすく、効率的になります。

### 関係者
*   **著者/Hugging Face**: `huggingface.js` mono-repo、`@huggingface/inference` (JS SDK)、`huggingface_hub` (Python SDK) の開発者。
*   **MCP (Model Context Protocol)**: ツール公開の標準APIを定義。
*   **OpenAI**: LLMの関数呼び出し機能の事実上の標準を確立。
*   **Nebius**: デフォルトのLLMプロバイダー。
*   **Qwen/Qwen2.5-72B-Instruct**: デフォルトでエージェントが使用するLLMモデル。

### データ
*   **エージェントのコアコード行数**: 約50行 (TypeScript)。
*   **デフォルトLLM**: `Qwen/Qwen2.5-72B-Instruct`。
*   **デフォルトLLMプロバイダー**: `Nebius`。
*   **MCPサーバー (デモ)**: ファイルシステムサーバー、Playwright MCPサーバー（サンドボックス化されたChromiumブラウザ用）。
*   **デモ実行コマンド**: `npx @huggingface/mcp-client` または `pnpx @huggingface/mcp-client`。

## 引用（Notable quotes）

*   "MCP is a standard API to expose sets of Tools that can be hooked to LLMs."
*   "Once you have an MCP Client, an Agent is literally just a while loop on top of it."
*   "We encourage developers to exclusively use the tools field to pass tools, rather than manually injecting tool descriptions into your prompt and writing a separate parser for tool calls, as some have reported doing in the past."

## リスクと課題

*   **MCPサーバーのローカル性**: 現在、すべてのMCPサーバーはローカルプロセスとして動作しており、リモートサーバーのサポートは今後の課題。
*   **モデルによるツール解析の必要性**: 一部のLLM（例: Gemma 3）はネイティブなツール呼び出しをサポートしていないため、開発者がツール解析ロジックを別途実装する必要がある。
*   **プロバイダーとモデルによるパフォーマンス差**: 各Inference Providerやモデルは関数呼び出しに対して異なる最適化を行っており、パフォーマンスにばらつきが生じる可能性がある。

## 今後の見通し/アクション

*   **多様なモデルでの実験**: Mistral-Small-3.1-24B-Instruct-2503やGemma 3 27Bなど、他の関数呼び出しに最適化されたモデルでの実験が推奨される。
*   **多様なInference Providersでの実験**: Cerebras、Cohere、Fal、Fireworks、Hyperbolic、Nebius、Novita、Replicate、SambaNova、Togetherなど、様々なプロバイダーでのパフォーマンス比較と最適化の探求。
*   **ローカルLLMとの連携**: llama.cppやLM Studioを使用してローカルで動作するLLMとの連携を模索。
*   **コミュニティ貢献の促進**: 全てのコードはオープンソースであり、プルリクエストや貢献が歓迎されている。

## Source URL
https://huggingface.co/blog/tiny-agents
