---
title: "Tiny Agents in Python: a MCP-powered agent in ~70 lines of code"
title_ja: "Pythonで「Tiny Agents」 MCP対応エージェントを約70行で構築"
source_url: "https://huggingface.co/blog/python-tiny-agents"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、JavaScript版に触発され、PythonでMCP (Model Context Protocol) を活用した「Tiny Agents」を約70行のコードで実装しました。`huggingface_hub` SDKがMCPクライアントとして拡張され、LLMが外部ツールやAPIと標準化された方法で連携できるようになります。これにより、カスタム統合の必要なく、LLMに強力なツール機能を容易に組み込むことが可能になります。エージェントの核は、MCPクライアント上で動作するシンプルな`while`ループであり、デモの実行からカスタムエージェントの構築までが非常に簡単です。

## 重要ポイント

*   **MCP (Model Context Protocol)**: LLMが外部ツールやAPIと相互作用する方法を標準化するオープンプロトコル。ツールごとのカスタム統合を不要にし、LLMへの機能追加を簡素化します。
*   **`huggingface_hub` SDKの拡張**: Pythonの`huggingface_hub`クライアントSDKがMCPクライアントとして機能するようになり、MCPサーバーからツールを取得し、LLMの推論中にそれらを渡すことができます。
*   **Tiny Agentのシンプルさ**: 約70行のコードで実装可能であり、本質的にはMCPクライアント上に構築された`while`ループです。
*   **LLMのツール利用**: 現代のLLMは関数呼び出し（Function Calling）をサポートしており、エージェントはLLMが選択したツールを実行し、その結果を会話にフィードバックします。
*   **MCPClientの役割**: MCPサーバーへの非同期接続管理、ツールの発見とLLM向けフォーマット、ツール呼び出しの実行を担います。
*   **エージェントのコアロジック**: `Agent.run()`メソッド内の非同期ジェネレーターが、ユーザー入力の処理、LLMとの対話、ツール実行、および終了条件のチェックを行う会話ループを管理します。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、JavaScript版のTiny Agentsに触発され、Pythonで同様のコンセプトを実装しました。これは、`huggingface_hub`クライアントSDKをMCP (Model Context Protocol) クライアントとして拡張することで実現され、MCPサーバーからツールをプルし、LLMの推論中にそれらを渡すことが可能になりました。結果として、約70行のコードでMCPを活用したLLMエージェントを構築できることを示しました。

**背景:**
LLMと外部ツールやAPIとの連携は、LLMアプリケーションの能力を拡張する上で不可欠です。しかし、ツールごとにカスタム統合を記述する必要があり、開発が複雑になるという課題がありました。MCPは、この連携を標準化し、開発プロセスを簡素化するために設計されたオープンプロトコルです。この取り組みは、LLMに新しい機能をより簡単に組み込めるようにすることを目的としています。

**影響:**
*   LLMベースのアプリケーション開発が大幅に簡素化され、開発者はツールの統合ではなく、エージェントのロジックに集中できるようになります。
*   ファイルシステムへのアクセス、ウェブブラウジング、画像生成など、多様な外部ツールをLLMに容易に組み込むことが可能になります。
*   Hugging Face Hub上のデータセットから既存のエージェントをロードしたり、独自のカスタムエージェントを構築したりする柔軟性を提供します。

**関係者:**
*   **Hugging Face**: `huggingface_hub` SDKの拡張とMCPクライアントの実装者。
*   **LLM開発者/ユーザー**: Tiny Agentを利用してLLMにツール機能を追加する人々。
*   **MCPサーバー開発者**: LLMが利用できるツールを提供する人々。

**データ/具体的な内容:**

*   **デモの実行方法**:
    *   `pip install "huggingface_hub[mcp]>=0.32.0"`で必要なコンポーネントをインストール。
    *   CLIから`tiny-agents run [PATH]`コマンドでエージェントを実行。パスを指定しない場合、デフォルトでファイルシステムサーバーとPlaywright MCPサーバーに接続します。
    *   **例1 (Webブラウジング)**: Qwen/Qwen2.5-72B-InstructモデルとPlaywright MCPサーバーを使用し、ウェブ検索と情報抽出を行うエージェント。
    *   **例2 (画像生成)**: Qwen/Qwen2.5-72B-InstructモデルとFLUX.1 Gradio Space（MCPサーバーとして機能）を使用し、画像を生成するエージェント。

