---
title: "Welcome Llama 3 - Meta's new open LLM"
title_ja: "Meta、新作オープンLLM「Llama 3」を公開"
source_url: "https://huggingface.co/blog/llama3"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
MetaはオープンアクセスLLMの次世代版「Llama 3」をリリースし、Hugging Faceエコシステムに完全に統合されました。Llama 3は8Bと70Bの2つのモデルサイズで提供され、それぞれベースモデルとインストラクションチューニング版があります。また、安全性モデルのLlama Guard 2も同時に公開されました。新しいトークナイザーと大規模なトレーニングデータにより性能が向上し、Hugging Face Hub、Transformers、Hugging Chat、主要クラウドプロバイダーを通じて、開発者はLlama 3を容易に利用、デプロイ、ファインチューニングできます。

## 重要ポイント
*   **Llama 3のリリースとHugging Faceでの全面サポート**: MetaのオープンAIへのコミットメントを継続し、Hugging Faceエコシステムに完全に統合。
*   **モデルバリエーション**: 8Bと70Bの2つのモデルサイズで、それぞれベース（事前学習済み）とインストラクションチューニング版を提供。
*   **安全性強化**: Llama 3 8Bをベースとした安全性モデル「Llama Guard 2」もリリースされ、LLMの入出力における安全でないコンテンツを検出。
*   **技術的進化**: 語彙サイズを大幅に拡張した新しいトークナイザー（128,256語彙）により、効率的なテキストエンコードと多言語対応の可能性が向上。8BモデルにはGrouped-Query Attention (GQA) を採用。
*   **大規模トレーニング**: Llama 2の約8倍にあたる15兆トークン以上でトレーニングされ、Llama 3 Instructは1000万以上の人間アノテーションデータで最適化。
*   **広範なエコシステム統合**: Hugging Face Transformers、Inference Endpoints、Hugging Chat、Google Cloud (Vertex AI/GKE)、Amazon SageMakerなど、多様なプラットフォームでの利用とデプロイをサポート。
*   **ライセンスの変更**: 許容的なライセンスだが、派生モデルやサービスにおいて「Llama 3」の明示的な帰属表示義務が追加。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Metaは、オープンアクセスLLMの最新世代である「Llama 3」を発表し、Hugging Faceがその全面的なエコシステム統合をサポートすることを発表しました。Llama 3は、効率的なデプロイと開発向けの8Bモデル、および大規模AIネイティブアプリケーション向けの70Bモデルの2つのサイズで提供され、それぞれにベースモデルとインストラクションチューニング版があります。さらに、Llama 3 8Bを基盤とした安全性モデル「Llama Guard 2」もリリースされました。

### 背景
MetaはオープンAIへの継続的なコミットメントを示しており、Llama 3はその最新の成果です。Hugging FaceはMetaと緊密に連携し、Llama 3モデルをHugging Face Hub、Transformersライブラリ、Hugging Chat、および主要なクラウドプロバイダー（Google Cloud、Amazon SageMaker）の推論サービスに完全に統合しました。これにより、開発者がLlama 3を容易に発見、利用、デプロイ、ファインチューニングできる環境が整いました。

### 影響
Llama 3のリリースとHugging Faceエコシステムへの統合は、AI開発コミュニティに大きな影響を与えます。
*   **開発効率の向上**: 8BモデルはコンシューマーGPUでの効率的なデプロイと開発を可能にし、70Bモデルは大規模なAIアプリケーションをサポートします。
*   **安全性と信頼性**: Llama Guard 2の導入により、LLMアプリケーションの安全性確保が容易になります。
*   **パフォーマンス向上**: 新しいトークナイザーとGQAの採用、および`torch.compile()`とCUDAグラフによる推論速度の向上は、開発者がより高性能なアプリケーションを構築するのに役立ちます。
*   **容易なファインチューニング**: Hugging Faceの🤗 TRLライブラリを使用することで、単一GPUでも効率的にLlama 3をファインチューニングできます。
*   **多様なデプロイオプション**: Hugging Face Inference Endpoints、Google Cloud、Amazon SageMakerとの統合により、本番環境へのデプロイが簡素化されます。
*   **ライセンスの明確化**: 帰属表示義務の追加により、派生作品の利用における透明性が向上します。

