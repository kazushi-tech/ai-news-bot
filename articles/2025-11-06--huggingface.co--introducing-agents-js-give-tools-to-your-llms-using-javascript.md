---
title: "Introducing Agents.js: Give tools to your LLMs using JavaScript"
title_ja: "Agents.js公開：JSでLLMにツール付与"
source_url: "https://huggingface.co/blog/agents-js"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、JavaScriptで大規模言語モデル（LLM）に外部ツールへのアクセスを可能にする新ライブラリ「Agents.js」を発表しました。このライブラリはブラウザとサーバーの両方で動作し、マルチモーダルツールを標準搭載しているほか、カスタムLLMやカスタムツールで容易に拡張可能です。これにより、JavaScript開発者はLLMの能力を拡張し、画像生成やファイル処理などの複雑なタスクをコードベースで実現できるようになります。

## 重要ポイント
*   **LLMへのツールアクセス**: JavaScript環境（ブラウザ/Node.js）でLLMに外部ツールへのアクセス機能を提供します。
*   **マルチモーダル対応**: 画像生成やキャプション付けなど、複数のモダリティを扱うツールを標準で搭載しています。
*   **高い拡張性**: デフォルトのLLM（OpenAssistant）だけでなく、OpenAI APIなど任意のカスタムLLMを利用可能。また、独自のカスタムツールを簡単に作成・追加できます。
*   **ファイル入力対応**: 画像などの入力ファイルをエージェントに渡し、ツールで処理させることが可能です。
*   **セキュリティに関する注意**: `agent.run()`メソッドは任意のコードを実行するため、信頼できない環境での使用はセキュリティリスクを伴います。コードを確認するために`generateCode`と`evaluateCode`の組み合わせが推奨されます。

## 詳細レポート
### What happened
Hugging Faceは、LLMが外部ツールを利用してタスクを実行するための新しいJavaScriptライブラリ「Agents.js」をリリースしました。このライブラリは、JavaScript開発者がLLMの能力を拡張し、より複雑なアプリケーションを構築できるように設計されています。

### 背景
LLMは強力なテキスト生成能力を持つ一方で、リアルタイムデータアクセスや特定の外部機能（画像生成、ファイル操作など）の実行には限界があります。Agents.jsは、LLMがこれらの外部ツールと連携できるようにすることで、その応用範囲を大幅に広げることを目的としています。

### 影響
*   **開発者**: JavaScript開発者は、LLMを単なるテキスト生成エンジンとしてではなく、外部ツールを操作する「エージェント」として活用できるようになります。これにより、より高度でインタラクティブなAIアプリケーションの開発が促進されます。
*   **アプリケーション**: LLMが画像生成、画像キャプション付け、テキスト読み上げ、ファイル処理など、多様なタスクを直接実行できるようになり、マルチモーダルな機能を持つアプリケーションの構築が容易になります。

### 関係者
*   **開発元**: Hugging Face (huggingface.jsチーム)
*   **主な利用者**: JavaScriptを使用する開発者、AIアプリケーション開発者

### データ
*   **インストール方法**: `npm install @huggingface/agents`
*   **デフォルトLLM**: OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5 (Hugging Face Inference API経由)
*   **返されるメッセージ形式**:
    ```typescript
    export interface Update {
        message: string;
        data: undefined | string | Blob;
    }
    ```
    `data`フィールドは、画像や音声などのバイナリデータ（Blob）を含むことができます。

## 引用（Notable quotes）
「Agents.jsは、JavaScriptからLLMにツールアクセスを提供する新しいライブラリであり、ブラウザまたはサーバーのどちらでも利用可能です。」

## リスクと課題
*   **任意コード実行のセキュリティリスク**: `HfAgent`の`run()`メソッドは、LLMが生成した任意のJavaScriptコードを直接評価・実行します。このため、信頼できない環境で使用するとセキュリティ上の脆弱性につながる可能性があります。
*   **推奨される利用方法**: セキュリティリスクを回避するため、開発者は`generateCode()`でコードを生成し、その内容を確認した上で`evaluateCode()`で実行するフローが推奨されています。

## 今後の見通し/アクション
*   **利用開始**: 開発者は`npm`を通じてAgents.jsライブラリをインストールし、Hugging Faceアクセストークンを使用してすぐに利用を開始できます。
*   **機能拡張**: デフォルトのツールやLLMに加えて、独自のカスタムLLM（例: OpenAI API）やカスタムツールを実装することで、特定のニーズに合わせた機能を拡張できます。
*   **デモの体験**: Hugging Faceが提供するデモを通じて、Agents.jsの実際の動作と可能性を体験することが推奨されます。

## Source URL
https://huggingface.co/blog/agents-js
