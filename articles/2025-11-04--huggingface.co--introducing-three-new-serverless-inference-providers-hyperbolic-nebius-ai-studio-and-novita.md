---
title: "Introducing Three New Serverless Inference Providers: Hyperbolic, Nebius AI Studio, and Novita 🔥"
title_ja: ""
source_url: "https://huggingface.co/blog/inference-providers-nebius-novita-hyperbolic"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、サーバーレス推論プロバイダーとしてHyperbolic、Nebius AI Studio、Novitaの3社を新たにHugging Face Hubに統合しました。これにより、Hub上で利用可能なモデルの種類と推論能力が大幅に拡充され、ユーザーはウェブUIやクライアントSDKs（Python/JS）を通じて、より多様なモデルをシームレスに利用できるようになります。

## 重要ポイント
*   **新プロバイダーの追加**: Hyperbolic、Nebius AI Studio、Novitaの3つのサーバーレス推論プロバイダーがHugging Face Hubに加わりました。
*   **モデルの拡充**: DeepSeek-R1、Flux.1など、新たなモデルがこれらのプロバイダーを通じて利用可能になりました。
*   **シームレスな利用**: ウェブUIおよびクライアントSDKs（Python/JS）から、好みのプロバイダーを選択して簡単に推論を実行できます。
*   **柔軟な課金体系**: ユーザーは自身のAPIキーを使用してプロバイダーに直接請求されるか、Hugging Face経由でルーティングされHugging Faceアカウントに請求されるかを選択できます（Hugging Face経由の場合、追加料金なし）。
*   **PROユーザー特典**: PROユーザーは毎月$2相当の推論クレジットを受け取れ、無料ユーザーにも小規模なクォータが提供されます。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened**:
Hugging Faceは、サーバーレス推論プロバイダーのエコシステムを拡大し、Hyperbolic、Nebius AI Studio、Novitaの3社を新たにHugging Face Hubに統合したことを発表しました。これらは既存のTogether AI、Sambanova、Replicate、fal、Fireworks.aiといったプロバイダーに加わります。

**背景**:
Hugging Faceは、AIモデルの利用を民主化し、開発者が多様なモデルを簡単にデプロイ・利用できる環境を提供することを目指しています。今回の統合は、その目標を達成するための一環として、サーバーレス推論の選択肢を増やし、ユーザー体験を向上させるものです。

**影響**:
*   **利用可能なモデルの拡大**: 新しいプロバイダーにより、DeepSeek-R1やFlux.1などの最新モデルを含む、より幅広いモデルがHugging Face Hub上でサーバーレス推論として利用可能になります。
*   **開発の柔軟性向上**: ユーザーはウェブUIのユーザーアカウント設定でAPIキーを設定し、プロバイダーの優先順位を決定できます。また、PythonおよびJavaScriptのクライアントSDKsを通じて、コードから簡単にプロバイダーを切り替えて推論を実行できます。
*   **課金オプションの選択**: ユーザーは、プロバイダーのAPIキーを直接使用してプロバイダーから直接請求を受けるか、Hugging Faceのトークンを使用してHugging Face経由でルーティングし、Hugging Faceアカウントに請求を受けるかを選択できます。Hugging Face経由の場合、プロバイダーの標準API料金がそのまま適用され、追加マークアップはありません。
*   **コスト効率**: PROユーザーは毎月$2相当の推論クレジットを受け取ることができ、複数のプロバイダーで利用可能です。無料ユーザーにも小規模な無料推論クォータが提供されます。

**関係者**:
*   **Hugging Face**: プラットフォーム提供者。
*   **Hyperbolic**: 新規サーバーレス推論プロバイダー。
*   **Nebius AI Studio**: 新規サーバーレス推論プロバイダー。
*   **Novita**: 新規サーバーレス推論プロバイダー。
*   **Together AI, Sambanova, Replicate, fal, Fireworks.ai**: 既存のサーバーレス推論プロバイダー。

**データ**:
*   **サポートモデル例**:
    | プロバイダー | サポートモデル例 |
    |---|---|
    | Hyperbolic | DeepSeek-R1 |
    | Nebius AI Studio | FLUX.1-schnell |
    | Novita | DeepSeek-R1 |
*   **課金**:
    *   カスタムキー使用時: 各プロバイダーから直接請求。
    *   Hugging Face経由時: Hugging Faceアカウントに請求（プロバイダーの標準API料金のみ、Hugging Faceからの追加マークアップなし）。
    *   PROユーザー特典: 毎月$2相当の推論クレジット。
    *   無料ユーザー特典: 小規模な無料推論クォータ。

## 引用（Notable quotes）
*   "We’re thrilled to announce the addition of three more outstanding serverless Inference Providers to the Hugging Face Hub: Hyperbolic, Nebius AI Studio, and Novita."
*   "We're quite excited to see what you'll build with these new providers!"

## リスクと課題
記事本文には、特筆すべきリスクや課題の記述はありません。

## 今後の見通し/アクション
Hugging Faceは、今後もプロバイダーエコシステムを拡大し、ユーザーからのフィードバックを基にサービスを改善していく意向です。将来的には、プロバイダーパートナーとのレベニューシェア契約の確立も検討されています。ユーザーは、提供されたHugging Face Hubのディスカッションリンクを通じてフィードバックを提供することが推奨されています。

## Source URL（必須）
https://huggingface.co/blog/inference-providers-nebius-novita-hyperbolic
