---
title: 'Tiny Agents in Python: a MCP-powered agent in ~70 lines of code'
title_ja: Python製MCPエージェント たった70行でLLMにツール連携
source_url: 'https://huggingface.co/blog/python-tiny-agents'
date: '2025-11-06'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - Hugging Faceは、MCP (Model Context Protocol) を活用したPython版「Tiny
    Agent」を約70行のコードで実装する方法を発表しました。`huggingface_hub`クライアントSDKがMC
  - '- ## 重要ポイント'
  - >-
    - *   **MCP (Model Context Protocol) の導入:**
    LLMが外部ツールやAPIと連携するためのオープンプロトコル。ツールごとのカスタム統合を不要にし、LLMへの機能追加を簡素化します。
  - >-
    - *   **`huggingface_hub`のMCPクライアント化:**
    `huggingface_hub`クライアントSDKがMCPクライアント機能を内包し、MCPサーバーからツールを取得し、LLM推論中にそれらを渡すことを可能にしまし
  - >-
    - *   **Tiny Agentのシンプルさ:**
    エージェントはMCPクライアントの上に構築された約70行のPythonコードの`while`ループであり、高いアクセシビリティと拡張性を提供します。
---
## 概要 (TL;DR)

Hugging Faceは、MCP (Model Context Protocol) を活用したPython版「Tiny Agent」を約70行のコードで実装する方法を発表しました。`huggingface_hub`クライアントSDKがMCPクライアントとして拡張され、LLMが外部ツールと連携するプロセスを大幅に簡素化します。MCPはLLMと外部ツール・API間のインタラクションを標準化するオープンプロトコルであり、これにより開発者はカスタム統合なしでLLMに強力な機能（Webブラウジング、画像生成など）を容易に組み込めるようになります。Tiny Agentは、本質的にMCPクライアント上に構築されたシンプルな`while`ループで構成されています。

## 重要ポイント

*   **MCP (Model Context Protocol) の導入:** LLMが外部ツールやAPIと連携するためのオープンプロトコル。ツールごとのカスタム統合を不要にし、LLMへの機能追加を簡素化します。
*   **`huggingface_hub`のMCPクライアント化:** `huggingface_hub`クライアントSDKがMCPクライアント機能を内包し、MCPサーバーからツールを取得し、LLM推論中にそれらを渡すことを可能にしました。
*   **Tiny Agentのシンプルさ:** エージェントはMCPクライアントの上に構築された約70行のPythonコードの`while`ループであり、高いアクセシビリティと拡張性を提供します。
*   **ツール利用の仕組み:** LLMはツールのスキーマに基づいて使用するツールを決定し、エージェントがツールの実行と結果のLLMへのフィードバックをオーケストレーションします。
*   **MCPClientの役割:** MCPサーバーへの非同期接続管理、ツールの発見とLLM向けフォーマット、ツール呼び出しの実行といった中核機能を担います。
*   **エージェントの構成:** `agent.json`ファイルでLLMモデル、推論プロバイダー、接続するMCPサーバー、初期システムプロンプトを定義します。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
JavaScript版のTiny Agentsに触発され、Hugging FaceはPython版のTiny Agentを開発し、その実装方法と利用法をブログ記事で公開しました。この取り組みの一環として、`huggingface_hub`クライアントSDKがMCPクライアントとして拡張され、MCPサーバーからツールを動的に取得し、LLMに提供できるようになりました。記事では、Webブラウジングや画像生成といった具体的なデモを通じて、Tiny Agentの機能が紹介されています。

**背景:**
現代のLLMは、特定のタスクを実行するために外部ツールやAPIを呼び出す「関数呼び出し（ツール利用）」機能を備えています。しかし、これらのツールとの連携には、これまでカスタムの統合コードが必要でした。MCPは、このツール連携プロセスを標準化し、開発者がより簡単にLLMに新しい能力をプラグインできるようにするために開発されたオープンプロトコルです。

**影響:**
*   開発者は、複雑な統合コードを記述することなく、LLMにWeb検索、ファイルシステムアクセス、画像生成などの強力な機能を迅速に組み込むことが可能になりました。
*   Tiny Agentのシンプルな設計は、エージェント開発の敷居を下げ、より多くの開発者がLLMベースのエージェントアプリケーションを構築することを促進します。
*   Hugging Face Hubは、Tiny Agentの設定を共有・利用するためのプラットフォームとしても機能し、コミュニティによるエージェント開発を加速させます。

**関係者:**
*   **Hugging Face:** `huggingface_hub`クライアントSDKの拡張とTiny Agentの開発・公開を主導。
*   **MCP (Model Context Protocol):** LLMと外部ツールのインタラクションを標準化するプロトコル。
*   **LLMプロバイダー:** Qwen/Qwen2.5-72B-Instruct (Nebius経由)、FLUX.1 [schnell] (Gradio Spaces経由) など、ツール利用に対応するLLMを提供する企業・プロジェクト。

