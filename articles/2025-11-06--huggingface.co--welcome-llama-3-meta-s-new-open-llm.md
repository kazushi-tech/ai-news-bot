---
title: "Welcome Llama 3 - Meta's new open LLM"
title_ja: "Meta、待望のオープンLLM「Llama 3」公開 AI開発の裾野を広げる"
source_url: "https://huggingface.co/blog/llama3"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Metaは、オープンアクセスLLMの最新版「Llama 3」をリリースし、Hugging Faceエコシステムに完全に統合されました。Llama 3は8Bと70Bの2つのモデルサイズで提供され、それぞれベースモデルとインストラクションチューニング版があります。また、安全性モデルのLlama Guard 2も同時にリリースされました。新しいトークナイザーの採用、大幅に増加した学習データ、寛容なライセンス（ただし帰属表示義務あり）が特徴で、Hugging Face Hub、Transformers、主要クラウドプロバイダーを通じて容易に利用・ファインチューニングが可能です。

## 重要ポイント

*   **Llama 3のリリース**: MetaのオープンアクセスLLMの最新世代。
*   **モデルバリエーション**: 8Bと70Bの2サイズ、それぞれベースモデルとインストラクションチューニング版。
*   **Llama Guard 2**: Llama 3 8Bをベースとした安全性モデルも同時リリース。
*   **Hugging Faceエコシステムとの統合**: Hugging Face Hub、Transformers、Hugging Chat、Inference Endpoints、Google Cloud、Amazon SageMakerで全面サポート。
*   **新トークナイザー**: 語彙サイズが128,256に拡張され、効率的なエンコードと多言語対応を強化。
*   **大規模な学習**: Llama 2の約8倍となる15兆トークン以上で学習。
*   **寛容なライセンス**: 再配布、ファインチューニング、派生作品を許可するが、派生作品には「Llama 3」の明記が必須。
*   **効率的な利用**: Transformers 4.40でサポートされ、4-bit量子化や`torch.compile()`による高速化、TRLによるファインチューニングが可能。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Metaは、オープンアクセスLLMファミリーの最新版「Llama 3」をリリースしました。これには、80億パラメータ（8B）と700億パラメータ（70B）の2つのモデルサイズが含まれ、それぞれ事前学習済み（ベース）モデルとインストラクションチューニング済みモデルが提供されます。さらに、Llama 3 8Bをベースとした安全性モデル「Llama Guard 2」も同時に公開されました。Hugging Faceは、これらのモデルのHugging Faceエコシステムへの包括的な統合をサポートし、モデルの利用、推論、ファインチューニングを容易にしています。

### 背景
MetaはオープンAIへのコミットメントを継続しており、Llama 3はその一環としてリリースされました。Hugging Faceとの緊密な連携により、開発者はHugging Face Hub、Transformersライブラリ、Hugging Chat、および主要なクラウドプロバイダー（Google Cloud、Amazon SageMaker）の推論サービスを通じて、Llama 3を迅速に導入・活用できる環境が整備されました。

### 影響
Llama 3のリリースは、オープンソースAIコミュニティに大きな影響を与えます。
*   **開発者**: より高性能でアクセスしやすいLLMが提供され、コンシューマGPUでも利用可能な8Bモデルにより、幅広い開発者がAIアプリケーションを構築・実験できるようになります。
*   **エコシステム**: Hugging Faceエコシステムとの深い統合により、既存のツールやワークフローをそのまま活用してLlama 3を導入・運用できます。
*   **安全性**: Llama Guard 2の提供により、LLMの入出力における安全でないコンテンツの検出が強化され、より安全なAIアプリケーションの開発が促進されます。
*   **ライセンス**: 寛容なライセンスは利用を促進しますが、派生作品における「Llama 3」の帰属表示義務は、利用者が遵守すべき新しい要件となります。

### 関係者
*   **Meta**: Llama 3およびLlama Guard 2の開発元。オープンAIへのコミットメントを主導。
*   **Hugging Face**: Llama 3のHugging Faceエコシステムへの全面的な統合（Hub、Transformers、Hugging Chat、Inference Endpointsなど）をサポート。
*   **コミュニティメンバー**: LLM評価、Text Generation Inferenceサポート、TransformersおよびトークナイザーへのLlama 3サポート追加、Hugging Chat統合、Gradioデモ、量子化とプロンプトテンプレートのデバッグなど、多岐にわたる貢献。

### データ
Llama 3の主要なデータと技術的特徴は以下の通りです。

| 特徴              | Llama 3

---
## Source URL（必須）
https://huggingface.co/blog/llama3

