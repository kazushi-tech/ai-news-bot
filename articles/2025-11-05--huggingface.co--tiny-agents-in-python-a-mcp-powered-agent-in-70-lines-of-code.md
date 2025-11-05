---
title: "Tiny Agents in Python: a MCP-powered agent in ~70 lines of code"
title_ja: "Pythonで70行のTiny Agent！MCPでLLMツール連携を標準化"
source_url: "https://huggingface.co/blog/python-tiny-agents"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、JavaScript版に触発されたPython版「Tiny Agent」を発表しました。これは、オープンプロトコルであるMCP (Model Context Protocol) を活用し、LLMが外部ツールやAPIと連携する仕組みを標準化します。`huggingface_hub` SDKをMCPクライアントとして拡張することで、わずか約70行のPythonコードで強力なツール利用型エージェントを構築できるようになり、LLMへのツール統合が大幅に簡素化されます。

## 重要ポイント
*   **MCP (Model Context Protocol) の導入**: LLMと外部ツール/API間のインタラクションを標準化し、各ツールに対するカスタム統合の記述を不要にします。
*   **`huggingface_hub` SDKの拡張**: `huggingface_hub`クライアントSDKにMCPクライアント機能が追加され、MCPサーバーからツールを動的に発見し、LLMに提供できるようになりました。
*   **Tiny Agentのシンプルさ**: エージェントは本質的にMCPクライアント上に構築された`while`ループであり、約70行のPythonコードで実装可能です。
*   **ツール利用の仕組み**: LLMはツールのスキーマに基づいて使用を決定し、エージェントがツールの実行と結果のフィードバックをオーケストレーションします。
*   **簡単なデモ実行**: `pip install "huggingface_hub[mcp]"`でインストール後、`tiny-agents run`コマンドでHugging Face Hubのデータセットから既存のエージェントを簡単に実行できます。
*   **エージェントの構成**: `agent.json`ファイルで、使用するLLMモデル、推論プロバイダー、接続するMCPサーバー、初期システムプロンプトを定義します。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、JavaScript版の成功を受け、Python版の「Tiny Agent」をリリースしました。これは、`huggingface_hub` SDKをMCPクライアントとして拡張し、MCPサーバーからツールをプルしてLLMの推論時に渡すことを可能にします。これにより、開発者は約70行のコードでツール利用型エージェントを構築できるようになります。
*   **背景**: 大規模言語モデル（LLM）が外部ツールやAPIと連携する際の複雑さを解消するため、MCP (Model Context Protocol) が開発されました。これは、LLMがツールとインタラクションする方法を標準化し、カスタム統合の必要性を排除することで、LLMに新しい機能を追加するプロセスを簡素化します。現代のLLMは関数呼び出し（ツール利用）のために設計されており、特定のユースケースに合わせたアプリケーション構築を容易にします。
*   **影響**:
    *   LLM開発者は、各ツールに対するカスタム統合の記述が不要になり、ツール利用が大幅に簡素化されます。
    *   エージェントの構築が容易になり、開発者はより迅速に強力なツール利用型LLMアプリケーションを開発できます。
    *   Webブラウジング、画像生成、ファイルシステムアクセスなど、多様なタスクをLLMエージェントに実行させることが可能になります。
*   **関係者**:
    *   **Hugging Face**: Tiny AgentsのPython版を開発し、`huggingface_hub` SDKにMCPクライアント機能を統合しました。
    *   **開発者/ユーザー**: `huggingface_hub[mcp]`をインストールし、CLIまたはコードを通じてTiny Agentを利用・構築する人々。
    *   **MCPサーバー提供者**: Playwright MCPサーバー、Gradio Spaces、ファイルシステムサーバーなど、ツールを提供する側。
    *   **LLMプロバイダー**: Qwen/Qwen2.5-72B-Instruct (Nebius inference provider経由) など、LLMモデルと推論サービスを提供する企業。
*   **データ**:
    *   **コード行数**: エージェントのコアロジックは約70行で実装されています。
    *   **必要なライブラリ**: `huggingface_hub[mcp]>=0.32.0`
    *   **MCPClientの機能**: 複数のMCPサーバーへの非同期接続管理、ツールの発見、LLM向けツールフォーマット、ツール呼び出しの実行。
    *   **Agentの構成ファイル**: `agent.json` (モデル、プロバイダー、サーバー設定) と `PROMPT.md` (システムプロンプト)。
    *   **MCPサーバーの種類**: `stdio` (ローカルプロセス、例: Playwright)、`http` (リモートツール)、`sse` (以前の標準)。
    *   **エージェントのコア**: `Agent.run()` メソッド内の`while True`ループで、ユーザー入力処理、LLMとの対話、ツール実行、終了条件チェックを行います。

## 引用（Notable quotes）
*   "An Agent is essentially a while loop built right on top of an MCP Client!"
*   "MCP (Model Context Protocol) is an open protocol that standardizes how Large Language Models (LLMs) interact with external tools and APIs. Essentially, it removed the need to write custom integrations for each tool, making it simpler to plug new capabilities into your LLMs."
*   "The coolest part is that you can load agents directly from the Hugging Face Hub tiny-agents Dataset, or specify a path to your own local agent configuration!"

## リスクと課題
記事中には明示的なリスクや課題の記述はほとんどありませんが、異なるLLMモデルや推論プロバイダー間でのツール呼び出しパフォーマンスの差異が指摘されており、この最適化が今後の課題となり得ます。

## 今後の見通し/アクション
*   **ベンチマーク**: 異なるLLMモデルと推論プロバイダーがエージェントのパフォーマンスに与える影響をベンチマークする。
*   **ローカルLLM連携**: `llama.cpp`やLM StudioのようなローカルLLM推論サーバーとTiny Agentを連携させる。
*   **コミュニティ貢献**: Hugging Face Hubの`tiny-agents/tiny-agents`データセットに独自のTiny Agentを共有し、オープンソースプロジェクトに貢献する。

## Source URL
https://huggingface.co/blog/python-tiny-agents
