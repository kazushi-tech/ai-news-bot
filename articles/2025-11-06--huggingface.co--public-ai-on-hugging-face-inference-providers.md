---
title: "Public AI on Hugging Face Inference Providers 🔥"
title_ja: "Hugging FaceでPublic AIが推論プロバイダーに！"
source_url: "https://huggingface.co/blog/inference-providers-publicai"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Public AIを新たなInference ProviderとしてHugging Face Hubに統合しました。これにより、スイスAIイニシアチブやAIシンガポールなどの公共機関が開発したオープンソースモデルへのアクセスが容易になります。Public AIは非営利プロジェクトで、分散型インフラ上で動作し、現在はHugging Face経由での利用が無料です。

## 重要ポイント
*   **新規プロバイダー追加**: Public AIがHugging Face HubのInference Providerエコシステムに加わりました。
*   **公共モデルへのアクセス**: スイスAIイニシアチブやAIシンガポールといった公共・主権モデルへのアクセスがHugging Faceから直接可能になります。
*   **非営利・オープンソース**: Public AIは非営利のオープンソースプロジェクトであり、公共AIモデル開発者を支援しています。
*   **分散インフラ**: vLLMベースのバックエンドとレジリエントなデプロイメント層を組み合わせた分散インフラ上で動作します。
*   **無料提供**: 現在、Hugging Face Inference Providers経由でのPublic AIの利用は無料です（将来変更の可能性あり）。
*   **シームレスな統合**: Hugging FaceのウェブUIおよびクライアントSDKs（Python/JS）から簡単に利用できます。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、Public AIを公式なInference ProviderとしてHugging Face Hubに統合しました。これにより、ユーザーはHugging Faceプラットフォーム上でPublic AIを利用してモデル推論を実行できるようになりました。
*   **背景**: Hugging Faceは、サーバーレス推論の選択肢と能力を拡充するため、Inference Providerエコシステムを拡大しています。Public AIの統合は、特に公共機関が開発したオープンソースモデルの利用を促進し、そのアクセシビリティを高めることを目的としています。
*   **影響**:
    *   **ユーザー**: Hugging FaceのモデルページやクライアントSDKsから、Public AIを介して公共AIモデルにアクセスできるようになりました。APIキーの設定やプロバイダーの優先順位付けが可能です。
    *   **公共AIモデル**: スイスAIイニシアチブやAIシンガポールなどのモデルが、より広範なユーザーベースに利用される機会が増加します。
    *   **Public AI**: Hugging Faceという大規模なプラットフォームを通じて、その非営利の使命と分散インフラを活用したサービスを提供できるようになります。
*   **関係者**:
    *   **Hugging Face**: プラットフォーム提供者、Inference Providerエコシステムの管理者。
    *   **Public AI**: 新規Inference Provider、非営利オープンソースプロジェクト、分散インフラの運用者。
    *   **Swiss AI Initiative, AI Singapore**: Public AIが支援する公共AIモデル開発機関。
    *   **国家・産業パートナー**: Public AIにGPU時間やインフラを寄付し、無料アクセスを支援。
*   **データ**:
    *   Public AIのHugging Face組織ページ: `https://huggingface.co/publicai`
    *   Public AI対応のトレンドモデルリスト: `https://huggingface.co/models?inference_provider=publicai&sort=trending`
    *   Public AIプラットフォームの詳細: `https://platform.publicai.co/`
    *   Hugging Face SDK (`huggingface_hub`) 必要バージョン: `>= 0.34.6`
    *   **請求モデル**:
        | 請求モード | APIキー | 課金元 | 備考 |
        | :--------- | :------ | :----- | :--- |
        | カスタムキー | プロバイダーのキー | プロバイダー | Public AIの場合はPublic AIアカウント |
        | HF経由 | Hugging Faceのキー | Hugging Face | プロバイダーのAPIレートをパススルー。HF PROユーザーはクレジット利用可。 |
        *注: Public AIは現在Hugging Face経由で無料。*

## 引用（Notable quotes）
*   "We're thrilled to share that Public AI is now a supported Inference Provider on the Hugging Face Hub!"
*   "This launch makes it easier than ever to access public and sovereign models from institutions like the Swiss AI Initiative and AI Singapore — right from Hugging Face."
*   "The Public AI Inference Utility is a nonprofit, open-source project."
*   "At the time of writing, usage of the Public AI Inference Utility through Hugging Face Inference Providers is free of charge."

## リスクと課題
*   **持続可能性**: Public AIの無料アクセスは寄付されたGPU時間と広告補助に依存しており、長期的な安定性は国家・機関からの貢献に錨を下ろす計画です。これらの貢献が不足した場合、サービス提供の継続性に影響が出る可能性があります。
*   **料金体系の変更**: 現在は無料ですが、「Pricing and availability may change」と明記されており、将来的に有料化される可能性があります。
*   **分散インフラの複雑性**: グローバルなロードバランシングと分散インフラは効率性を高める一方で、潜在的なレイテンシや信頼性の課題を伴う可能性があります。
*   **Hugging Faceの課金モデル**: 他のプロバイダーではプロバイダーのAPIレートをパススルーする形ですが、将来的にHugging Faceとプロバイダー間でレベニューシェア契約が確立される可能性があり、その際のユーザーへの影響は不明です。

## 今後の見通し/アクション
*   **Hugging Faceユーザー**:
    *   Hugging Face HubのUIまたはPython/JS SDKsからPublic AIをInference Providerとして利用を開始できます。
    *   アカウント設定でAPIキーの管理やプロバイダーの優先順位設定が可能です。
    *   現時点では無料で利用できますが、将来的な料金変更に注意が必要です。
    *   Hugging Face PROユーザーは毎月$2のInferenceクレジットをPublic AIを含むプロバイダーで利用可能です。
*   **Public AI**:
    *   公共AIモデル開発者への支援を継続し、分散インフラの安定的な運用を目指します。
    *   長期的な安定性のために、国家・機関からの貢献を確保していくことが重要です。
*   **Hugging Face**:
    *   Inference Providerエコシステムのさらなる拡大と、より多くのモデルやプロバイダーの統合を進めるでしょう。
    *   ユーザーからのフィードバックを収集し、サービスの改善に役立てます (`https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49`)。

## Source URL
https://huggingface.co/blog/inference-providers-publicai
