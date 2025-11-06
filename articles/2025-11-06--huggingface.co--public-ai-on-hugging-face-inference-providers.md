---
title: "Public AI on Hugging Face Inference Providers 🔥"
title_ja: "Public AI、Hugging Face推論プロバイダーに参入 公共AI活用強化"
source_url: "https://huggingface.co/blog/inference-providers-publicai"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Public AIを新たなInference Providerとして統合しました。これにより、ユーザーはHugging Face Hubから直接、Swiss AI InitiativeやAI Singaporeなどの公共・主権AIモデルに簡単にアクセスできるようになります。Public AIは非営利のオープンソースプロジェクトであり、分散型インフラ上で現在無料で推論サービスを提供しています。

## 重要ポイント
*   **Public AIのHugging Face統合**: Hugging Face HubにPublic AIが新たなInference Providerとして加わり、サーバーレス推論のエコシステムが拡大しました。
*   **公共モデルへのアクセス向上**: Swiss AI InitiativeやAI Singaporeといった機関の公共・主権AIモデルへのアクセスが、Hugging Faceプラットフォームから直接容易になりました。
*   **非営利・オープンソース**: Public AIは非営利のオープンソースプロジェクトであり、公共AIモデル開発者を支援しています。
*   **分散型インフラ**: vLLMを搭載したバックエンドと、国家・産業パートナーからの寄付されたGPUクラスターを活用した分散型インフラで動作し、グローバルなロードバランシングにより効率的なルーティングを実現します。
*   **無料提供**: 現時点では、Hugging Face経由でのPublic AIの利用は無料です。長期的な安定性は国家・機関からの貢献に依存しています。
*   **シームレスな利用**: Hugging FaceのウェブUIおよびPython/JSクライアントSDKから、Public AIの推論サービスを簡単に利用できます。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、Public AIを公式なInference ProviderとしてHugging Face Hubに統合しました。これにより、ユーザーはHugging Faceのモデルページから直接、またはクライアントSDKを通じてPublic AIの推論サービスを利用できるようになりました。
*   **背景**: Hugging Faceは、サーバーレス推論の能力と多様性を高めるため、Inference Providerのエコシステムを拡大しています。Public AIの追加は、特に公共および主権AIモデルへのアクセスを容易にし、非営利のオープンソースプロジェクトを支援するというHugging Faceの目標と合致しています。
*   **影響**:
    *   **ユーザー**: Hugging Faceユーザーは、公共AIモデル（例: Swiss AIのApertus-70B）を、Hugging FaceのUIまたはPython/JS SDKから容易に利用できるようになります。
    *   **公共AIモデル**: Swiss AI InitiativeやAI Singaporeといった機関が開発したモデルの利用が促進されます。
    *   **エコシステム**: Hugging FaceのInference Providerエコシステムが強化され、多様な選択肢が提供されます。
*   **関係者**:
    *   **Hugging Face**: プラットフォーム提供者、Inference Providerエコシステムの管理者。
    *   **Public AI**: 新たなInference Provider、非営利・オープンソースプロジェクト運営者。公共AIモデル開発者を支援。
    *   **Swiss AI Initiative, AI Singapore**: Public AIがサポートする公共AIモデル開発機関。
    *   **国家・産業パートナー**: Public AIにGPU時間やインフラを寄付し、無料アクセスを支援。
*   **データ**:
    *   **利用方法**:
        *   **ウェブUI**: ユーザーアカウント設定でAPIキーを設定し、プロバイダーの優先順位を設定可能。モデルページに互換性のあるプロバイダーが表示されます。
        *   **クライアントSDKs (Python/JS)**: `huggingface_hub` (Python) および `@huggingface/inference` (JS) ライブラリを使用し、`provider="publicai"`を指定して推論を実行。Hugging FaceトークンまたはPublic AI自身のAPIキーを使用可能です。
    *   **課金モデル**:
        | 項目           | カスタムキー使用時 (直接リクエスト) | Hugging Face経由時 (ルーティングリクエスト) |
        | :------------- | :---------------------------------- | :------------------------------------------ |
        | APIキー        | プロバイダー自身のAPIキー           | Hugging Faceトークン                        |
        | 課金元         | プロバイダーのアカウント            | Hugging Faceアカウント                      |
        | 料金           | プロバイダーの標準料金              | プロバイダーの標準料金 (HFによる追加マークアップなし) |
        | Public AIの場合 | 現在無料                            | 現在無料                                    |
        | PROユーザー特典 | $2相当のInferenceクレジットを毎月付与 | $2相当のInferenceクレジットを毎月付与       |
        *   **無料アクセス**: Public AIの利用は現時点では無料です。Hugging FaceのPROユーザーは毎月$2相当のInferenceクレジットが付与され、無料ユーザーにも小規模なクォータが提供されます。

## 引用（Notable quotes）
*   "We're thrilled to share that Public AI is now a supported Inference Provider on the Hugging Face Hub!" (Public AIがHugging Face HubでサポートされるInference Providerになったことを発表でき、大変嬉しく思います！)
*   "This launch makes it easier than ever to access public and sovereign models from institutions like the Swiss AI Initiative and AI Singapore — right from Hugging Face." (このローンチにより、Swiss AI InitiativeやAI Singaporeのような機関の公共・主権モデルに、Hugging Faceからこれまで以上に簡単にアクセスできるようになります。)
*   "The Public AI Inference Utility is a nonprofit, open-source project." (Public AI Inference Utilityは非営利のオープンソースプロジェクトです。)
*   "At the time of writing, usage of the Public AI Inference Utility through Hugging Face Inference Providers is free of charge. Pricing and availability may change." (本稿執筆時点では、Hugging Face Inference Providersを介したPublic AI Inference Utilityの利用は無料です。料金と提供状況は変更される可能性があります。)

## リスクと課題
*   **料金と提供状況の変更**: 現在無料であるPublic AIの利用料金や提供状況は、将来的に変更される可能性があります。
*   **長期安定性の依存**: Public AIの長期的な安定性は、国家や機関からの貢献（GPU時間、資金など）に依存しています。
*   **フィードバックの必要性**: 新しいプロバイダーの機能改善には、ユーザーからの積極的なフィードバックが不可欠です。

## 今後の見通し/アクション
*   **利用促進**: Hugging Faceは、ユーザーがPublic AIを活用して新たなアプリケーションを構築することを期待しています。
*   **フィードバックの収集**: ユーザーからのフィードバックをHugging Face Spacesのディスカッションページで積極的に募集しています。
*   **PROプランの推奨**: Inferenceクレジット、ZeroGPU、Spaces Dev Modeなどの特典があるHugging Face PROプランへのアップグレードを推奨しています。
*   **収益分配の可能性**: 将来的にHugging Faceとプロバイダーパートナー間で収益分配契約を確立する可能性を示唆しています。

## Source URL
https://huggingface.co/blog/inference-providers-publicai
