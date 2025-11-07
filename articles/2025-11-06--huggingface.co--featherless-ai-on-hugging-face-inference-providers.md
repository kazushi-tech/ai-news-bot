---
title: "Featherless AI on Hugging Face Inference Providers \U0001F525"
title_ja: Hugging Face推論プロバイダーにFeatherless AI参入 サーバーレスAI強化
source_url: 'https://huggingface.co/blog/inference-providers-featherless'
date: '2025-11-06'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - Hugging Faceは、Featherless AIを新たなInference ProviderとしてHugging Face
    Hubに統合しました。これにより、ユーザーはサーバーレス価格でDeepSeek、Meta、Googleなどの
  - '- ## 重要ポイント'
  - >-
    - *   **Featherless AIの統合**: Featherless AIがHugging Face HubのInference
    Providerエコシステムに加わりました。
  - >-
    - *   **広範なモデルサポート**:
    DeepSeek、Meta、Google、Qwenなど、最新のオープンソースモデルを含む多様なテキストおよび会話モデルをサポートします。
  - '- *   **サーバーレス価格と広範なモデル**: サーバー管理なしで、比類ないモデル範囲と多様性をサーバーレス価格で提供します。'
---
## 概要 (TL;DR)
Hugging Faceは、Featherless AIを新たなInference ProviderとしてHugging Face Hubに統合しました。これにより、ユーザーはサーバーレス価格でDeepSeek、Meta、Googleなどの広範なAIモデルにアクセスできるようになり、Hugging FaceのUIやクライアントSDKsを通じて簡単に利用できます。

## 重要ポイント
*   **Featherless AIの統合**: Featherless AIがHugging Face HubのInference Providerエコシステムに加わりました。
*   **広範なモデルサポート**: DeepSeek、Meta、Google、Qwenなど、最新のオープンソースモデルを含む多様なテキストおよび会話モデルをサポートします。
*   **サーバーレス価格と広範なモデル**: サーバー管理なしで、比類ないモデル範囲と多様性をサーバーレス価格で提供します。
*   **シームレスな利用**: Hugging FaceのウェブUIおよびPython/JSクライアントSDKsから直接利用可能です。
*   **柔軟な課金**: ユーザーはFeatherless AIのカスタムAPIキーを使用するか、Hugging Face経由でルーティングし、Hugging Faceアカウントに請求されるかを選択できます（HF経由の場合、追加マークアップなし）。
*   **PROユーザー特典**: Hugging Face PROユーザーは、毎月2ドルのInferenceクレジットを受け取れます。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、サーバーレスAI推論プロバイダーであるFeatherless AIを、Hugging Face Hubの公式Inference Providerとして追加したことを発表しました。これにより、ユーザーはHubのモデルページやクライアントSDKsを通じて、Featherless AIが提供する広範なAIモデルに直接アクセスし、推論を実行できるようになります。

### 背景
従来の推論プロバイダーは、限られたモデルセットを低コストで提供するか、あるいは無制限のモデル範囲を提供するものの、ユーザーがサーバー管理と運用コストを負担するというトレードオフがありました。Featherless AIは、独自のモデルロードとGPUオーケストレーション能力により、この両者の利点を組み合わせ、サーバーレス価格で比類ないモデル範囲と多様性を提供します。Hugging Faceは、このFeatherless AIの統合により、ユーザーがより多くのモデルに簡単にアクセスし、推論を効率的に実行できる環境を提供することを目指しています。

### 影響
*   **ユーザーへの影響**:
    *   DeepSeek、Meta、Google、Qwenなど、最新のオープンソースモデルを含む非常に広範なテキストおよび会話モデルに、サーバー管理なしでアクセスできるようになります。
    *   Hugging FaceのウェブUIやPython/JS SDKから簡単に推論を実行でき、開発プロセスが簡素化されます。
    *   課金方法の選択肢が増え、自身のニーズに合った方法でサービスを利用できます。
    *   Hugging Face PROユーザーは、毎月Inferenceクレジットを利用してコストを削減できます。
*   **Hugging Faceエコシステムへの影響**:
    *   Hugging Face Hubのエコシステムがさらに強化され、利用可能な推論オプションの幅が広がります。
    *   より多くの開発者や企業がHugging Faceプラットフォーム上でAIモデルを活用できるようになります。

### 関係者
*   **Hugging Face**: プラットフォーム提供者、Featherless AIをInference Providerとして統合。
*   **Featherless AI**: 新たなInference Provider、サーバーレスAI推論サービスを提供。
*   **DeepSeek, Meta, Google, Qwen**: Featherless AIがサポートするモデルの提供元。

### データ
*   **サポートモデル**: DeepSeek、Meta、Google、Qwenなど、多岐にわたるテキストおよび会話モデル。
*   **SDKバージョン**: `huggingface_hub` v0.33.0以上（Python）。
*   **PROユーザー特典**: 月額2ドルのInferenceクレジット。

## 引用（Notable quotes）
*   "Featherless provides the best of both worlds offering unmatched model range and variety but with serverless pricing."
    （Featherlessは、比類ないモデル範囲と多様性をサーバーレス価格で提供し、両方の世界の最高の部分を提供します。）
*   "There's no additional markup from us, we just pass through the provider costs directly."
    （私たちからの追加マークアップはなく、プロバイダーのコストを直接通過させるだけです。）

## リスクと課題
記事中には直接的なリスクや課題の言及は少ないですが、以下の点が考えられます。
*   **課金体系の理解**: カスタムキー利用時とHugging Face経由ルーティング時の課金方法の違いをユーザーが正確に理解する必要があります。
*   **プロバイダー依存**: Featherless AIのサービス品質や料金体系の変更が、Hugging Faceユーザーに影響を与える可能性があります。
*   **将来的な収益分配**: 将来的にHugging Faceがプロバイダーパートナーとの収益分配契約を確立する可能性が示唆されており、これが料金体系に影響を与える可能性があります。

## 今後の見通し/アクション
*   **ユーザーの利用促進**: Hugging Faceは、この新しいプロバイダーを活用してユーザーが何を構築するかを楽しみにしています。
*   **フィードバックの募集**: ユーザーからのフィードバックをHugging Face Spacesの専用ディスカッションページ（https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49）で募集しています。
*   **PROプランの推奨**: 月額Inferenceクレジットやその他の特典を利用するために、Hugging Face PROプランへのアップグレードが推奨されています。
*   **詳細ドキュメント**: Featherless AIの利用方法に関する詳細なドキュメントページが提供されており、ユーザーはそこで具体的な手順を確認できます。

## Source URL
https://huggingface.co/blog/inference-providers-featherless
