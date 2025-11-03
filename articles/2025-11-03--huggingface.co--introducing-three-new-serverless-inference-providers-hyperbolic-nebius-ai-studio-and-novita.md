---
title: "Introducing Three New Serverless Inference Providers: Hyperbolic, Nebius AI Studio, and Novita 🔥"
title_ja: "3つの新サーバーレス推論プロバイダー追加：Hyperbolic, Nebius AI Studio, Novita"
source_url: "https://huggingface.co/blog/inference-providers-nebius-novita-hyperbolic"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Face Hubは、サーバーレス推論プロバイダーとして新たにHyperbolic、Nebius AI Studio、Novitaの3社を統合しました。これにより、Hub上のモデルページやクライアントSDKから、より多様なモデルと推論オプションが利用可能となり、ユーザーは好みのプロバイダーを選択してAIモデルを簡単にデプロイ・利用できるようになります。

## 重要ポイント
*   **新規プロバイダーの追加**: Hyperbolic、Nebius AI Studio、Novitaの3社がHugging Face Hubのサーバーレス推論プロバイダーエコシステムに加わりました。
*   **シームレスな統合**: 新しいプロバイダーはHubのモデルページに表示され、PythonおよびJavaScriptのクライアントSDKから簡単に利用できます。
*   **モデルの拡充**: DeepSeek-R1やFlux.1など、新たなモデルがこれらのプロバイダーを通じて利用可能になります。
*   **柔軟な利用方法**: ユーザーは自身のAPIキーを直接使用するか、Hugging Face経由でルーティングするかの2つのモードを選択できます。
*   **課金体系**: カスタムキー使用時はプロバイダーから直接課金され、HF経由ルーティング時はHFアカウントにプロバイダーの標準API料金が課金されます（HFによる追加マークアップなし）。
*   **PROユーザー特典**: PROユーザーは毎月2ドルの推論クレジットを受け取ることができ、複数のプロバイダーで利用可能です。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、サーバーレス推論プロバイダーとしてHyperbolic、Nebius AI Studio、Novitaの3社を新たにHugging Face Hubに統合したことを発表しました。これにより、ユーザーはHubのウェブUIおよびクライアントSDK（Pythonの`huggingface_hub`、JSの`@huggingface/inference`）を通じて、これらのプロバイダーを利用してAIモデルの推論を実行できるようになりました。
*   **背景**: Hugging Faceは、Together AI、Sambanova、Replicate、fal、Fireworks.aiといった既存のプロバイダーに加え、さらに多様な推論オプションとモデルへのアクセスを提供することで、サーバーレス推論のエコシステムを強化することを目指しています。今回の追加は、ユーザーがより柔軟かつ効率的にAIモデルを活用できる環境を構築するための一環です。
*   **影響**: ユーザーは、DeepSeek-R1やFlux.1といった新しいモデルを、好みのプロバイダーを選択して利用できるようになります。APIキーの管理や課金方法（プロバイダー直接またはHugging Face経由）の選択肢が増え、開発の柔軟性と利便性が向上します。特に、Hugging Face経由のルーティングでは、プロバイダーごとのAPIキーが不要となり、Hugging Faceアカウントで一元的に課金されるため、管理が簡素化されます。
*   **関係者**:
    *   **Hugging Face**: プラットフォーム提供者、推論プロバイダーエコシステムの管理者。
    *   **Hyperbolic**: 新規サーバーレス推論プロバイダー。
    *   **Nebius AI Studio**: 新規サーバーレス推論プロバイダー。
    *   **Novita**: 新規サーバーレス推論プロバイダー。
    *   **既存プロバイダー**: Together AI, Sambanova, Replicate, fal, Fireworks.ai。
*   **データ**:
    *   **新規統合プロバイダー**: Hyperbolic, Nebius AI Studio, Novita
    *   **対応モデル例**:
        *   DeepSeek-R1 (Hyperbolic経由で利用可能)
        *   FLUX.1-schnell (Nebius AI Studio経由で利用可能)
    *   **利用可能なSDK**:
        *   Python: `huggingface_hub` (v0.29.0で公式サポート予定)
        *   JavaScript: `@huggingface/inference`
    *   **課金詳細**:
        *   **カスタムキー利用**: 各プロバイダーのアカウントから直接課金。
        *   **Hugging Faceルーティング利用**: Hugging Faceアカウントに課金。プロバイダーの標準API料金が適用され、Hugging Faceによる追加マークアップはなし。
        *   **PROユーザー特典**: 月額$2相当の推論クレジットを付与。
        *   **無料ユーザー**: 小規模なクォータで無料推論を提供。

## 引用（Notable quotes）
*   「We’re thrilled to announce the addition of three more outstanding serverless Inference Providers to the Hugging Face Hub: Hyperbolic, Nebius AI Studio, and Novita.」
*   「They’re also seamlessly integrated into our client SDKs (for both JS and Python), making it super easy to use a wide variety of models with your preferred providers.」
*   「There's no additional markup from us, we just pass through the provider costs directly.」
*   「We're quite excited to see what you'll build with these new providers!」

## リスクと課題
記事には直接的なリスクや課題の記述はありません。ただし、複数のプロバイダーと課金体系が存在するため、ユーザーは自身のニーズに最適なプロバイダーと利用モードを選択するための学習が必要となる可能性があります。

## 今後の見通し/アクション
Hugging Faceは、今後も推論プロバイダーのエコシステムを拡大し、ユーザーの利用体験を向上させることを目指しています。ユーザーからのフィードバックを積極的に募集しており、Hubのディスカッションページ（https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49）を通じて意見を共有することが推奨されています。また、PROプランへのアップグレードを促し、推論クレジット、ZeroGPU、Spaces Dev Modeなどの追加機能へのアクセスを推奨しています。

## Source URL（必須）
https://huggingface.co/blog/inference-providers-nebius-novita-hyperbolic
