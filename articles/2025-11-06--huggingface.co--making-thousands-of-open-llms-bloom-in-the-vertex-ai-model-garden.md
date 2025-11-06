---
title: "Making thousands of open LLMs bloom in the Vertex AI Model Garden"
title_ja: "Vertex AI Model GardenでオープンLLM数千種を簡単展開"
source_url: "https://huggingface.co/blog/google-cloud-model-garden"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceとGoogle Cloudは連携を強化し、Hugging Face Hub上の数千のオープンな基盤モデルをGoogle Cloud (Vertex AIまたはGoogle Kubernetes Engine) に簡単にデプロイできる新機能「Deploy on Google Cloud」を発表しました。これにより、開発者はインフラ管理なしで、セキュアなGoogle Cloud環境内でプロダクション対応のGenerative AIアプリケーションを構築できるようになります。Vertex AI Model GardenからもHugging Faceモデルを直接検索・デプロイ可能です。

## 重要ポイント
*   **新機能「Deploy on Google Cloud」:** Hugging Face HubからGoogle Cloud (Vertex AI/GKE) へのモデルデプロイを可能にする新機能。
*   **Vertex AI Model Gardenとの統合:** Google CloudのVertex AI Model GardenからHugging Faceモデルを直接検索・デプロイ可能。
*   **数千のオープンLLMをサポート:** Hugging Face上の人気オープンモデルが対象。
*   **簡単なデプロイ:** Vertex AIへの1クリックデプロイ（Zephyr Gemmaなどの例）。
*   **インフラ管理不要:** 開発者はセキュアなGoogle Cloud環境でインフラ管理なしにGenerative AIアプリを構築可能。
*   **Text Generation Inference (TGI) による推論:** 人気のオープンモデルの推論をTGIでサポート。
*   **戦略的パートナーシップの拡大:** 今年発表されたHugging FaceとGoogle Cloudのパートナーシップをさらに強化。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened:** Hugging Faceは、Google Cloudとの連携を強化し、Hugging Face Hubに「Deploy on Google Cloud」という新機能を導入しました。これにより、Hugging Face上の数千の基盤モデルをGoogle CloudのVertex AIまたはGoogle Kubernetes Engine (GKE) に簡単にデプロイできるようになりました。同時に、Google CloudのVertex AI Model GardenからもHugging Faceモデルを直接検索・デプロイできる新しい体験が提供されます。
*   **背景:** 開発者や組織がオープンモデルを安全かつ確実にデプロイするには、多大な時間とリソースが必要でした。Hugging FaceとGoogle Cloudは、今年初めに発表した戦略的パートナーシップを拡大し、この課題を解決し、オープンなGenerative AIモデルへのアクセスとデプロイを簡素化することを目指しました。
*   **影響:**
    *   開発者は、インフラやサーバーの管理に煩わされることなく、セキュアなGoogle Cloud環境内でプロダクション対応のGenerative AIアプリケーションを迅速に構築できるようになります。
    *   Hugging Face HubまたはGoogle Cloudコンソールのどちらからでも、オープンモデルのデプロイが大幅に簡素化されます。
    *   「text-generation-inference」タグを持つHugging Face上の人気オープンモデルは、Hugging FaceのプロダクションソリューションであるText Generation Inference (TGI) を利用した推論でサポートされます。
    *   Vertex AIでは1クリックでモデルをデプロイでき、GKEではマニフェストテンプレートを利用してデプロイが可能です。
*   **関係者:** Hugging Face、Google Cloud (Vertex AI、Google Kubernetes Engine)、Wenming Ye (Google Product Manager)。
*   **データ:** 数千のオープンLLMがデプロイ対象。Vertex Model Gardenでは数百の人気オープンLLMが、すぐに使える検証済みのハードウェア構成と共に利用可能。

## 引用（Notable quotes）
*   **Wenming Ye氏（Google Product Manager）:** 「Vertex AIのModel GardenとHugging Face Hubの統合により、HubからでもGoogle Cloud Consoleからでも、Vertex AIとGKEにオープンモデルをシームレスに発見しデプロイできるようになります。Googleの開発者がHugging Faceモデルで何を構築するか、楽しみにしています。」

## リスクと課題
*   **ゲート付きモデルのアクセス:** ゲート付きモデルをデプロイする際には、Hugging Faceアクセストークンの提供が必要となります。
*   **GKEデプロイの複雑さ:** Vertex AIへのデプロイは1クリックですが、GKEへのデプロイは指示とマニフェストテンプレートに従う必要があり、Vertex AIよりも手順が多い可能性があります。
*   **初期サポートモデルの限定:** 現時点では「text-generation-inference」タグを持つモデルが主にサポート対象であり、他の種類のモデルへの対応は今後の展開に期待されます。

## 今後の見通し/アクション
Hugging FaceとGoogle Cloudは、AIをよりオープンでアクセスしやすいものにするための協業を継続するとしています。今後は、Google Cloud上でオープンモデルを活用したAI構築体験をさらに拡大していく予定です。

## Source URL
https://huggingface.co/blog/google-cloud-model-garden
