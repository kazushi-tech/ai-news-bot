---
title: "Introducing Three New Serverless Inference Providers: Hyperbolic, Nebius AI Studio, and Novita 🔥"
title_ja: "「Hyperbolic、Nebius AI Studio、Novita」サーバーレス推論3社追加"
source_url: "https://huggingface.co/blog/inference-providers-nebius-novita-hyperbolic"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、サーバーレス推論プロバイダーとしてHyperbolic、Nebius AI Studio、Novitaの3社を新たにHugging Face Hubに統合しました。これにより、ユーザーはHubのモデルページやクライアントSDKから、DeepSeek-R1やFlux.1などの多様なモデルをより柔軟に利用できるようになります。

## 重要ポイント
*   **新規プロバイダー追加**: Hyperbolic、Nebius AI Studio、NovitaがHugging Face Hubのサーバーレス推論エコシステムに加わりました。
*   **モデルの多様化**: DeepSeek-R1、Flux.1など、新たなモデルがこれらのプロバイダーを通じて利用可能になります。
*   **柔軟な利用方法**: Hugging Faceアカウント経由でのルーティング、または各プロバイダーのAPIキーを直接使用するかの選択が可能です。ユーザーはアカウント設定でプロバイダーの優先順位を設定できます。
*   **SDK統合**: Python (huggingface_hub) および JavaScript (@huggingface/inference) のクライアントSDKにシームレスに統合され、簡単にプロバイダーを切り替えて利用できます。
*   **課金体系**: プロバイダーのAPIキーを直接使用する場合はプロバイダーから課金され、Hugging Face経由でルーティングされる場合はHugging Faceアカウントに標準APIレートで課金されます（Hugging Faceによる追加マークアップなし）。
*   **PROユーザー特典**: PROユーザーは毎月2ドル相当の推論クレジットを受け取れます。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、サーバーレス推論サービスを強化するため、Hyperbolic、Nebius AI Studio、Novitaの3つの新しい推論プロバイダーをHugging Face Hubに導入しました。これらは既存のTogether AI、Sambanova、Replicate、fal、Fireworks.aiといったプロバイダー群に加わります。
*   **背景**: AIモデルの利用が拡大する中で、ユーザーがより幅広いモデルにアクセスし、柔軟な方法で推論を実行できる環境を提供することが目的です。これにより、Hugging Faceエコシステムの多様性と機能性が向上します。
*   **影響**:
    *   ユーザーはHugging Face HubのウェブUIまたはPython/JSクライアントSDKを通じて、DeepSeek-R1やFLUX.1-devなどの新しいモデルをこれらのプロバイダー経由で利用できるようになりました。
    *   APIキーの管理とプロバイダーの優先順位付けがユーザーアカウント設定で可能になり、利用体験が向上します。
    *   課金は、プロバイダーのAPIキーを直接使用する場合はそのプロバイダーから、Hugging Face経由の場合はHugging Faceアカウントから行われます。Hugging Faceはルーティング時に追加料金を徴収しません。
*   **関係者**: Hugging Face (プラットフォーム提供者)、Hyperbolic, Nebius AI Studio, Novita (新規推論プロバイダー)、Together AI, Sambanova, Replicate, fal, Fireworks.ai (既存推論プロバイダー)。
*   **データ**:
    *   **利用例**: Python SDK (huggingface_hub) を使用したDeepSeek-R1 (Hyperbolic経由) のチャット補完、FLUX.1-schnell (Nebius AI Studio経由) のテキスト-画像生成。JavaScript SDK (@huggingface/inference) を使用したDeepSeek-R1 (Novita経由) のチャット補完。
    *   **PROユーザー特典**: 毎月2ドル相当の推論クレジット。

## 引用（Notable quotes）
*   「We’re thrilled to announce the addition of three more outstanding serverless Inference Providers to the Hugging Face Hub: Hyperbolic, Nebius AI Studio, and Novita.」
*   「We're quite excited to see what you'll build with these new providers!」
*   「There's no additional markup from us, we just pass through the provider costs directly.」
*   「PRO users get $2 worth of Inference credits every month. You can use them across providers. 🔥」

## リスクと課題
*   **プロバイダー選択の複雑性**: 複数のプロバイダーが存在するため、ユーザーは自身のニーズ（性能、コスト、特定のモデルサポートなど）に最適なプロバイダーを選択するための情報収集と評価が必要になる可能性があります。
*   **課金体系の理解**: プロバイダー直接利用とHugging Face経由利用で課金元が異なるため、ユーザーはそれぞれの課金ポリシーを正確に理解しておく必要があります。
*   **将来的な収益分配**: 将来的にHugging Faceとプロバイダー間で収益分配契約が確立される可能性が示唆されており、これが課金体系に影響を与える可能性もゼロではありません。

## 今後の見通し/アクション
*   Hugging Faceは、ユーザーからのフィードバックを積極的に求めており、Hubのディスカッションフォーラムを通じて意見を収集しています。
*   PROプランのユーザーは引き続き毎月推論クレジットを受け取ることができ、無料ユーザーも少量のクォータで推論を利用できますが、より多くの機能とクレジットのためにPROへのアップグレードが推奨されています。
*   今後もHugging Faceは、サーバーレス推論エコシステムの拡大と機能強化を継続し、ユーザーがAIモデルをより簡単に、より柔軟に利用できる環境を提供していく見込みです。

## Source URL（必須）
https://huggingface.co/blog/inference-providers-nebius-novita-hyperbolic
