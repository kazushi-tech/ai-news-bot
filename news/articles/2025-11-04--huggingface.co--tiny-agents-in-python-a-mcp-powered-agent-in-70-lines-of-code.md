---
title: 'Tiny Agents in Python: a MCP-powered agent in ~70 lines of code'
title_ja: Python版Tiny Agents、MCP対応エージェントを70行で構築
source_url: 'https://huggingface.co/blog/python-tiny-agents'
date: '2025-11-04'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - Hugging Faceは、JavaScript版に続き、PythonでMCP (Model Context Protocol)
    を活用した「Tiny Agents」を発表しました。`huggingface_hub`クライアントSDKをMC
  - '- ## 重要ポイント'
  - >-
    - *   **MCP (Model Context Protocol) の導入**:
    LLMが外部ツールやAPIと連携する際の標準プロトコルであり、ツールごとのカスタム統合を不要にします。
  - >-
    - *   **`huggingface_hub` SDKのMCPクライアント化**:
    `hugginggingface_hub`クライアントSDKがMCPクライアントとして機能するよう拡張され、MCPサーバーからツールを取得しLLMに渡すこと
  - >-
    - *   **Tiny Agentのシンプルさ**:
    Python版Agentは、MCPクライアント上に構築されたシンプルな`while`ループであり、約70行のコードで実装できます。
---
## 概要 (TL;DR)
Hugging Faceは、JavaScript版に続き、PythonでMCP (Model Context Protocol) を活用した「Tiny Agents」を発表しました。`huggingface_hub`クライアントSDKをMCPクライアントとして拡張することで、約70行のPythonコードでLLMが外部ツールと連携できるエージェントを構築可能に。MCPはLLMとツールの相互作用を標準化し、カスタム統合の必要性を排除します。本記事では、既存エージェントの実行方法から、独自のAgent構築方法までを解説しています。

## 重要ポイント
*   **MCP (Model Context Protocol) の導入**: LLMが外部ツールやAPIと連携する際の標準プロトコルであり、ツールごとのカスタム統合を不要にします。
*   **`huggingface_hub` SDKのMCPクライアント化**: `hugginggingface_hub`クライアントSDKがMCPクライアントとして機能するよう拡張され、MCPサーバーからツールを取得しLLMに渡すことが可能になりました。
*   **Tiny Agentのシンプルさ**: Python版Agentは、MCPクライアント上に構築されたシンプルな`while`ループであり、約70行のコードで実装できます。
*   **多様なMCPサーバー対応**: ファイルシステム、Playwright (サンドボックス化されたブラウザ)、Gradio Spacesなど、様々なMCPサーバーと連携し、LLMに強力なツール機能を提供します。
*   **LLMのツール利用機能**: 現代のLLMは関数呼び出し（ツール利用）のために設計されており、MCPClientがツールの発見、フォーマット、実行をオーケストレーションします。

## 詳細レポート
*   **What happened**:
    JavaScript版Tiny Agentsに触発され、Python版Tiny Agentが開発されました。`huggingface_hub`クライアントSDKがMCPクライアントとして拡張され、LLMがMCPサーバーからツールを動的に取得し、推論中に利用できるようになりました。
*   **背景**:
    LLMが外部ツールやAPIと連携する際のカスタム統合の複雑さを解消するため、MCPプロトコルが考案されました。MCPは、ツールのスキーマ定義、LLMへの提示、ツールの実行、結果のフィードバックといったプロセスを標準化します。
*   **影響**:
    開発者は、各ツールに対するカスタム統合を書くことなく、LLMに新しい機能を容易に追加できるようになりました。これにより、エージェントの構築が大幅に簡素化され、迅速なプロトタイピングとデプロイが可能になります。Hugging Face Hubのデータセットからエージェント設定を直接ロードできるなど、エコシステムとの連携も強化されています。
*   **関係者**:
    *   **Hugging Face**: `huggingface_hub` SDKの開発とMCPクライアント機能の統合。
    *   **MCPプロトコル**: LLMとツールの連携を標準化するオープンプロトコル。
    *   **LLMプロバイダー**: Qwen/Qwen2.5-72B-Instruct (Nebius Inference Provider経由) など、ツール呼び出しをサポートするLLMを提供。
    *   **開発者/ユーザー**: Tiny Agentを構築・利用する個人や企業。
*   **データ**:
    *   **インストールコマンド**:
        ```bash
        pip install "huggingface_hub[mcp]>=0.32.0"
        ```
    *   **CLIコマンド**:
        ```bash
        tiny-agents run [PATH]
        ```
        `PATH`は、Hugging Face Hubの`tiny-agents/tiny-agents`データセット内のエージェント設定、またはローカルフォルダ内の`agent.json`ファイルを指定します。
    *   **Agent設定例 (`agent.json`)**:
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
        `PROMPT.md`ファイルで詳細なシステムプロンプトを定義することも可能です。
    *   **MCPClientの主要機能**:
        *   非同期接続の管理
        *   MCPサーバーからのツール発見
        *   LLM向けツールフォーマット
        *   正しいMCPサーバー経由でのツール実行
    *   **Agentの構造**: `MCPClient`を継承し、会話管理ロジックを追加。`run()`メソッドがエージェントのコアとなる`while`ループを実装します。

## 引用（Notable quotes）
*   「An Agent is essentially a while loop built right on top of an MCP Client!」
*   「MCP (Model Context Protocol) is an open protocol that standardizes how Large Language Models (LLMs) interact with external tools and APIs. Essentially, it removed the need to write custom integrations for each tool, making it simpler to plug new capabilities into your LLMs.」

## リスクと課題
*   **LLMとプロバイダーのパフォーマンス差異**: 異なるLLMモデルや推論プロバイダー間では、ツール呼び出しのパフォーマンスに差が生じる可能性があり、最適な選択にはベンチマークと評価が必要です。
*   **ローカルLLM連携の複雑さ**: llama.cppやLM StudioなどのローカルLLM推論サーバーとの連携は可能ですが、設定や管理には一定の技術的知識が求められる場合があります。
*   **ツールのセキュリティとサンドボックス化**: 外部ツールへのアクセスは強力な機能であるため、特にファイルシステムやウェブブラウザへのアクセスはセキュリティ上の考慮が必要です（例: Playwright MCPサーバーはサンドボックス化されたChromiumを使用）。

## 今後の見通し/アクション
*   **パフォーマンスベンチマーク**: 異なるLLMモデルと推論プロバイダーがエージェントのパフォーマンスに与える影響を評価し、最適な構成を特定します。
*   **ローカルLLM連携の強化**: llama.cppやLM StudioなどのローカルLLM推論サーバーとのTiny Agentの実行をさらに探求し、利用を促進します。
*   **コミュニティ貢献の促進**: 開発者が独自のTiny Agentを開発し、Hugging Face Hubの`tiny-agents/tiny-agents`データセットにプルリクエストを送信することで、コミュニティによるエージェントの多様化と進化を促します。
*   **AGENTS.md標準のサポート**: `tiny-agents`がAGENTS.md標準をサポートしたことで、エージェントの記述と共有がさらに標準化され、エコシステム全体の相互運用性が向上する見込みです。

## Source URL
https://huggingface.co/blog/python-tiny-agents
