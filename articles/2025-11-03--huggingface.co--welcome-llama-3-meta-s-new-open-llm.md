---
title: "Welcome Llama 3 - Meta's new open LLM"
title_ja: "Meta、新型オープンLLM「Llama 3」登場"
source_url: "https://huggingface.co/blog/llama3"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Metaは、オープンアクセスLLMファミリーの最新版「Llama 3」をリリースしました。8Bと70Bの2つのモデルサイズ（それぞれベース版とインストラクションチューン版）が提供され、Hugging Faceエコシステムに完全に統合されています。新しいトークナイザーによる語彙サイズの大幅な拡張（128,256）、8Kトークンのコンテキスト長、8BモデルでのGrouped-Query Attention (GQA) 採用、そしてLlama 2の約8倍となる15兆トークン以上のデータでの学習が特徴です。安全性に特化したLlama Guard 2も同時にリリースされました。寛容なライセンスで提供されますが、派生作品には「Llama 3」の明示的な帰属表示が義務付けられています。

## 重要ポイント

*   **モデルラインナップ**:
    *   Llama 3 8B (Base & Instruct-tuned): 消費者向けGPUでの効率的な開発・デプロイ向け。
    *   Llama 3 70B (Base & Instruct-tuned): 大規模AIネイティブアプリケーション向け。
    *   Llama Guard 2: Llama 3 8Bをベースとした安全性特化モデル。
*   **技術的進化**:
    *   **新しいトークナイザー**: 語彙サイズが128,256に拡張され、テキストエンコード効率と多言語対応が向上。
    *   **コンテキスト長**: 全モデルで8Kトークンをサポート。
    *   **GQA採用**: 8BモデルにGrouped-Query Attention (GQA) を採用し、長コンテキスト処理を効率化。
*   **学習データと手法**:
    *   **学習データ量**: Llama 2の約8倍となる15兆トークン以上の公開オンラインデータで学習。
    *   **インストラクションチューニング**: 1,000万以上の人間アノテーションデータとSFT、Rejection Sampling、PPO、DPOの組み合わせで最適化。
*   **ライセンス**: 再配布、ファインチューニング、派生作品を許可する寛容なライセンス。ただし、派生モデルやサービスには「Llama 3」の明示的な帰属表示が必須。
*   **Hugging Face統合**: Hugging Face Hub、Transformers、Hugging Chat、Inference Endpoints、Google Cloud、Amazon SageMakerでのデプロイ、TRLによるファインチューニングなど、エコシステム全体で包括的にサポート。

## 詳細レポート

### What happened
Metaは、オープンアクセス大規模言語モデル（LLM）の最新世代であるLlama 3を発表し、Hugging Faceを通じて利用可能となりました。Hugging Faceは、Llama 3のローンチを全面的にサポートし、そのエコシステムへの包括的な統合を実現しました。

### 背景
MetaはオープンAIへのコミットメントを継続しており、Llamaファミリーの最新版としてLlama 3をリリースしました。Hugging Faceとの緊密な連携により、Llama 3はHugging Face Hub、Transformersライブラリ、Hugging Chat、および主要なクラウドプロバイダー（Google Cloud、Amazon SageMaker）の推論サービスに迅速に統合され、開発者が容易にアクセス・利用できる環境が整えられました。

### 影響
*   **開発者**: 8Bモデルは消費者向けGPUでの効率的な開発・デプロイを可能にし、70Bモデルは大規模なAIネイティブアプリケーションの基盤となります。
*   **安全性**: Llama Guard 2のリリースにより、LLMの入力（プロンプト）と出力（応答）の安全性を分類し、プロダクション環境での安全な利用を促進します。
*   **効率性**: 新しいトークナイザーはテキストエンコード効率を高め、`torch.compile()`とCUDAグラフの組み合わせにより推論速度が最大4倍向上します。
*   **商用利用**: 寛容なライセンスにより、企業や開発者はLlama 3をベースとした製品やサービスを自由に開発・再配布できます。

