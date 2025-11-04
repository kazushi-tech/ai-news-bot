---
title: "Introducing Agents.js: Give tools to your LLMs using JavaScript"
title_ja: ""
source_url: "https://huggingface.co/blog/agents-js"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、JavaScript（ブラウザおよびNode.js）で大規模言語モデル（LLM）に外部ツールへのアクセスを可能にする新ライブラリ「Agents.js」を発表しました。これにより、LLMはテキスト生成だけでなく、画像生成、翻訳、音声合成などの具体的なアクションを実行できるようになり、カスタムLLMやツールの拡張も容易です。

## 重要ポイント
*   **LLMへのツールアクセス**: JavaScript環境（ブラウザ/Node.js）でLLMが外部ツールを利用できるようにするライブラリ。
*   **多機能性**: テキストから画像生成、画像キャプション、テキスト翻訳、テキスト読み上げなど、多様なタスクに対応するマルチモーダルツールを標準搭載。
*   **高い拡張性**: デフォルトのLLM（OpenAssistant）やツールに加え、カスタムLLM（例: OpenAI API）やカスタムツールを容易に組み込める。
*   **マルチモーダル対応**: 入力ファイル（画像など）をエージェントに渡し、ツールで処理することが可能。
*   **セキュリティへの配慮**: LLMが生成した任意コードを実行する`run`メソッドにはセキュリティリスクがあるため、`generateCode`と`evaluateCode`の利用を推奨。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、JavaScript開発者向けにLLMが外部ツールを利用できるようにする新しいライブラリ「Agents.js」をリリースしました。このライブラリは、ブラウザとサーバーの両方で動作し、LLMがテキスト生成以外の具体的なアクションを実行する能力を拡張します。
*   **背景**: LLMの能力を最大限に引き出すためには、外部のデータやサービスと連携する「ツール」の利用が不可欠です。Agents.jsは、このツールアクセス機能をJavaScriptエコシステムに導入し、開発者がより高度でインタラクティブなLLMアプリケーションを構築できるようにすることを目的としています。
*   **影響**: 開発者は、JavaScriptを用いて画像生成、翻訳、音声合成など、マルチモーダルなタスクを単一のプロンプトで実行できるLLMアプリケーションを構築できるようになります。これにより、ユーザー体験が向上し、LLMの応用範囲が大きく広がります。ただし、任意コード実行に伴うセキュリティリスクには注意が必要です。
*   **関係者**:
    *   **Hugging Face**: Agents.jsの開発元であり、ライブラリを提供。
    *   **JavaScript開発者**: LLMを活用したアプリケーションを構築するエンジニア。
    *   **LLMプロバイダー**: OpenAssistant (デフォルト)、OpenAIなど、カスタムLLMとして利用可能なサービス。
*   **データ**:
    *   **デフォルトLLM**: OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5 (Hugging Face Inference API経由)
    *   **カスタムLLM例**: OpenAIの`text-davinci-003`モデル
    *   **カスタムツール例**: 翻訳モデル`t5-base`

## 引用（Notable quotes）
*   "It's a new library for giving tool access to LLMs from JavaScript in either the browser or the server." (JavaScriptのブラウザまたはサーバーでLLMにツールアクセスを提供する新しいライブラリです。)
*   "Currently using this library will mean evaluating arbitrary code in the browser (or in Node). This is a security risk and should not be done in an untrusted environment." (現在、このライブラリを使用することは、ブラウザ（またはNode）で任意のコードを評価することを意味します。これはセキュリティリスクであり、信頼できない環境で行うべきではありません。)
*   "Agents.js was designed to be easily expanded with custom tools & examples." (Agents.jsは、カスタムツールや例で簡単に拡張できるように設計されています。)

## リスクと課題
*   **セキュリティリスク**: `agent.run()`メソッドは、LLMが生成した任意コードを直接実行するため、信頼できない環境での使用はセキュリティ上の大きなリスクを伴います。悪意のあるコードが実行される可能性があります。
*   **対策**: Hugging Faceは、生成されたコードをレビューするために`agent.generateCode()`と`agent.evaluateCode()`を組み合わせた使用を推奨しています。

## 今後の見通し/アクション
*   **開発者向け**: Agents.jsはnpmからインストール可能であり、Hugging Faceのウェブサイトで提供されているデモを試すことができます。カスタムLLMやカスタムツールを組み込むことで、多様なユースケースに対応するアプリケーションを構築することが推奨されます。
*   **Hugging Face**: 今後もライブラリの機能強化やセキュリティ対策の改善が期待されます。

## Source URL（必須）
https://huggingface.co/blog/agents-js