### 関係者
*   **Meta**: Llama 3モデルの開発、トレーニング、およびリリース。オープンソースAIコミュニティへの提供。
*   **Hugging Face**: Llama 3モデルのHugging Faceエコシステム（Hub, Transformers, Hugging Chat, Inference Endpoints）への全面的な統合とサポート。
*   **コミュニティメンバー**: LLM評価、Text Generation Inferenceサポート、TransformersおよびTokenizersへのLlama 3サポート追加、Hugging Chat統合、Gradioデモ作成、量子化およびプロンプトテンプレートのデバッグと実験、ローンチ時の様々な協力。

### データ

| モデル名 | パラメータ数 | タイプ | 特徴 |
|---|---|---|---|
| Meta-Llama-3-8b | 8B | ベース (事前学習済み) | 効率的なデプロイ/開発向け、Grouped-Query Attention (GQA) 使用 |
| Meta-Llama-3-8b-instruct | 8B | Instruct (ファインチューニング済み) | 会話アプリケーション向けに最適化 |
| Meta-Llama-3-70b | 70B | ベース (事前学習済み) | 大規模AIネイティブアプリケーション向け |
| Meta-Llama-3-70b-instruct | 70B | Instruct (ファインチューニング済み) | 会話アプリケーション向けに最適化 |
| Llama Guard 2 | Llama 3 8Bベース | 安全性ファインチューニング | LLMの入力/応答の安全でないコンテンツを分類 |

*   **コンテキスト長**: 全モデルで8Kトークン。
*   **トークナイザー**: 新しいトークナイザーを採用し、語彙サイズを128,256に拡張（Llama 2の32Kから増加）。
*   **トレーニングデータ**: Llama 2の約8倍、15兆トークン以上の公開オンラインデータでトレーニング。24,000GPUのクラスタを使用。
*   **Llama 3 Instructの最適化**: 1000万以上の人間アノテーションデータで、SFT、rejection sampling、PPO、DPOを組み合わせて最適化。
*   **パフォーマンス**: `torch.compile()`とCUDAグラフを使用することで、推論時に約4倍の速度向上。
*   **メモリ要件**: Llama-3-8b-instructをbfloat16で実行する場合、約16GBのRAMが必要。4-bit量子化を使用すると約7GBに削減可能。

## 引用（Notable quotes）
「Meta’s Llama 3, the next iteration of the open-access Llama family, is now released and available at Hugging Face. It's great to see Meta continuing its commitment to open AI, and we’re excited to fully support the launch with comprehensive integration in the Hugging Face ecosystem.」

## リスクと課題
*   **ライセンスの帰属表示義務**: Llama 3のライセンスには、派生モデルやサービスにおいて「Llama 3」の明示的な帰属表示義務が追加されており、利用者はこれを正確に遵守する必要があります。
*   **トレーニングデータの詳細の不明確さ**: トレーニングデータの正確な構成やキュレーション方法に関する詳細が公開されていないため、モデルの性能向上要因を完全に理解するには限界があります。
*   **評価の網羅性**: Open LLM Leaderboardは事前学習モデルの評価に有用ですが、会話モデルには特化した別のベンチマークが必要であり、特定のユースケースにおけるモデル性能の評価には追加の検討が必要です。

## 今後の見通し/アクション
*   **利用開始**: Hugging Face HubからLlama 3モデルにアクセスし、Hugging ChatでLlama 3 70B Instructモデルを試すことができます。
*   **開発と最適化**: 🤗 Transformers 4.40以降を使用し、Llama 3モデルを効率的に推論・ファインチューニング（🤗 TRL、4-bit量子化、PEFTなど）できます。特に、`torch.compile()`とCUDAグラフを活用して推論速度を最大化することが推奨されます。
*   **デプロイ**: Hugging Face Inference Endpoints、Google Cloud (Vertex AI/GKE)、Amazon SageMakerを通じて、Llama 3モデルを本番環境に容易にデプロイできます。
*   **コミュニティ貢献**: Open LLM Leaderboardや他のベンチマークでの評価、モデルの改善、新しいユースケースの探索を通じて、オープンソースAIコミュニティへの貢献が期待されます。

## Source URL
https://huggingface.co/blog/llama3