### 関係者
*   **Meta**: Llama 3の開発元であり、オープンアクセスLLMの提供者。
*   **Hugging Face**: Llama 3のHugging Faceエコシステムへの統合（Hub、Transformers、Hugging Chat、Inference Endpoints、TRLなど）を主導。
*   **Google Cloud**: Vertex AIまたはGoogle Kubernetes Engine (GKE) を通じたLlama 3のデプロイをサポート。
*   **Amazon SageMaker**: AWS JumpstartまたはHugging Face LLM Containerを通じたLlama 3のデプロイとトレーニングをサポート。

### データ
Llama 3の主要モデルと特徴は以下の通りです。

| モデル名 | パラメータ数 | タイプ | コンテキスト長 | 特徴 |
|---|---|---|---|---|
| Meta-Llama-3-8b | 8B | Base | 8K | 消費者向けGPUでの効率的な開発・デプロイ、Grouped-Query Attention (GQA) 採用 |
| Meta-Llama-3-8b-instruct | 8B | Instruct-tuned | 8K | 対話アプリケーション向けに最適化 |
| Meta-Llama-3-70b | 70B | Base | 8K | 大規模AIネイティブアプリケーション向け |
| Meta-Llama-3-70b-instruct | 70B | Instruct-tuned | 8K | 対話アプリケーション向けに最適化 |
| Llama Guard 2 | (Llama 3 8Bベース) | Safety fine-tune | - | LLMの入力・出力の安全性を分類 |

*   **語彙サイズ**: 128,256 (Llama 2の32Kから大幅増)。
*   **学習データ**: 15兆トークン以上（Llama 2の約8倍）の新しい公開オンラインデータミックス。
*   **学習インフラ**: 24,000 GPUの2つのクラスターで学習。
*   **インストラクションチューニング**: 1,000万以上の人間アノテーションデータと、SFT、Rejection Sampling、PPO、DPOの組み合わせ。

## 引用（Notable quotes）

*   「MetaはオープンAIへのコミットメントを継続しており、Hugging Faceエコシステムでの包括的な統合により、そのローンチを全面的にサポートできることを嬉しく思います。」
*   「Llama 3は、再配布、ファインチューニング、派生作品を許可する寛容なライセンスで提供されます。ただし、Llama 3のライセンスでは、明示的な帰属表示が新たに義務付けられています。」

## リスクと課題

*   **ライセンスの帰属表示**: Llama 3のライセンスでは、派生モデルやサービスにおいて「Llama 3」の明示的な帰属表示が義務付けられており、利用者はこれを遵守する必要があります。
*   **計算リソース**: 70Bモデルや大規模なファインチューニングには、依然として高い計算リソース（GPUメモリなど）が必要となる場合があります。
*   **学習データの詳細**: 学習データの正確な構成やキュレーション方法の詳細は公開されておらず、性能向上の要因を完全に理解するにはさらなる分析が必要です。
*   **評価の複雑さ**: LLMリーダーボードは事前学習モデルの評価に有用ですが、会話モデルの性能を完全に評価するには、特定の会話ベンチマークや人間による評価が不可欠です。

## 今後の見通し/アクション

*   **Hugging Faceエコシステムでの活用**: 開発者はHugging Face Hub、Transformers、Hugging Chat、Inference Endpoints、Google Cloud、Amazon SageMakerなどのHugging Faceのツールとプラットフォームを通じて、Llama 3を容易に利用・デプロイできます。
*   **効率的なファインチューニング**: 🤗 TRLライブラリを活用することで、消費者向けGPUでもLlama 3の効率的なファインチューニングが可能となり、特定のユースケースに合わせたモデルのカスタマイズが促進されます。
*   **コミュニティによる発展**: オープンアクセスモデルとして、Llama 3はAIコミュニティによるさらなる研究、開発、改善の基盤となり、多様なアプリケーションやイノベーションが生まれることが期待されます。
*   **安全性強化**: Llama Guard 2の活用により、LLMを利用したアプリケーションの安全性が向上し、より信頼性の高いAIシステムの構築に貢献します。

## Source URL
https://huggingface.co/blog/llama3
