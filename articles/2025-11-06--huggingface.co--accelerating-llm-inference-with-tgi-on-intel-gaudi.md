---
title: "🚀 Accelerating LLM Inference with TGI on Intel Gaudi"
title_ja: "Intel GaudiとTGIでLLM推論を高速化"
source_url: "https://huggingface.co/blog/intel-gaudi-backend-for-tgi"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、LLM推論のための本番環境対応ソリューションであるText Generation Inference (TGI) に、Intel Gaudiハードウェアのネイティブサポートを統合しました。これにより、LLMデプロイのハードウェア選択肢が広がり、コスト効率と性能が向上します。以前の別フォーク運用からTGIのメインコードベースへの統合により、ユーザーエクスペリエンスと最新機能への対応が改善されました。

## 重要ポイント
*   **ネイティブ統合**: Hugging Face TGIにIntel Gaudiハードウェアサポートがネイティブに統合され、別フォークが不要になりました。
*   **ハードウェア多様性**: Gaudi1、Gaudi2、Gaudi3の全ラインをサポートし、従来のGPU以外のLLMデプロイオプションを提供します。
*   **コスト効率と性能**: 特定のワークロードにおいて優れた価格性能を発揮し、TGIの堅牢な機能（動的バッチ処理、ストリーミング応答など）をGaudi上で利用可能にします。
*   **広範なモデルサポート**: Llama 3.1、Mixtral、Mistralなど人気モデルがGaudi上で実行可能で、FP8量子化などの高度な機能も提供します。
*   **使いやすさ**: 公式Dockerイメージを通じて簡単にTGI on Gaudiを開始できます。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Faceは、大規模言語モデル（LLM）推論のためのプロダクション対応ソリューションであるText Generation Inference (TGI) に、Intel Gaudiハードウェアのネイティブサポートを完全に統合しました。この統合は、PR #3091を通じてTGIのメインコードベースに実装され、新しいTGIマルチバックエンドアーキテクチャの一部となっています。

**背景:**
以前は、Gaudiデバイス向けに「tgi-gaudi」という個別のフォークが維持されていました。これはユーザーにとって煩雑であり、TGIの最新機能のリリース時サポートを妨げていました。LLMデプロイのためのより多様で効率的なハードウェアオプションを提供し、オープンソースAIコミュニティの利便性を高めることが目的です。

**影響:**
ユーザーは、Intel Gaudiアクセラレータ上で、TGIの堅牢な機能（動的バッチ処理、ストリーミング応答、マルチカード推論、FP8精度など）を利用して、Llama 3.1、Mixtral、Mistralなどの人気LLMを効率的にデプロイできるようになります。これにより、ハードウェアの選択肢が増え、特定のワークロードにおいてコスト効率の高いLLMデプロイが可能になります。

**関係者:**
*   **Hugging Face:** Text Generation Inference (TGI) の開発元であり、Intel Gaudiサポートを統合。
*   **Intel:** Gaudi AIアクセラレータの開発元。
*   **ハードウェア提供元:**
    *   Gaudi1: AWS EC2 DL1インスタンス
    *   Gaudi2: Intel Tiber AI Cloud、Denvr Dataworks
    *   Gaudi3: Intel Tiber AI Cloud、IBM Cloud、OEM（Dell、HP、Supermicroなど）

**データ:**
*   **サポートされるGaudiハードウェア:**
    | Gaudiバージョン | 提供元/利用可能場所 |
    | :-------------- | :------------------ |
    | Gaudi1          | AWS EC2 DL1 instances |
    | Gaudi2          | Intel Tiber AI Cloud, Denvr Dataworks |
    | Gaudi3          | Intel Tiber AI Cloud, IBM Cloud, OEM (Dell, HP, Supermicro) |
*   **最適化された主要モデル（シングル/マルチカード構成）:**
    *   Llama 3.1 (8B, 70B)
    *   Llama 3.3 (70B)
    *   Llama 3.2 Vision (11B)
    *   Mistral (7B)
    *   Mixtral (8x7B)
    *   CodeLlama (13B)
    *   Falcon (180B)
    *   Qwen2 (72B)
    *   Starcoder and Starcoder2
    *   Gemma (7B)
    *   Llava-v1.6-Mistral-7B
    *   Phi-2
*   **高度な機能:** FP8量子化（Intel Neural Compressor (INC) 経由）、マルチカード推論（シャーディング）、ビジョン言語モデルサポート。

## 引用（Notable quotes）
*   "We're excited to announce the native integration of Intel Gaudi hardware support directly into Text Generation Inference (TGI), our production-ready serving solution for Large Language Models (LLMs)."
*   "This integration brings the power of Intel's specialized AI accelerators to our high-performance inference stack, enabling more deployment options for the open-source AI community 🎉"
*   "Now using the new TGI multi-backend architecture, we support Gaudi directly on TGI – no more finicking on a custom repository 🙌"

## リスクと課題
記事本文には直接的なリスクや課題の記述はありません。しかし、新しいハードウェアバックエンドの導入には、特定のワークロードにおける性能最適化の継続的な必要性や、エコシステム全体の成熟度といった一般的な課題が伴う可能性があります。

## 今後の見通し/アクション
*   **モデルラインナップの拡大**: DeepSeek-r1/v3、QWen-VLなど、さらに多くの最先端モデルのサポートを予定しています。
*   **コミュニティ参加の奨励**: コミュニティに対し、TGI on Gaudiハードウェアの試用とフィードバックの提供を呼びかけています。
*   **リソース提供**: 包括的なドキュメント、貢献ガイドライン、GitHubでのissue開設を通じて、コミュニティの参加を促進します。
*   **ミッション継続**: Hugging Faceは、LLMデプロイのための柔軟で効率的、かつ本番環境対応のツールを提供するというミッションを継続していきます。

## Source URL
https://huggingface.co/blog/intel-gaudi-backend-for-tgi
