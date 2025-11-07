---
title: "Public AI on Hugging Face Inference Providers \U0001F525"
title_ja: Public AIがHugging Face推論プロバイダーに 公共モデルアクセス容易に
source_url: 'https://huggingface.co/blog/inference-providers-publicai'
date: '2025-11-04'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - Hugging Faceは、非営利のオープンソースプロジェクトであるPublic AIを新たなInference
    Providerとして統合しました。これにより、Swiss AI InitiativeやAI Singaporeといった機関が
  - '- ## 重要ポイント'
  - >-
    - *   **Public AIの統合**: Hugging Face HubにPublic AIが新たなInference
    Providerとして加わりました。
  - >-
    - *   **公共AIモデルへのアクセス向上**: Swiss AI InitiativeやAI
    Singaporeなどの公共AIモデル開発者を支援し、それらのモデルへのアクセスを簡素化します。
  - >-
    - *   **シームレスな利用**: Hugging FaceのウェブUIおよびPython/JSクライアントSDKから、Public
    AIを介したモデル推論を容易に実行できます。
---
## 概要 (TL;DR)
Hugging Faceは、非営利のオープンソースプロジェクトであるPublic AIを新たなInference Providerとして統合しました。これにより、Swiss AI InitiativeやAI Singaporeといった機関が開発する公共および主権AIモデルへのアクセスが、Hugging Face HubのモデルページやクライアントSDKから直接、かつ容易になります。Public AIの利用は現時点では無料です。

## 重要ポイント
*   **Public AIの統合**: Hugging Face HubにPublic AIが新たなInference Providerとして加わりました。
*   **公共AIモデルへのアクセス向上**: Swiss AI InitiativeやAI Singaporeなどの公共AIモデル開発者を支援し、それらのモデルへのアクセスを簡素化します。
*   **シームレスな利用**: Hugging FaceのウェブUIおよびPython/JSクライアントSDKから、Public AIを介したモデル推論を容易に実行できます。
*   **非営利・分散型インフラ**: Public AIは非営利のオープンソースプロジェクトであり、vLLMバックエンドと分散型インフラ（寄付されたGPU時間で運営）を特徴とします。
*   **現時点での無料提供**: Public AI Inference Utilityの利用は、Hugging Face経由でも現時点では無料です。

## 詳細レポート
### What happened
Hugging Faceは、Public AIを公式なInference ProviderとしてHugging Face Hubに統合したことを発表しました。これにより、ユーザーはHugging Faceのプラットフォーム上でPublic AIが提供するモデルにアクセスし、推論を実行できるようになります。

### 背景
Public AIは、Swiss AI InitiativeやAI Singaporeのような公共AIモデル開発者を支援する非営利のオープンソースプロジェクトです。彼らの目的は、公共および主権AIモデルへのアクセスを民主化することにあります。Hugging Faceは、このPublic AIをInference Providerエコシステムに加えることで、ユーザーが多様なモデル、特に公共セクターで開発されたモデルをより簡単に利用できる環境を提供します。

### 影響
*   **ユーザー利便性の向上**: Hugging Face Hubのモデルページや、Python/JSのクライアントSDKから、Public AIを介したモデル推論が直接可能になります。
*   **公共AIモデルの普及促進**: 公共機関が開発したAIモデルがHugging Faceの広範なユーザーベースに届きやすくなり、その利用と貢献が促進されます。
*   **柔軟な課金オプション**: ユーザーは自身のPublic AI APIキーを使用するか、Hugging Face経由で課金（現時点ではPublic AIは無料）を選択できます。

### 関係者
*   **Hugging Face**: プラットフォーム提供者、Inference Providerエコシステムの管理者。
*   **Public AI**: 新たなInference Provider、非営利のオープンソースプロジェクト。
*   **Swiss AI Initiative**: Public AIが支援する公共AIモデル開発機関。
*   **AI Singapore**: Public AIが支援する公共AIモデル開発機関。
*   **国家・産業パートナー**: Public AIの分散型インフラにGPU時間などを寄付している。

### データ
*   **Public AI組織ページ**: `https://huggingface.co/publicai`
*   **Public AI対応モデル**: `https://huggingface.co/models?inference_provider=publicai&sort=trending`
*   **Public AIプラットフォーム情報**: `https://platform.publicai.co/`
*   **必要なSDKバージョン**: `huggingface_hub (>= 0.34.6)`
*   **課金**: Public AI Inference Utilityの利用は現時点では無料。Hugging Face PROユーザーは月額$2相当のInferenceクレジットが付与されます。

### 課金方法の概要

| 項目           | カスタムキー利用時 (直接請求)        | HF経由利用時 (HFアカウントに請求) |
| :------------- | :--------------------------------- | :-------------------------------- |
| APIキー        | プロバイダーのAPIキーを使用          | Hugging Faceトークンを使用          |
| 請求元         | 各プロバイダー                     | Hugging Face                      |
| 料金           | 各プロバイダーの料金               | 各プロバイダーの標準API料金 (HF追加料金なし) |
| Public AIの場合 | 現時点では無料                     | 現時点では無料                     |

### Hugging Face PROプラン特典

| 特典                 | 内容                                     |
| :------------------- | :--------------------------------------- |
| Inferenceクレジット  | 月額$2相当                               |
| ZeroGPU              | 利用可能                                 |
| Spaces Dev Mode      | 利用可能                                 |
| 制限の緩和           | 20倍の制限緩和                           |
| その他               | (記事に記載なし)                         |

## 引用 (Notable quotes)
「We're thrilled to share that Public AI is now a supported Inference Provider on the Hugging Face Hub!」（Hugging Face HubでPublic AIがサポートされるInference Providerになったことを共有できることを大変嬉しく思います！）

## リスクと課題
*   **料金変更の可能性**: Public AIの無料提供は「現時点」のものであり、将来的に料金や提供状況が変更される可能性があります。
*   **長期的な安定性**: Public AIの長期的な安定性は、国家や機関からの貢献に依存するとされています。
*   **Hugging Faceの課金モデルの変更**: 将来的にHugging Faceがプロバイダーとのレベニューシェア契約を確立する可能性が示唆されており、課金モデルが変更される可能性があります。

## 今後の見通し/アクション
Hugging Faceは、Public AIの新たなInference Providerとしての利用について、ユーザーからのフィードバックを積極的に求めています。ユーザーは、Hugging Face Spacesのディスカッションページを通じて意見を共有できます。Hugging Faceは、この新しいプロバイダーを通じてユーザーがどのようなものを構築するかを楽しみにしています。

## Source URL
https://huggingface.co/blog/inference-providers-publicai
