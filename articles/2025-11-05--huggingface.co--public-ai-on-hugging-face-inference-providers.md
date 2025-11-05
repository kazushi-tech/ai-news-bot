---
title: "Public AI on Hugging Face Inference Providers 🔥"
title_ja: "Public AI、Hugging Face推論プロバイダーに参入"
source_url: "https://huggingface.co/blog/inference-providers-publicai"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、非営利・オープンソースのPublic AIを新たな推論プロバイダーとして追加しました。これにより、Swiss AI InitiativeやAI Singaporeなどの公共AIモデルにHugging Face Hubから直接、簡単にアクセスできるようになります。Public AIの利用は現状無料で、分散型インフラとvLLMを基盤としています。

## 重要ポイント
*   **新プロバイダー追加**: Public AIがHugging Face Inference Providersのエコシステムに加わりました。
*   **公共AIモデルへのアクセス向上**: Swiss AI InitiativeやAI Singaporeなどの公共・主権AIモデルへのアクセスがHugging Face Hubから直接可能になります。
*   **非営利・オープンソース**: Public AI Inference Utilityは非営利のオープンソースプロジェクトであり、公共AIモデル構築者を支援します。
*   **分散型インフラ**: vLLMを搭載したバックエンドと、複数のパートナーにわたる回復力のあるデプロイメント層を組み合わせた分散型インフラで動作します。
*   **現状無料**: Hugging Faceを通じてのPublic AIの利用は、現時点では無料です。
*   **シームレスな統合**: Hugging FaceのウェブUIおよびPython/JSクライアントSDKから簡単に利用できます。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、Public AIを公式の推論プロバイダーとしてHugging Face Hubに統合しました。
*   **背景**: Hugging Faceはサーバーレス推論のエコシステムを拡大しており、Public AIは公共AIモデル構築者（例: Swiss AI Initiative, AI Singapore）を支援する非営利・オープンソースプロジェクトです。この統合により、公共AIモデルへのアクセスが容易になります。
*   **影響**:
    *   ユーザーはHugging Face HubのモデルページやクライアントSDK（Python/JS）からPublic AIを介して公共AIモデルを利用できるようになります。
    *   推論リクエストは、ユーザーがAPIキーを設定しない場合、Hugging Faceを介してルーティングされ、Hugging Faceアカウントに課金されます（Public AIは現状無料）。カスタムキーを使用する場合は、プロバイダーに直接課金されます。
    *   Public AIは、国家および業界パートナーから寄贈されたGPU時間と広告補助金によって無料アクセスをサポートしています。
*   **関係者**:
    *   **Hugging Face**: 推論プロバイダーエコシステムを運営し、Public AIを統合したプラットフォーム。
    *   **Public AI**: 新たな推論プロバイダー。非営利・オープンソースプロジェクトで、公共AIモデル構築者を支援。分散型インフラ（vLLMベース）を運用。
    *   **Swiss AI Initiative, AI Singapore**: Public AIが支援する公共AIモデルの構築機関。
    *   **ユーザー**: Hugging Face Hubを利用する開発者や研究者。
*   **データ**:
    *   Public AI組織ページ: `https://huggingface.co/publicai`
    *   Public AI対応モデル一覧: `https://huggingface.co/models?inference_provider=publicai&sort=trending`
    *   Public AIプラットフォーム情報: `https://platform.publicai.co/`
    *   Python SDK (`huggingface_hub`) 必要バージョン: `>= 0.34.6`
    *   Hugging Face PROユーザー特典: 月$2の推論クレジット。

## 引用（Notable quotes）
*   "We're thrilled to share that Public AI is now a supported Inference Provider on the Hugging Face Hub!"
*   "This launch makes it easier than ever to access public and sovereign models from institutions like the Swiss AI Initiative and AI Singapore — right from Hugging Face."
*   "The Public AI Inference Utility is a nonprofit, open-source project."
*   "At the time of writing, usage of the Public AI Inference Utility through Hugging Face Inference Providers is free of charge."

## リスクと課題
*   **料金と可用性の変更**: Public AIの利用は現状無料ですが、将来的に料金設定や可用性が変更される可能性があります。
*   **長期的な安定性**: Public AIの長期的な安定性は、国家や機関からの貢献に依存しており、その継続性が課題となる可能性があります。

## 今後の見通し/アクション
*   **利用開始**: ユーザーはHugging Face HubのウェブUIまたはPython/JS SDKを通じて、Public AIを推論プロバイダーとして利用を開始できます。
*   **フィードバック**: Hugging Faceは、ユーザーからのフィードバックを積極的に求めています（Hugging Face Spacesのディスカッションページ）。
*   **収益分配の可能性**: 将来的にHugging Faceとプロバイダーパートナー間で収益分配契約が確立される可能性があります。

## Source URL
https://huggingface.co/blog/inference-providers-publicai