*   **エージェント設定**:
    *   各エージェントの動作は`agent.json`ファイルで定義されます。これには、デフォルトモデル、推論プロバイダー、接続するMCPサーバー、初期システムプロンプトが含まれます。
    *   より詳細なシステムプロンプトは、同じディレクトリ内の`PROMPT.md`で提供できます。
    *   MCPサーバーは`stdio`（ローカルプロセス）や`http`（リモート）タイプをサポートします。

*   **LLMのツール利用**:
    *   現代のLLMは関数呼び出し（Function Calling）をサポートしており、ツールのスキーマ（機能と入力引数）に基づいて、いつどのツールを使用するかを決定します。
    *   `InferenceClient`は、OpenAI Chat Completions APIと同じツール呼び出しインターフェースを実装しています。

*   **Python MCP Clientの構築**:
    *   `huggingface_hub`の一部である`MCPClient`クラスがツール利用機能の核となります。`AsyncInferenceClient`を使用してLLMと通信します。
    *   `MCPClient`の主な責任は、MCPサーバーへの非同期接続管理、ツールの発見、LLM向けへのフォーマット、およびツール呼び出しの実行です。
    *   `add_mcp_server`メソッドを通じて、`stdio`、`sse`、`http`などの様々なタイプのMCPサーバーに接続し、利用可能なツールを登録します。

*   **ツールの利用: ストリーミングと処理**:
    *   `MCPClient.process_single_turn_with_tools`メソッドがLLMとの対話を処理します。
    *   このメソッドは、会話履歴と利用可能なツールをLLMに送信し、ストリーミング応答を受信します。
    *   LLMからのチャンクは即座にyieldされ、リアルタイムのストリーミングを可能にします。
    *   LLMがツール呼び出しを要求した場合、対応するMCPセッションを見つけて`session.call_tool()`を実行し、結果（またはエラー）を会話履歴に追加してエージェントにフィードバックします。

*   **Tiny Python Agentの構造**:
    *   `Agent`クラスは`MCPClient`を継承し、会話管理ロジックを追加します。
    *   **初期化**: エージェントは`agent.json`から設定を読み込み、`load_tools()`メソッドを通じて設定されたMCPサーバーに接続し、ツールボックスを構築します。
    *   **コアループ**: `Agent.run()`メソッドは、ユーザー入力を処理する非同期ジェネレーターです。
        *   ユーザープロンプトを会話に追加します。
        *   `MCPClient.process_single_turn_with_tools`を呼び出し、LLM応答とツール実行の1ステップを処理します。
        *   各アイテムはリアルタイムストリーミングのために即座にyieldされます。
        *   「exit loop」ツールが使用されたか、最大ターン数に達したか、LLMが最終的なテキスト応答を出したか、といった終了条件をチェックします。

## 引用（Notable quotes）

*   「An Agent is essentially a while loop built right on top of an MCP Client!」
*   「MCP (Model Context Protocol) is an open protocol that standardizes how Large Language Models (LLMs) interact with external tools and APIs. Essentially, it removed the need to write custom integrations for each tool, making it simpler to plug new capabilities into your LLMs.」

## リスクと課題

*   **LLMモデルと推論プロバイダーによる性能差**: 記事では、異なるLLMモデルや推論プロバイダーがエージェントのツール呼び出し性能に影響を与える可能性があると指摘されています。各プロバイダーがツール呼び出しを異なる方法で最適化しているため、性能に差が生じる可能性があります。

## 今後の見通し/アクション

*   **ベンチマークの実施**: 異なるLLMモデルと推論プロバイダーがエージェントの性能（特にツール呼び出し性能）に与える影響を評価するためのベンチマークを実施すること。
*   **ローカルLLM推論サーバーとの連携**: `llama.cpp`やLM StudioのようなローカルLLM推論サーバーでTiny Agentを実行し、その可能性を探ること。
*   **コミュニティへの貢献**: Hugging Face Hubの`tiny-agents/tiny-agents`データセットに独自のTiny Agentを共有したり、プルリクエストを送信したりして、コミュニティに貢献すること。

## Source URL
https://huggingface.co/blog/python-tiny-agents
