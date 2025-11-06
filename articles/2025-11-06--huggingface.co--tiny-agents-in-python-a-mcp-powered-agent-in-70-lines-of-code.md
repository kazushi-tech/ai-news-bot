---
title: "Tiny Agents in Python: a MCP-powered agent in ~70 lines of code"
title_ja: "Pythonで70行の「Tiny Agent」 MCPがLLMのツール連携を簡素化"
source_url: "https://huggingface.co/blog/python-tiny-agents"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Pythonでわずか約70行のコードで構築できる「Tiny Agents」を発表しました。これは、LLM（大規模言語モデル）と外部ツールの連携を標準化するオープンプロトコルであるMCP（Model Context Protocol）を活用し、`huggingface_hub`クライアントSDKをMCPクライアントとして拡張することで実現されています。開発者はこのフレームワークにより、Webブラウジングや画像生成といった高度なタスクを実行できる強力なエージェントを簡単に構築・デプロイできるようになります。

## 重要ポイント
*   **MCP (Model Context Protocol) の活用**: LLMと外部ツールのインタラクションを標準化し、各ツールに対するカスタム統合の記述を不要にします。
*   **`huggingface_hub`のMCPクライアント拡張**: `huggingface_hub`クライアントSDKがMCPクライアントとして機能し、MCPサーバーからツールを動的に発見・取得し、LLMに渡すことを可能にします。
*   **シンプルなエージェント構造**: エージェントのコアは、MCPクライアントの上に構築されたシンプルな`while`ループであり、約70行のPythonコードで実装可能です。
*   **LLMによるツール利用**: LLMはツールのスキーマに基づいてツール使用を決定し、MCPクライアントがツールの実行と結果のフィードバックをオーケストレーションします。
*   **柔軟な設定**: `agent.json`ファイルでLLMモデル、推論プロバイダー、接続するMCPサーバー、初期システムプロンプトなどを詳細に設定できます。
*   **容易なデモと構築**: `pip install "huggingface_hub[mcp]"`で簡単にインストールでき、CLIから既存のエージェントを実行したり、独自のカスタムエージェントを構築したりできます。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Faceは、JavaScript版Tiny Agentsに触発され、Python版のTiny Agentsを開発し、公開しました。この実装では、`huggingface_hub`クライアントSDKがMCPクライアントとして拡張され、LLMがMCPサーバーから提供される外部ツールをシームレスに利用できるようになりました。これにより、開発者は少ないコード量で、Webブラウジングや画像生成などの複雑なタスクを実行できるエージェントを構築できます。

**背景:**
LLMの能力を最大限に引き出すためには、外部ツールやAPIとの連携が不可欠です。しかし、これまでの連携はカスタム統合が必要で、開発の複雑さが増していました。MCPは、この課題を解決するために、LLMと外部ツールのインタラクションを標準化するオープンプロトコルとして登場しました。Hugging Faceは、このMCPの概念をPythonに持ち込み、既存の`huggingface_hub`ライブラリを拡張することで、ツール利用可能なエージェントの構築を劇的に簡素化しました。

**影響:**
*   **開発の簡素化**: 開発者は、各ツールに対する複雑なカスタム統合ロジックを記述することなく、LLMに強力なツール利用能力を付与できます。
*   **迅速なプロトタイピング**: わずか約70行のコードでエージェントのコアを構築できるため、LLMを活用したアプリケーションのプロトタイピングとデプロイが加速します。
*   **機能拡張の容易さ**: MCPサーバーを追加するだけで、エージェントに新たなツール機能（例: ファイルシステムアクセス、Webブラウジング、画像生成）を容易に組み込むことができます。
*   **コミュニティへの貢献**: オープンソースとして提供されており、コミュニティが独自のTiny Agentsを開発・共有し、エコシステムを拡大することが奨励されています。

**関係者:**
*   **Hugging Face**: `huggingface_hub`クライアントSDKの開発とMCPクライアントへの拡張、Python版Tiny Agentsの提供。
*   **MCP (Model Context Protocol)**: LLMと外部ツールのインタラクションを標準化するオープンプロトコル。
*   **LLMプロバイダー**: Qwen/Qwen2.5-72B-Instruct (Nebius経由) など、ツール呼び出し機能をサポートするモデルとサービス。
*   **MCPサーバー開発者**: ファイルシステムサーバー、Playwright MCPサーバー、Gradio Spacesなど、特定の機能を提供するMCPサーバーを開発・運用する人々。

**データ:**
*   **コード行数**: エージェントのコアロジックは約70行で実装。
*   **主要コンポーネント**: `huggingface_hub[mcp]`パッケージ、`MCPClient`クラス、`Agent`クラス。
*   **MCPサーバータイプ**: `stdio` (ローカルプロセス)、`http` (リモート)、`sse` (旧標準) をサポート。
*   **エージェント設定**: `agent.json`ファイルでモデル名、プロバイダー、サーバー設定を定義。`PROMPT.md`で詳細なシステムプロンプトを設定可能。
*   **CLIコマンド例**:
    *   インストール: `pip install "huggingface_hub[mcp]>=0.32.0"`
    *   エージェント実行: `tiny-agents run [PATH]`
*   **デモ例**:
    *   Webブラウジングエージェント (Playwright MCPサーバー利用)。
    *   画像生成エージェント (Gradio SpacesをMCPサーバーとして利用)。

## 引用（Notable quotes）
*   "MCP (Model Context Protocol) is an open protocol that standardizes how Large Language Models (LLMs) interact with external tools and APIs. Essentially, it removed the need to write custom integrations for each tool, making it simpler to plug new capabilities into your LLMs."
*   "Spoiler : An Agent is essentially a while loop built right on top of an MCP Client!"
*   "The MCPClient is the heart of our tool-use functionality."

## リスクと課題
*   **LLMとプロバイダー間のパフォーマンス差**: 異なるLLMモデルや推論プロバイダー間では、ツール呼び出しのパフォーマンスに差が生じる可能性があります。これは、各プロバイダーがツール呼び出し機能を異なる方法で最適化しているためです。最適なエージェント性能を引き出すためには、モデルとプロバイダーの選択が重要になります。

## 今後の見通し/アクション
*   **ベンチマークの実施**: 異なるLLMモデルや推論プロバイダーがエージェントのパフォーマンス（特にツール呼び出し）に与える影響をベンチマークし、最適な構成を特定する。
*   **ローカルLLM推論サーバーとの連携**: `llama.cpp`や`LM Studio`のようなローカルLLM推論サーバーとTiny Agentsを連携させる。
*   **コミュニティ貢献**: 独自のTiny Agentsを開発し、Hugging Face Hubの`tiny-agents/tiny-agents`データセットにプルリクエストを送信するなど、コミュニティへの貢献を奨励。

## Source URL
https://huggingface.co/blog/python-tiny-agents
