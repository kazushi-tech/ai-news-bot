---
title: "ScreenEnv: Deploy your full stack Desktop Agent"
title_ja: "ScreenEnv、DockerでデスクトップAIを完全展開"
source_url: "https://huggingface.co/blog/screenenv"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

ScreenEnvは、Dockerコンテナ内に隔離されたUbuntuデスクトップ環境を構築するための強力なPythonライブラリです。これにより、GUIエージェント（デスクトップエージェント）のテストとデプロイが容易になります。Model Context Protocol (MCP) のサポートを内蔵しており、実際のアプリケーションを視覚的に認識し、クリックし、操作できるデスクトップエージェントを簡単に展開できます。

## 重要ポイント

*   **サンドボックス型デスクトップ環境**: Dockerコンテナ内で完全に隔離された仮想Ubuntuデスクトップセッションを提供し、コードからマウス・キーボード操作、ウィンドウ管理、アプリケーション起動、ファイル操作、ターミナルアクセス、画面記録など、デスクトップ全体を制御できます。
*   **デュアル統合モード**: AIシステム向けのModel Context Protocol (MCP) と、既存のバックエンドやカスタムエージェントフレームワーク向けの直接Sandbox APIという2つの統合アプローチをサポートし、柔軟なシステム連携を可能にします。
*   **Dockerネイティブ**: 複雑なVM設定が不要で、Dockerのみで動作します。環境は隔離され、再現性があり、AMD64およびARM64アーキテクチャに対応し、10秒以内にデプロイ可能です。
*   **smolagentsとの連携**: `smolagents`ライブラリとネイティブに連携し、カスタムのAIパワードデスクトップエージェントを簡単に構築できます。

## 詳細レポート

### What happened/背景

ScreenEnvは、デスクトップタスクの自動化、GUIアプリケーションのテスト、ソフトウェアと対話するAIエージェントの構築といった従来の課題（複雑なVM設定や脆い自動化フレームワーク）を解決するために開発されました。Dockerコンテナ内に完全な仮想デスクトップ環境を提供することで、これらのプロセスを簡素化し、堅牢性と再現性をもたらします。

### 影響

ScreenEnvは、AIエージェント開発者や研究者が、実際のデスクトップ環境でエージェントをテスト・デプロイする際の障壁を大幅に低減します。これにより、より高度で汎用的なデスクトップAIエージェントの構築が促進され、GUIアプリケーションの自動テストやRPA（ロボティック・プロセス・オートメーション）の分野にも応用が期待されます。

### 関係者

Hugging FaceがScreenEnvを開発・提供しています。主な利用者は、AIエージェント開発者、研究者、デスクトップ自動化に取り組むエンジニアなどです。

### データ

ScreenEnvは以下の主要な機能と統合を提供します。

*   **セットアップ**: わずか1行のPythonコード (`from screenenv import Sandbox; sandbox = Sandbox()`) でサンドボックス環境を初期化できます。
*   **統合アプローチ**:
    *   **Direct Sandbox API**: Pythonコードから直接、デスクトップ操作（`sandbox.launch()`, `sandbox.write()`, `sandbox.screenshot()`など）を細かく制御できます。
    *   **MCP Server Integration**: Model Context Protocol (MCP) をサポートするAIシステム向けに、MCPサーバーとして機能し、AIエージェントがリモートからデスクトップを制御できます。
*   **smolagentsとの連携によるデスクトップエージェント作成**:
    1.  **モデル選択**: OpenAI, Hugging Face Inference Endpoints, Transformers, LiteLLMなど、様々なVLM（Vision-Language Model）をバックエンドとして選択できます。
    2.  **カスタムエージェント定義**: `DesktopAgentBase`を継承し、`_setup_desktop_tools`メソッドで`click`, `write`, `press`, `open`, `launch_app`などのカスタムアクション（ツール）を定義します。
    3.  **タスク実行**: 定義したサンドボックス環境とエージェントを使用して、具体的なデスクトップタスク（例: 「LibreOfficeを開き、レポートを作成して保存する」）を実行できます。

## 引用（Notable quotes）

*   「It's never been easier to deploy desktop agents that can see, click, and interact with real applications.」
*   「Think of it as a complete virtual desktop session that your code can fully control - not just clicking buttons and typing text, but managing the entire desktop experience including launching applications, organizing windows, handling files, executing terminal commands, and recording the entire session.」

## リスクと課題

*   **Docker権限**: Dockerのアクセス権限が適切に設定されていない場合、エージェントの実行時に「access denied」エラーが発生する可能性があります。ユーザーを`docker`グループに追加するか、`sudo -E`で実行する必要があります。
*   **プラットフォームの限定**: 現時点ではLinux (Ubuntu) 環境に限定されています。

## 今後の見通し/アクション

*   **クロスプラットフォーム対応**: 今後、LinuxだけでなくAndroid、macOS、Windowsへのサポートを拡大し、真のクロスプラットフォームGUI自動化を実現することを目指しています。
*   **ベンチマークと評価**: 再現性のあるサンドボックス環境を提供することで、AIエージェントのベンチマークや評価のための理想的な基盤を構築します。
*   **ユーザーへのアクション**:
    *   `pip install screenenv` でライブラリをインストールする。
    *   GitHubリポジトリをクローンし、提供されているサンプル (`python -m examples.desktop_agent`) を実行して機能を試す。

## Source URL
https://huggingface.co/blog/screenenv
