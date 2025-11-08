---
title: 'ScreenEnv: Deploy your full stack Desktop Agent'
title_ja: ScreenEnv、フルスタックデスクトップAIエージェントをDockerで簡単展開
source_url: 'https://huggingface.co/blog/screenenv'
date: '2025-11-06'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    -
    ScreenEnvは、Dockerコンテナ内で隔離されたUbuntuデスクトップ環境を構築するための強力なPythonライブラリです。これにより、GUIエージェント（デスクトップエージェント）のテストとデプロイが可能になります。Model 
  - '- ## 重要ポイント'
  - >-
    - *   **フルデスクトップ制御**:
    マウス・キーボード操作、ウィンドウ管理、アプリケーション起動、ファイル操作、ターミナルアクセス、セッション録画など、デスクトップ環境全体をコードから完全に制御できます。
  - >-
    - *   **デュアル統合モード**: AIシステム向けのModel Context Protocol (MCP)
    と、既存のバックエンドやカスタムエージェント向けのDirect Sandbox APIの2つの統合アプローチをサポートします。
  - >-
    - *   **Dockerネイティブ**:
    複雑なVM設定が不要で、Dockerコンテナ内で隔離された再現性の高い環境を10秒未満でデプロイ可能。AMD64およびARM64アーキテクチャに対応しています。
---
## 概要 (TL;DR)

ScreenEnvは、Dockerコンテナ内で隔離されたUbuntuデスクトップ環境を構築するための強力なPythonライブラリです。これにより、GUIエージェント（デスクトップエージェント）のテストとデプロイが可能になります。Model Context Protocol (MCP) を内蔵しており、実際のアプリケーションを視覚的に認識し、クリックし、操作できるデスクトップエージェントをこれまでになく簡単にデプロイできます。

## 重要ポイント

*   **フルデスクトップ制御**: マウス・キーボード操作、ウィンドウ管理、アプリケーション起動、ファイル操作、ターミナルアクセス、セッション録画など、デスクトップ環境全体をコードから完全に制御できます。
*   **デュアル統合モード**: AIシステム向けのModel Context Protocol (MCP) と、既存のバックエンドやカスタムエージェント向けのDirect Sandbox APIの2つの統合アプローチをサポートします。
*   **Dockerネイティブ**: 複雑なVM設定が不要で、Dockerコンテナ内で隔離された再現性の高い環境を10秒未満でデプロイ可能。AMD64およびARM64アーキテクチャに対応しています。
*   **ワンラインセットアップ**: `from screenenv import Sandbox; sandbox = Sandbox()` の1行でサンドボックス環境を起動できます。
*   **smolagentsとの連携**: smolagentsフレームワークと連携し、カスタムのAIパワードデスクトップエージェントを容易に構築できます。

## 詳細レポート

### What happened/背景
従来のデスクトップタスク自動化やGUIアプリケーションのテスト、AIエージェントによるソフトウェア操作は、複雑な仮想マシン（VM）設定や脆弱な自動化フレームワークを必要とし、開発の障壁となっていました。ScreenEnvは、この課題を解決するために開発されました。Dockerコンテナ内に完全に隔離された仮想デスクトップセッションを提供することで、コードからデスクトップ環境全体を制御し、AIエージェントが実際のGUIアプリケーションとインタラクティブにやり取りできるようにします。

### 影響
ScreenEnvは、AIエージェント開発者や研究者が、より高度で汎用的なデスクトップエージェントを構築・デプロイする道を拓きます。これにより、GUIアプリケーションの自動テスト、デスクトップタスクの自動化、そしてAIが現実世界のソフトウェア環境と対話する能力を大幅に向上させることが期待されます。開発者は、複雑なインフラ設定に煩わされることなく、エージェントのロジック開発に集中できます。

### 関係者
*   **ScreenEnv**: Hugging Faceが提供するPythonライブラリ。
*   **Docker**: サンドボックス化されたデスクトップ環境をコンテナとして提供する基盤技術。
*   **smolagents**: ScreenEnvと連携してAIパワードデスクトップエージェントを構築するためのエージェントフレームワーク。
*   **Model Context Protocol (MCP)**: AIシステムがデスクトップ環境と対話するための標準プロトコル。

### データ
ScreenEnvは、以下の2つの主要な統合アプローチを提供します。

1.  **Direct Sandbox API**:
    *   カスタムエージェントフレームワークや既存のバックエンドに最適。
    *   Pythonコードから直接、サンドボックスの起動、アプリケーションの実行、テキスト入力、スクリーンショット取得など、きめ細やかな制御が可能。
    *   例: `sandbox.launch("xfce4-terminal")`, `sandbox.write("echo 'Custom agent logic'")`

2.  **MCP Server Integration**:
    *   Model Context ProtocolをサポートするAIシステムに最適。
    *   ScreenEnvがMCPサーバーとして機能し、AIエージェントがURL経由で接続してデスクトップを制御。
    *   例: `MCPRemoteServer` を起動し、`ClientSession` を通じてツール呼び出し (`session.call_tool("screenshot", {})`) を行う。

smolagentsと連携してデスクトップエージェントを作成する手順は以下の通りです。

1.  **モデルの選択**: OpenAI、Hugging Face Inference Endpoints、Transformersモデル、LiteLLMなど、様々なVLM（Visual Language Model）バックエンドを選択。
2.  **カスタムデスクトップエージェントの定義**: `DesktopAgentBase` を継承し、`_setup_desktop_tools` メソッドで `click`, `write`, `press`, `open`, `launch_app` などのカスタムアクション（ツール）を定義。
3.  **デスクトップタスクの実行**: `Sandbox` 環境を定義し、作成した `CustomDesktopAgent` にタスクを渡して実行。

## 引用（Notable quotes）

該当なし。

## リスクと課題

*   **OSサポートの現状**: 現在はUbuntuデスクトップ環境に限定されており、Linux以外のOS（Android, macOS, Windows）への対応は今後の課題です。
*   **Docker権限**: Dockerコンテナの実行には適切な権限が必要であり、ユーザーが`docker`グループに属していない場合や、`sudo`を使用しないとアクセス拒否エラーが発生する可能性があります。
*   **プロンプトエンジニアリング**: エージェントの性能を最大化するには、定義したアクションスペースに合わせてプロンプトを調整する必要があります。

## 今後の見通し/アクション

### 今後の見通し
ScreenEnvは、LinuxだけでなくAndroid、macOS、Windowsへのサポートを拡大し、真のクロスプラットフォームGUI自動化を実現することを目指しています。これにより、開発者や研究者は、最小限のセットアップで様々な環境に対応できるエージェントを構築できるようになります。これらの進歩は、ベンチマークや評価に理想的な、再現性のあるサンドボックス環境の作成を促進します。

### アクション
今日からScreenEnvを始めるには、以下の手順を実行します。

1.  **インストール**:
    ```bash
    pip install screenenv
    ```
2.  **サンプルコードの試用**:
    ```bash
    git clone git@github.com:huggingface/screenenv.git
    cd screenenv
    python -m examples.desktop_agent
    # Docker権限エラーが発生する場合は、'sudo -E python -m examples.desktop_agent' を試すか、ユーザーを'docker'グループに追加してください。
    ```

## Source URL
https://huggingface.co/blog/screenenv
