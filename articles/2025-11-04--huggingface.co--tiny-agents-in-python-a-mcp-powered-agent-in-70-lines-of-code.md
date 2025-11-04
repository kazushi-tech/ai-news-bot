---
title: "Tiny Agents in Python: a MCP-powered agent in ~70 lines of code"
title_ja: ""
source_url: "https://huggingface.co/blog/python-tiny-agents"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、Model Context Protocol (MCP) を活用し、約70行のPythonコードで構築可能な「Tiny Agents」を発表しました。これは、`huggingface_hub`クライアントSDKをMCPクライアントとして拡張することで、LLMが外部ツールやAPIと簡単に連携できるようにするものです。開発者は、このフレームワークを使って、Webブラウジングや画像生成といった高度なタスクを実行できるエージェントを迅速に構築・デプロイできます。

## 重要ポイント

*   **MCPプロトコルの活用**: LLMと外部ツールの相互作用を標準化するオープンプロトコルであるMCPをPythonで実装。これにより、カスタム統合の必要がなくなります。
*   **軽量なエージェント**: 約70行のPythonコードで、ツール利用可能なエージェントが構築可能。エージェントの核は、MCPクライアント上で動作するシンプルな`while`ループです。
*   **`huggingface_hub`の拡張**: `huggingface_hub`クライアントSDKがMCPクライアントとして機能するよう拡張され、MCPサーバーからツールを取得し、LLMの推論中に利用できます。
*   **簡単なデプロイと実行**: `pip install "huggingface_hub[mcp]"`でセットアップ後、CLIから既存のエージェントをHugging Face Hubから直接ロードして実行できます。
*   **多様なMCPサーバー対応**: ファイルシステム、Playwright (Webブラウザ)、Gradio Spaces (画像生成など) といった様々なMCPサーバーに接続し、多様なツールを利用できます。

## 詳細レポート

### What happened
Hugging Faceは、JavaScript版「Tiny Agents in JS」に触発され、Pythonで同様のコンセプトを実装しました。これは、Model Context Protocol (MCP) を利用し、`huggingface_hub`クライアントSDKをMCPクライアントとして拡張することで、約70行のコードでLLMが外部ツールと連携できるエージェントを構築するものです。

### 背景
*   **MCPの登場**: MCPは、LLMが外部ツールやAPIとやり取りする方法を標準化するオープンプロトコルです。これにより、個々のツールに対するカスタム統合の記述が不要になり、LLMに新しい機能を簡単に追加できるようになります。
*   **LLMのツール利用能力**: 現代のLLMは関数呼び出し（ツール利用）機能が組み込まれており、特定のユースケースや実世界のタスクに特化したアプリケーションの構築を可能にします。

### 影響
*   **開発の簡素化**: 開発者は複雑な統合ロジックを記述することなく、LLMに高度な機能（Web検索、画像生成など）を付与したエージェントを迅速に構築・デプロイできるようになりました。
*   **エージェントエコシステムの拡大**: Hugging Face Hubの`tiny-agents/tiny-agents`データセットを通じて、コミュニティが独自のTiny Agentを共有し、貢献できるプラットフォームが提供されます。

### 関係者
*   **Hugging Face**: Tiny AgentsのPython実装と`huggingface_hub` SDKの拡張を主導。
*   **LLMプロバイダー**: Qwen/Qwen2.5-72B-Instruct (Nebius inference provider経由) など、ツール利用をサポートするLLMを提供。
*   **MCPサーバー**: ファイルシステムサーバー、Playwright MCPサーバー、Gradio Spacesなど、特定の機能を提供する外部ツール群。
*   **開発者/ユーザー**: Tiny Agentsをインストールし、既存のエージェントを実行したり、独自のカスタムエージェントを構築したりする人々。

### データ
*   **コード行数**: エージェントのコアロジックは約70行。
*   **インストール**: `pip install "huggingface_hub[mcp]>=0.32.0"`
*   **エージェント設定**: `agent.json`ファイルで以下の項目を定義。
    *   `model`: 使用するLLM (例: `Qwen/Qwen2.5-72B-Instruct`)
    *   `provider`: LLMの推論プロバイダー (例: `nebius`)
    *   `servers`: 接続するMCPサーバーのリスト (タイプ、コマンド、引数など)
    *   `PROMPT.md`: エージェントの初期システムプロンプト。
*   **MCPClientの役割**:
    *   複数のMCPサーバーへの非同期接続管理。
    *   サーバーからのツール発見。
    *   LLM向けにツールをフォーマット。
    *   適切なMCPサーバー経由でのツール呼び出し実行。
*   **エージェントのコア**: `Agent`クラスは`MCPClient`を継承し、会話管理ロジックを追加。`run()`メソッド内の`while`ループが、ユーザー入力の処理、LLMとの対話、ツール実行、終了条件のチェックを担います。

## 引用（Notable quotes）

*   "An Agent is essentially a while loop built right on top of an MCP Client!"
*   "MCP (Model Context Protocol) is an open protocol that standardizes how Large Language Models (LLMs) interact with external tools and APIs. Essentially, it removed the need to write custom integrations for each tool, making it simpler to plug new capabilities into your LLMs."

## リスクと課題

*   **ツール呼び出しパフォーマンスのばらつき**: LLMモデルや推論プロバイダーによってツール呼び出しのパフォーマンスが異なる可能性があり、各プロバイダーの最適化に依存します。
*   **エージェントの複雑性**: エージェントのロジック自体はシンプルですが、利用するツールの種類や連携するMCPサーバーが増えるにつれて、全体的なシステム設計やデバッグの複雑さが増す可能性があります。

## 今後の見通し/アクション

*   **ベンチマーク**: 異なるLLMモデルと推論プロバイダーがエージェントのパフォーマンスに与える影響をベンチマークし、最適な組み合わせを特定する。
*   **ローカルLLMとの連携**: `llama.cpp`や`LM Studio`のようなローカルLLM推論サーバーとTiny Agentsを連携させる。
*   **コミュニティ貢献**: Hugging Face Hubの`tiny-agents/tiny-agents`データセットに独自のTiny Agentを共有し、プルリクエストを通じてプロジェクトに貢献する。

## Source URL
https://huggingface.co/blog/python-tiny-agents
