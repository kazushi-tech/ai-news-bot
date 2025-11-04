---
title: "Public AI on Hugging Face Inference Providers 🔥"
title_ja: ""
source_url: "https://huggingface.co/blog/inference-providers-publicai"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、非営利のオープンソースプロジェクトであるPublic AIを新たなInference Providerとしてサポートを開始しました。これにより、Swiss AI InitiativeやAI Singaporeのような機関が提供する公共・主権AIモデルへのアクセスがHugging Face Hubから直接、またはSDKを通じて容易になります。現在、Public AIの推論利用は無料で提供されています。

## 重要ポイント
*   **Public AIの統合**: Public AIがHugging Face Inference Providersのエコシステムに加わりました。
*   **公共・主権モデルへのアクセス**: Swiss AI InitiativeやAI Singaporeなどの機関が開発した公共・主権AIモデルへのアクセスが容易になります。
*   **利用方法の柔軟性**: Hugging Face HubのUIから、またはPython/JSのクライアントSDKを通じてシームレスに利用可能です。
*   **非営利プロジェクト**: Public AIは、公共AIモデル開発者を支援する非営利のオープンソースプロジェクトです。
*   **現在の無料提供**: 執筆時点では、Hugging Face経由でのPublic AI Inference Utilityの利用は無料です。

## 詳細レポート
### What happened
Public AIがHugging Face Inference Providersとして正式にサポートされ、Hugging Face HubのモデルページやクライアントSDKから直接利用可能になりました。

### 背景
Hugging Faceは、サーバーレス推論のエコシステムを拡大し、ユーザーが多様なモデルとプロバイダーを利用できるようにしています。Public AIは、公共AIモデル開発者を支援する非営利のオープンソースプロジェクトであり、その分散型インフラは公共・主権モデルへのアクセスを容易にすることを目的としています。この統合により、Hugging Faceユーザーは、より幅広い公共セクターのAIモデルに簡単にアクセスできるようになります。

### 影響
*   **ユーザーへの恩恵**: Hugging Faceユーザーは、Public AIを通じて、Swiss AI InitiativeやAI Singaporeのような機関が提供する公共・主権モデルをHugging Faceプラットフォーム上で直接利用できるようになりました。
*   **エコシステムの強化**: Hugging FaceのInference Providersエコシステムがさらに多様化し、提供されるモデルの幅と機能が向上しました。
*   **利用の簡素化**: ユーザーは、カスタムAPIキーを使用するか、Hugging Face経由で認証することで、容易にPublic AIを利用できます。

### 関係者
*   **Hugging Face**: プラットフォーム提供者、Inference Providersエコシステムの管理者。
*   **Public AI**: 新規Inference Provider、非営利のオープンソースプロジェクト。
*   **Swiss AI Initiative, AI Singapore**: Public AIが支援する公共AIモデル開発機関。
*   **国家・産業パートナー**: Public AIの分散型インフラにGPUコンピューティングリソースを寄付。

### データ
*   **Public AI組織ページ**: https://huggingface.co/publicai
*   **Public AIでサポートされるモデル**: https://huggingface.co/models?inference_provider=publicai&sort=trending
*   **Public AIプラットフォーム情報**: https://platform.publicai.co/
*   **必要なSDKバージョン**: `huggingface_hub` (Python) >= 0.34.6

### 課金方法の概要

| 課金タイプ         | APIキーの利用元    | 請求先             | 料金                                         |
| :----------------- | :----------------- | :----------------- | :------------------------------------------- |
| カスタムキー利用時 | プロバイダーのAPIキー | プロバイダーのアカウント | プロバイダーの標準料金                       |
| HF経由利用時       | Hugging Faceトークン | Hugging Faceアカウント | プロバイダーの標準API料金 (Hugging Face追加料金なし) |
| Public AI利用時    | HF経由またはカスタムキー | 現在無料           | 現在無料 (将来変更の可能性あり)              |

*   Hugging Face PROユーザーは毎月2ドルのInferenceクレジットが付与されます。
*   サインイン済みの無料ユーザーにも小規模なクォータで無料推論が提供されます。

## 引用（Notable quotes）
*   "We're thrilled to share that Public AI is now a supported Inference Provider on the Hugging Face Hub!"
*   "This launch makes it easier than ever to access public and sovereign models from institutions like the Swiss AI Initiative and AI Singapore — right from Hugging Face."
*   "At the time of writing, usage of the Public AI Inference Utility through Hugging Face Inference Providers is free of charge. Pricing and availability may change."

## リスクと課題
*   **料金と提供状況の変更**: Public AIの無料利用は執筆時点のものであり、将来的に価格や提供状況が変更される可能性があります。
*   **長期的な安定性**: Public AIの長期的な安定性は、国家や機関からの貢献に依存しています。

## 今後の見通し/アクション
*   **ユーザーの利用促進**: Hugging Faceは、ユーザーがPublic AIをInference Providerとして活用し、新しいアプリケーションを構築することを期待しています。
*   **フィードバックの募集**: ユーザーからのフィードバックを積極的に募集しており、今後の改善に役立てる方針です。
*   **レベニューシェアの可能性**: 将来的にHugging Faceとプロバイダーパートナーとの間でレベニューシェア契約が確立される可能性があります。
*   **PROプランの推奨**: より高い利用制限や追加機能のために、Hugging Face PROプランへのアップグレードが推奨されています。

## Source URL
https://huggingface.co/blog/inference-providers-publicai
