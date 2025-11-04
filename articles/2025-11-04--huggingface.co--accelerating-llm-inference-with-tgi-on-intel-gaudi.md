---
title: "🚀 Accelerating LLM Inference with TGI on Intel Gaudi"
title_ja: "Intel GaudiにTGIをネイティブ統合 LLM推論を高速化"
source_url: "https://huggingface.co/blog/intel-gaudi-backend-for-tgi"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、LLM推論のためのプロダクションレディなソリューションであるText Generation Inference (TGI) に、Intel Gaudiハードウェアのネイティブサポートを統合しました。これにより、オープンソースAIコミュニティは、より多様なハードウェアオプションとコスト効率の高い方法でLLMをデプロイできるようになります。以前の別フォークは廃止され、TGIのメインコードベースでGaudi1、Gaudi2、Gaudi3の全ラインが直接サポートされます。

## 重要ポイント
*   **TGIへのGaudiネイティブ統合**: Intel GaudiハードウェアサポートがTGIのメインコードベースに直接統合され、以前の別フォークが不要になりました。
*   **広範なGaudiハードウェアサポート**: Gaudi1 (AWS EC2 DL1)、Gaudi2 (Intel Tiber AI Cloud、Denvr Dataworks)、Gaudi3 (Intel Tiber AI Cloud、IBM Cloud、OEM) の全ラインをサポートします。
*   **主要なメリット**: ハードウェアの多様性、特定のワークロードにおけるコスト効率、TGIのプロダクションレディな機能（動的バッチ処理、ストリーミング応答など）のGaudi上での利用、Llama 3.1やMixtralなどの人気モデルのサポート、マルチカード推論やFP8精度などの高度な機能を提供します。
*   **容易な開始**: 公式Dockerイメージと簡単なコマンドでGaudi上でのTGI利用を開始できます。
*   **最適化されたモデル**: Llama 3.1、Mixtral、Mistralなど、多数の人気LLMがGaudi向けに最適化されています。

## 詳細レポート
### What happened
Hugging Faceは、LLM推論のための高性能なサービングソリューションであるText Generation Inference (TGI) に、Intel Gaudiハードウェアのネイティブサポートを統合したことを発表しました。この統合により、Gaudiデバイス向けのTGIのサポートがメインのコードベースに直接組み込まれ、以前の個別のフォーク（tgi-gaudi）が不要になりました。

### 背景
これまでIntel GaudiデバイスをTGIで利用するには、専用のフォークを維持する必要があり、ユーザーにとって煩雑であり、最新のTGI機能の迅速なサポートを妨げていました。今回のネイティブ統合は、TGIの新しいマルチバックエンドアーキテクチャを活用し、この問題を解決することで、オープンソースAIコミュニティにLLMデプロイのためのより柔軟で効率的な選択肢を提供することを目的としています。

### 影響
*   **ハードウェアの多様性**: 従来のGPU以外の選択肢として、GaudiハードウェアでのLLMデプロイが可能になります。
*   **コスト効率**: 特定のワークロードにおいて、Gaudiハードウェアが優れた価格性能比を提供します。
*   **プロダクションレディ**: TGIの堅牢な機能（動的バッチ処理、ストリーミング応答、継続的なバッチ処理など）がGaudi上で利用可能になります。
*   **モデルサポート**: Llama 3.1、Mixtral、Mistralなど、人気のある多数のLLMがGaudiハードウェア上で実行できます。
*   **高度な機能**: マルチカード推論（シャーディング）、Vision-Languageモデル、Intel Neural Compressor (INC) を介したFP8精度などの高度な機能がサポートされます。

### 関係者
*   **Hugging Face**: Text Generation Inference (TGI) の開発元。
*   **Intel**: Gaudi AIアクセラレーターの開発元。
*   **オープンソースAIコミュニティ**: LLMのデプロイと利用に関心のある開発者および企業。
*   **クラウドプロバイダー/OEM**: AWS (Gaudi1)、Intel Tiber AI Cloud (Gaudi2, Gaudi3)、Denvr Dataworks (Gaudi2)、IBM Cloud (Gaudi3)、Dell, HP, Supermicro (Gaudi3 OEM)。

### データ
**Gaudiサポートモデル (最適化済み)**

| モデル名 | サイズ |
| :------- | :----- |
| Llama 3.1 | 8B, 70B |
| Llama 3.3 | 70B |
| Llama 3.2 Vision | 11B |
| Mistral | 7B |
| Mixtral | 8x7B |
| CodeLlama | 13B |
| Falcon | 180B |
| Qwen2 | 72B |
| Starcoder / Starcoder2 | - |
| Gemma | 7B |
| Llava-v1.6-Mistral-7B | - |
| Phi-2 | - |

## 引用（Notable quotes）
*   "We're excited to announce the native integration of Intel Gaudi hardware support directly into Text Generation Inference (TGI), our production-ready serving solution for Large Language Models (LLMs)."
*   "Now using the new TGI multi-backend architecture, we support Gaudi directly on TGI – no more finicking on a custom repository 🙌"

## リスクと課題
*   **ハードウェアの入手性とコスト**: Gaudiハードウェアの供給状況や初期導入コストが、一部のユーザーにとって障壁となる可能性があります。
*   **最適化の範囲**: 現在最適化されているモデルは限られており、未最適化のモデルでは性能が十分に発揮されない可能性があります。
*   **エコシステムの成熟度**: GPUエコシステムと比較して、Gaudiのエコシステムはまだ発展途上であり、ツールやコミュニティサポートの面で課題があるかもしれません。

## 今後の見通し/アクション
*   **モデルラインアップの拡充**: DeepSeek-r1/v3、QWen-VLなど、さらに多くの最先端モデルのサポートを予定しています。
*   **コミュニティからのフィードバック**: コミュニティに対し、Gaudi上でのTGIの試用とフィードバックを積極的に求めています。
*   **貢献の促進**: ドキュメント、コントリビューションガイドライン、GitHubでのIssue報告を通じて、コミュニティからの貢献を奨励しています。
*   **ミッションの継続**: LLMデプロイのための柔軟で効率的、プロダクションレディなツールを提供するというHugging Faceのミッションを継続します。

## Source URL
https://huggingface.co/blog/intel-gaudi-backend-for-tgi