**データ/技術詳細:**
*   **インストール:** `pip install "huggingface_hub[mcp]>=0.32.0"`
*   **エージェント実行:** `tiny-agents run [PATH]`コマンドで、Hugging Face Hubの`tiny-agents/tiny-agents`データセットから、またはローカルの`agent.json`ファイルからエージェントをロードして実行。
*   **エージェント設定 (`agent.json`):**
    ```json
    {
        "model": "Qwen/Qwen2.5-72B-Instruct",
        "provider": "nebius",
        "servers": [
            {
                "type": "stdio",
                "command": "npx",
                "args": ["@playwright/mcp@latest"]
            }
        ]
    }
    ```
    *   `model`と`provider`でLLMと推論プロバイダーを指定。
    *   `servers`配列で接続するMCPサーバーを定義（`stdio`はローカルプロセス、`http`はリモート）。
*   **MCPClientの機能:**
    *   `add_mcp_server`: `stdio`, `sse`, `http`タイプのMCPサーバーへの非同期接続を確立。
    *   `list_tools`: サーバーからツールを発見し、LLMが理解できる形式に変換して登録。
    *   `process_single_turn_with_tools`: 会話履歴と利用可能なツールをLLMに送信し、ストリーミング応答を処理。LLMがツール呼び出しを要求した場合、対応するMCPセッションを通じてツールを実行し、結果を会話履歴にフィードバック。
*   **Agentクラス:** `MCPClient`を継承し、会話管理ロジックを追加。
    *   `__init__`: `agent.json`の設定に基づき、MCPClientを初期化し、システムプロンプトで会話履歴を開始。
    *   `load_tools`: 設定されたMCPサーバーに接続し、ツールを登録。
    *   `run`: メインの非同期ループ。ユーザー入力を処理し、`process_single_turn_with_tools`を呼び出してLLMとのインタラクションとツール実行を管理。特定の終了条件（"exit loop"ツール呼び出し、最大ターン数到達、最終的なテキスト応答）でループを終了。

## 引用（Notable quotes）

*   "Spoiler : An Agent is essentially a while loop built right on top of an MCP Client!"
*   "MCP (Model Context Protocol) is an open protocol that standardizes how Large Language Models (LLMs) interact with external tools and APIs. Essentially, it removed the need to write custom integrations for each tool, making it simpler to plug new capabilities into your LLMs."
*   "The coolest part is that you can load agents directly from the Hugging Face Hub tiny-agents Dataset, or specify a path to your own local agent configuration!"
*   "With the MCPClient doing all the job for tool interactions, our Agent class becomes wonderfully simple."

## リスクと課題

*   **LLMのツール呼び出し性能のばらつき:** 異なるLLMモデルや推論プロバイダーは、ツール呼び出しの性能や信頼性に差がある可能性があり、エージェントの全体的なパフォーマンスに影響を与える可能性があります。
*   **セキュリティとアクセス制御:** MCPサーバーがファイルシステムやWebブラウザなどのシステムリソースにアクセスする場合、サンドボックス化されているとはいえ、不適切なツールの利用や悪意のあるプロンプトによる潜在的なセキュリティリスクを考慮する必要があります。
*   **デバッグと複雑性:** 複数のMCPサーバー、非同期処理、LLMの非決定性などが絡み合うため、エージェントの動作をデバッグしたり、予期せぬ挙動を特定したりすることが複雑になる可能性があります。
*   **依存関係の管理:** `huggingface_hub[mcp]`のバージョン管理や、`npx`などの外部コマンドへの依存は、開発環境のセットアップと維持を複雑にする可能性があります。

## 今後の見通し/アクション

*   **性能ベンチマーク:** 異なるLLMモデルや推論プロバイダーがエージェントのツール呼び出し性能に与える影響を詳細にベンチマークし、最適な組み合わせを特定する。
*   **ローカルLLM連携:** `llama.cpp`やLM StudioなどのローカルLLM推論サーバーとTiny Agentを連携させ、オフラインでのエージェント実行を可能にする。
*   **コミュニティ貢献の促進:** 開発者が独自のTiny Agentを構築し、Hugging Face Hubの`tiny-agents/tiny-agents`データセットにプルリクエストを送信することで、エージェントの多様性と機能を拡大する。
*   **MCPクライアントとエージェントの機能拡張:** MCPクライアントとTiny Agentの機能をさらに探求し、新しいサーバータイプ、ツール、エージェントの推論戦略などを追加・改善する。

## Source URL（必須）
https://huggingface.co/blog/python-tiny-agents
