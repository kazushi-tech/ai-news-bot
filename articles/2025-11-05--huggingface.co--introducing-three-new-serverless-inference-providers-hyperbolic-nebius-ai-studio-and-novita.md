---
title: "Introducing Three New Serverless Inference Providers: Hyperbolic, Nebius AI Studio, and Novita 🔥"
title_ja: "3つの新サーバーレス推論プロバイダー登場 Hyperbolic, Nebius AI Studio, Novita"
source_url: "https://huggingface.co/blog/inference-providers-nebius-novita-hyperbolic"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Face Hubは、サーバーレス推論プロバイダーとして新たにHyperbolic、Nebius AI Studio、Novitaの3社を統合しました。これにより、Hub上でのモデル利用の幅と柔軟性が大幅に向上し、ユーザーはDeepSeek-R1やFLUX.1などの多様なモデルを、好みのプロバイダーと柔軟な課金オプションで利用できるようになります。

## 重要ポイント
*   **新規プロバイダー追加**: Hyperbolic、Nebius AI Studio、Novitaの3社がHugging Face Hubのサーバーレス推論エコシステムに加わりました。
*   **利用体験の向上**: HubのモデルページUIおよびPython/JSクライアントSDKから、これらのプロバイダーをシームレスに利用可能です。
*   **モデルの拡大**: DeepSeek-R1、FLUX.1など、より多くの最先端モデルが利用可能になりました。
*   **柔軟な課金オプション**: ユーザーは自身のプロバイダーAPIキーを使用するか、Hugging Face経由でルーティングするかを選択でき、Hugging Face経由の場合もプロバイダーの標準料金が追加マークアップなしで適用されます。
*   **PROユーザー特典**: Hugging Face PROユーザーは毎月2ドルの推論クレジットを受け取れます。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Face Hubは、サーバーレス推論プロバイダーのラインナップにHyperbolic、Nebius AI Studio、Novitaの3社を新たに追加しました。これにより、既存のTogether AI、Sambanova、Replicate、fal、Fireworks.aiといったプロバイダー群がさらに拡充され、ユーザーはより多様な選択肢を得られるようになりました。

### 背景
Hugging Face Hubのサーバーレス推論エコシステムを強化し、ユーザーがより幅広いモデルを柔軟かつ簡単に利用できるようにすることが目的です。これにより、開発者は好みのプロバイダーを選択し、自身のアプリケーションにAIモデルを統合する際の障壁が低減されます。

### 影響
*   ユーザーはHugging Face HubのウェブUIまたはPython/JSのクライアントSDKを通じて、これらの新しいプロバイダーを直接利用できるようになりました。
*   DeepSeek-R1やFLUX.1-devといった新しいモデルが、対応するプロバイダー（例: DeepSeek-R1はHyperbolic/Novita、FLUX.1-devはNebius AI Studio）で利用可能になりました。
*   APIキーを直接使用する「カスタムキー」方式と、Hugging Face経由でルーティングする「HFルーティング」方式の2つの利用モードが提供され、課金もそれぞれプロバイダーまたはHugging Faceアカウントに適用されます。
*   Hugging Face PROユーザーには月額2ドルの推論クレジットが提供され、無料ユーザーにも小規模なクォータでの無料推論が提供されます。

### 関係者
*   **Hugging Face**: プラットフォーム提供者、エコシステム管理者。
*   **Hyperbolic**: 新規サーバーレス推論プロバイダー。
*   **Nebius AI Studio**: 新規サーバーレス推論プロバイダー。
*   **Novita**: 新規サーバーレス推論プロバイダー。
*   **既存プロバイダー**: Together AI, Sambanova, Replicate, fal, Fireworks.ai。

### データ

**新規追加プロバイダー**

| プロバイダー名 |
| :------------- |
| Hyperbolic     |
| Nebius AI Studio |
| Novita         |

**サポートされるモデル例と対応プロバイダー**

| モデル名 (Hugging Face ID) | 主要プロバイダー |
| :------------------------- | :--------------- |
| DeepSeek-R1 (deepseek-ai/DeepSeek-R1) | Hyperbolic, Novita |
| FLUX.1-dev (black-forest-labs/FLUX.1-schnell) | Nebius AI Studio |

**利用モードと課金体系**

| 課金モード   | APIキーの利用 | 課金先           | Hugging Faceの追加マークアップ |
| :----------- | :------------ | :--------------- | :----------------------------- |
| カスタムキー | プロバイダーのAPIキー | プロバイダーアカウント | なし                             |
| HFルーティング | Hugging Faceトークン | Hugging Faceアカウント | なし                             |

## 引用（Notable quotes）
*   "We’re thrilled to announce the addition of three more outstanding serverless Inference Providers to the Hugging Face Hub: Hyperbolic, Nebius AI Studio, and Novita."
*   "There's no additional markup from us, we just pass through the provider costs directly."
*   "PRO users get $2 worth of Inference credits every month."

## リスクと課題
記事は非常にポジティブなトーンで書かれており、直接的なリスクや課題は明記されていません。ユーザーは複数のプロバイダーと課金方法から選択できるため、自身のニーズに最適なオプションを理解し、選択する必要があります。

## 今後の見通し/アクション
*   ユーザーからのフィードバックをHugging Face Hubのディスカッション（`https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49`）を通じて積極的に募集しています。
*   Hugging Faceは将来的にプロバイダーパートナーとの収益分配契約を確立する可能性を示唆しています。
*   PROプランへのアップグレードが推奨されており、推論クレジット、ZeroGPU、Spaces Dev Mode、20倍の制限緩和などの特典が提供されます。

## Source URL
https://huggingface.co/blog/inference-providers-nebius-novita-hyperbolic
