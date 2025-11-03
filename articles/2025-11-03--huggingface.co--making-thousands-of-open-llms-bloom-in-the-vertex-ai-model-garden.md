---
title: "Making thousands of open LLMs bloom in the Vertex AI Model Garden"
title_ja: "Vertex AI Model Gardenで数千のオープンLLMが本格展開"
source_url: "https://huggingface.co/blog/google-cloud-model-garden"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceとGoogle Cloudは、「Deploy on Google Cloud」を発表しました。これにより、Hugging Face Hub上の数千のオープンな大規模言語モデル（LLM）を、Google CloudのVertex AIまたはGoogle Kubernetes Engine（GKE）に簡単にデプロイできるようになります。開発者はインフラ管理の負担なく、セキュアなGoogle Cloud環境内で本番環境対応の生成AIアプリケーションを構築できます。

## 重要ポイント
*   **新機能「Deploy on Google Cloud」:** Hugging Face HubとGoogle Cloudの新たな統合により、オープンLLMのデプロイを簡素化。
*   **対象モデル:** Hugging Face Hub上の数千のオープンLLM、特に「text-generation-inference」タグ付きの人気モデル。
*   **デプロイ先:** Google CloudのVertex AIまたはGKE。
*   **デプロイ方法:** Hugging Faceのモデルカードから直接、またはGoogle CloudのVertex AI Model Gardenから1クリックでデプロイ可能。
*   **メリット:** インフラ管理不要、セキュアなGoogle Cloud環境での本番利用、開発時間の短縮。
*   **背景:** 開発者や組織がモデルを安全かつ信頼性高くデプロイする際の課題（時間とリソース）を解決。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging FaceとGoogle Cloudは、オープンな生成AIモデルのデプロイを劇的に簡素化する新機能「Deploy on Google Cloud」を発表しました。この統合により、Hugging Face Hubにホストされている数千ものオープンLLMを、Google CloudのVertex AIまたはGKEに直接、かつ容易にデプロイできるようになります。特に、Hugging FaceのプロダクションソリューションであるText Generation Inferenceを搭載した人気モデルが対象となります。

**背景:**
この発表は、今年初めに発表された両社の戦略的パートナーシップを拡大するものです。開発者や組織が直面する主要な課題の一つは、モデルを安全かつ信頼性高くデプロイするために必要な時間とリソースでした。「Deploy on Google Cloud」は、これらの課題に対する管理された簡単なソリューションを提供し、専用の設定とアセットをHugging Faceモデルに提供します。

**影響:**
*   **開発者:** インフラ管理の複雑さから解放され、セキュアなGoogle Cloud環境内で直接、本番対応の生成AIアプリケーションを迅速に構築できるようになります。
*   **オープンAIエコシステム:** オープンモデルの利用と普及が加速し、AI開発の民主化に貢献します。
*   **Vertex AI Model Garden:** Google CloudのModel Gardenが、Googleおよびパートナーモデルに加え、Hugging Faceの最も人気のあるオープンLLMを簡単に発見・デプロイできる中心的なハブとしての機能を強化します。

**関係者:**
*   **Hugging Face:** オープンモデルのハブとデプロイソリューションを提供。
*   **Google Cloud:** Vertex AIおよびGKEを通じて、モデルのデプロイ環境とインフラを提供。
*   **開発者:** Hugging Faceモデルを利用して生成AIアプリケーションを構築するユーザー。

**データ:**
*   **対象モデル数:** 数千のオープンLLM。
*   **主要なサポートモデル:** 「text-generation-inference」タグが付いたモデル（例: Zephyr Gemma）。
*   **デプロイ方法:** Hugging Face Hubのモデルカードから「Deploy」メニューを選択し「Google Cloud」を選ぶか、Vertex AI Model Garden内の「Deploy From Hugging Face」オプションを利用。いずれも数クリックでデプロイが完了します。

## 引用（Notable quotes）
「Vertex AIのModel GardenとHugging Face Hubの統合により、HubからでもGoogle Cloud Consoleからでも、Vertex AIとGKEでオープンモデルを発見しデプロイすることがシームレスになります。Googleの開発者がHugging Faceモデルで何を構築するか、楽しみにしています。」
— Wenming Ye, Google Product Manager

## リスクと課題
*   **ゲート付きモデルの管理:** ゲート付きモデルを使用する場合、Hugging Faceアクセストークンの提供と管理が必要です。
*   **コスト管理:** インフラ管理は不要になりますが、Vertex AIやGKEのリソース利用に伴うコストは発生するため、適切な監視と管理が必要です。
*   **モデル選定の複雑さ:** 数千ものモデルの中から最適なものを選択する際に、依然として一定の知識と評価が必要となる可能性があります（ただし、人気モデルに絞ることで一部緩和）。

## 今後の見通し/アクション
Hugging FaceとGoogle Cloudは、AIをよりオープンでアクセスしやすいものにするための協力を継続します。今後も、Google Cloud上でオープンモデルを活用したAI構築体験をさらに拡大し、より多くの機能とモデルのサポートを追加していく予定です。開発者はこの新しい統合を活用し、生成AIプロジェクトを加速することが期待されます。

## Source URL
https://huggingface.co/blog/google-cloud-model-garden
