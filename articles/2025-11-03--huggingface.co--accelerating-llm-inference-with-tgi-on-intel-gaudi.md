---
title: "🚀 Accelerating LLM Inference with TGI on Intel Gaudi"
title_ja: "**Intel GaudiでLLM推論を加速 TGIがネイティブ対応**"
source_url: "https://huggingface.co/blog/intel-gaudi-backend-for-tgi"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceのText Generation Inference (TGI) がIntel Gaudiハードウェアをネイティブサポートしました。これにより、LLM推論のためのデプロイオプションが拡大し、Gaudi1、Gaudi2、Gaudi3の全ラインでTGIの堅牢な機能と最適化されたモデルが利用可能になります。以前の別フォーク管理の煩雑さが解消され、オープンソースAIコミュニティに柔軟で効率的なプロダクションレディなツールを提供します。

## 重要ポイント
*   **TGIへのGaudiネイティブ統合**: 以前の別フォーク管理からTGIのメインコードベースに直接統合され、利用が簡素化。
*   **全Gaudiハードウェアサポート**: Gaudi1、Gaudi2、Gaudi3の全ラインでLLM推論が可能。
*   **ハードウェア多様性とコスト効率**: LLMデプロイの選択肢が増え、特定のワークロードで優れた価格性能を提供。
*   **プロダクションレディな機能**: TGIの動的バッチ処理、ストリーミング応答などの堅牢な機能がGaudiで利用可能。
*   **広範なモデルサポートと最適化**: Llama 3.1、Mixtral、Mistralなど人気モデルがGaudi向けに最適化。
*   **高度な機能**: マルチカード推論（シャーディング）、ビジョン言語モデル、FP8量子化（Intel Neural Compressor経由）をサポート。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、大規模言語モデル（LLM）向けのプロダクションレディな推論ソリューションであるText Generation Inference (TGI) に、Intel Gaudiハードウェアのネイティブサポートを統合したことを発表しました。この統合はTGIのメインコードベース（PR #3091）で行われ、新しいTGIマルチバックエンドアーキテクチャを活用しています。

### 背景
これまで、Gaudiデバイスのサポートは`tgi-gaudi`という個別のフォークで維持されていました。このアプローチはユーザーにとって煩雑であり、TGIの最新機能がGaudiデバイスで利用可能になるまでの遅延を引き起こしていました。今回のネイティブ統合により、カスタムリポジトリを扱う必要がなくなり、開発と利用が大幅に簡素化されます。

### 影響
*   **ユーザーへのメリット**: Intel Gaudiハードウェア上で、より簡単に、より効率的に、より多様なLLMをデプロイできるようになります。ハードウェアの選択肢が増え、特定のワークロードでのコスト効率が向上します。TGIの堅牢な機能がGaudi環境で利用可能になることで、プロダクション環境でのLLM運用が強化されます。
*   **オープンソースAIコミュニティへの貢献**: LLMデプロイの選択肢を広げ、IntelのAIアクセラレータの力をオープンソースコミュニティに提供します。

### 関係者
*   **Hugging Face**: Text Generation Inference (TGI) の開発元。
*   **Intel**: Gaudi AIアクセラレータの提供元。
*   **クラウド/OEMパートナー**:
    *   AWS (Gaudi1搭載DL1インスタンス)
    *   Intel Tiber AI Cloud (Gaudi2, Gaudi3)
    *   Denvr Dataworks (Gaudi2)
    *   IBM Cloud (Gaudi3)
    *   Dell, HP, Supermicro (Gaudi3搭載OEM)

### データ
#### サポートされるIntel Gaudiハードウェアと提供元
| Gaudiバージョン | 提供元/利用可能場所 |
| :-------------- | :------------------ |
| Gaudi1          | AWS EC2 DL1 インスタンス |
| Gaudi2          | Intel Tiber AI Cloud, Denvr Dataworks |
| Gaudi3          | Intel Tiber AI Cloud, IBM Cloud, Dell, HP, Supermicro (OEM) |

#### Gaudi向けに最適化された主要モデル
*   Llama 3.1 (8B, 70B)
*   Llama 3.3 (70B)
*   Llama 3.2 Vision (11B)
*   Mistral (7B)
*   Mixtral (8x7B)
*   CodeLlama (13B)
*   Falcon (180B)
*   Qwen2 (72B)
*   Starcoder および Starcoder2
*   Gemma (7B)
*   Llava-v1.6-Mistral-7B
*   Phi-2

#### 高度な機能
*   マルチカード推論（シャーディング）
*   ビジョン言語モデル (VLM)
*   FP8精度（Intel Neural Compressor (INC) 経由）

## 引用（Notable quotes）
*   "This integration brings the power of Intel's specialized AI accelerators to our high-performance inference stack, enabling more deployment options for the open-source AI community 🎉"
*   "Now using the new TGI multi-backend architecture, we support Gaudi directly on TGI – no more finicking on a custom repository 🙌"
*   "By bringing Intel Gaudi support directly into TGI, we're continuing our mission to provide flexible, efficient, and production-ready tools for deploying LLMs."

## リスクと課題
記事には直接的なリスクや課題は明記されていませんが、一般的に新しいハードウェアバックエンドの統合には以下の課題が伴う可能性があります。
*   **性能最適化の継続**: 特定のモデルやワークロードにおいて、継続的な性能チューニングと最適化が必要となる可能性があります。
*   **互換性の維持**: TGIの進化やGaudiハードウェアのアップデートに伴い、互換性を維持するための継続的な開発とテストが求められます。
*   **エコシステムの成熟度**: GPUと比較してGaudiの市場シェアや開発者コミュニティの規模が小さい場合、特定のツールやライブラリのサポートが限定的である可能性があります。
*   **ユーザーフィードバックへの対応**: 新しい統合であるため、ユーザーからの予期せぬ問題報告や機能要望への迅速な対応が重要となります。

## 今後の見通し/アクション
*   **モデルラインナップの拡充**: DeepSeek-r1/v3、QWen-VLなど、さらに多くの最先端モデルのサポートを拡大する予定です。
*   **コミュニティへの呼びかけ**: コミュニティに対し、GaudiハードウェアでのTGIの試用とフィードバックの提供を呼びかけています。
*   **ドキュメントと貢献**: 包括的なGaudiバックエンドドキュメントの参照、コントリビューションガイドの確認、GitHubでのIssue報告を通じて、コミュニティからの貢献を奨励しています。
*   **ミッションの継続**: LLMデプロイのための柔軟で効率的、かつプロダクションレディなツールを提供するというHugging Faceのミッションを継続していきます。

## Source URL
https://huggingface.co/blog/intel-gaudi-backend-for-tgi
