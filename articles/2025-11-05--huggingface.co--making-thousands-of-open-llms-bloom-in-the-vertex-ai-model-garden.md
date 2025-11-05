---
title: "Making thousands of open LLMs bloom in the Vertex AI Model Garden"
title_ja: "Vertex AI Model Garden 数千のオープンLLM簡単デプロイ"
source_url: "https://huggingface.co/blog/google-cloud-model-garden"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceとGoogle Cloudは、Hugging Face Hub上の数千のオープンな基盤モデルをGoogle CloudのVertex AIまたはGoogle Kubernetes Engine (GKE) に簡単にデプロイできる新機能「Deploy on Google Cloud」を発表しました。これにより、開発者はインフラ管理なしで、セキュアなGoogle Cloud環境内で本番対応の生成AIアプリケーションを迅速に構築できるようになります。

## 重要ポイント
*   **戦略的パートナーシップの拡大**: Hugging FaceとGoogle Cloudは、オープンな生成AIモデルへのアクセスとデプロイを簡素化するための戦略的提携を強化しました。
*   **「Deploy on Google Cloud」機能のローンチ**: Hugging Face Hubから、またはGoogle CloudのVertex AI Model Gardenから直接、オープンLLMをVertex AIまたはGKEにデプロイできる新機能が導入されました。
*   **ワンクリックデプロイ**: 人気のあるオープンモデル（例: Zephyr Gemma）は、専用の設定済み構成により、数クリックで本番対応のエンドポイントとしてデプロイ可能です。
*   **インフラ管理不要**: 開発者はインフラやサーバーの管理に煩わされることなく、Google Cloudのセキュアな環境内で生成AIアプリケーションを構築できます。
*   **Text Generation Inference (TGI) サポート**: まずは「text-generation-inference」タグを持つ人気オープンモデルが、Hugging FaceのプロダクションソリューションであるTGIによって推論をサポートします。

## 詳細レポート
### What happened
Hugging FaceとGoogle Cloudは、Hugging Face Hubに「Deploy on Google Cloud」という新機能をローンチしました。これにより、Hugging Face上の数千のオープンな基盤モデルを、Google CloudのVertex AIまたはGoogle Kubernetes Engine (GKE) に簡単にデプロイできるようになります。この機能は、Hugging Faceのモデルカードから直接、またはGoogle CloudのVertex AI Model Garden内から利用可能です。

### 背景
開発者や組織がモデルを安全かつ確実にデプロイするには、時間とリソースがかかるという課題がありました。この課題に対処し、Google Cloudの顧客がオープンな生成AIモデルにアクセスし、デプロイするプロセスを簡素化するため、両社の戦略的パートナーシップが拡大されました。

### 影響
この連携により、開発者はインフラ管理の複雑さから解放され、セキュアなGoogle Cloud環境内で本番対応の生成AIアプリケーションを迅速に構築できるようになります。オープンモデルの利用が促進され、AI開発の民主化に貢献します。

### 関係者
*   **Hugging Face**: オープンな基盤モデルとHugging Face Hubを提供。
*   **Google Cloud**: Vertex AI、Google Kubernetes Engine (GKE)、Vertex AI Model Gardenを提供。
*   **Wenming Ye (Google プロダクトマネージャー)**: 本連携の重要性を強調し、Google開発者によるHugging Faceモデルの活用に期待を表明。

### データ
記事本文に具体的な数値データの記述はありません。

## 引用 (Notable quotes)
「Vertex AIのModel GardenとHugging Face Hubの統合により、HubからでもGoogle Cloud Consoleからでも、Vertex AIとGKEでオープンモデルを発見し、デプロイすることがシームレスになります。Googleの開発者がHugging Faceモデルで何を構築するか、楽しみでなりません。」
— Wenming Ye, Google プロダクトマネージャー

## リスクと課題
記事本文に明示的なリスクや課題の記述はありません。

## 今後の見通し/アクション
Hugging FaceとGoogle Cloudは、AIをよりオープンでアクセスしやすいものにするための協力を継続します。今後もGoogle Cloud上でオープンモデルを使ったAI構築体験をさらに拡充していく予定であり、より多くのモデルや機能の統合が期待されます。

## Source URL
https://huggingface.co/blog/google-cloud-model-garden
