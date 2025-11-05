---
title: "🚀 Accelerating LLM Inference with TGI on Intel Gaudi"
title_ja: "Intel Gaudi AIアクセラレータにTGIをネイティブ統合 LLM推論を加速"
source_url: "https://huggingface.co/blog/intel-gaudi-backend-for-tgi"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、LLM推論のためのプロダクション対応ソリューションであるText Generation Inference (TGI) に、Intel Gaudiハードウェアのネイティブサポートを統合したことを発表しました。これにより、オープンソースAIコミュニティは、IntelのAIアクセラレータを活用し、LLMデプロイの選択肢を拡大できるようになります。以前のGaudi専用フォーク運用から、TGIのメインコードベースへの直接統合に移行したことで、ユーザーエクスペリエンスと最新機能のサポートが大幅に向上しました。

## 重要ポイント
*   **ハードウェア多様性:** LLMを本番環境にデプロイするための選択肢が、従来のGPU以外にもIntel Gaudiハードウェアへと拡大。
*   **コスト効率:** 特定のワークロードにおいて、Gaudiハードウェアが優れた価格性能を提供。
*   **プロダクション対応:** TGIの堅牢な機能（動的バッチ処理、ストリーミング応答など）がGaudi上で利用可能。
*   **モデルサポート:** Llama 3.1、Mixtral、Mistralなど、人気のある多数のLLMモデルをGaudiハードウェアで実行可能。
*   **高度な機能:** マルチカード推論（シャーディング）、ビジョン言語モデル、FP8精度など、先進的な機能をサポート。
*   **運用改善:** 以前のGaudi専用フォークからTGIメインコードベースへの統合により、ユーザーの利便性と最新TGI機能への追従性が向上。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Faceは、Text Generation Inference (TGI) にIntel Gaudiハードウェアのネイティブサポートを完全に統合したことを発表しました。この統合は、PR #3091を通じてTGIのメインコードベースに組み込まれました。

**背景:**
これまでHugging Faceは、Gaudiデバイス向けに`tgi-gaudi`という独立したフォークを維持していました。これはユーザーにとって扱いにくく、最新のTGI機能がGaudiデバイスで利用可能になるまでの遅延を引き起こしていました。新しいTGIマルチバックエンドアーキテクチャの導入により、この課題が解決され、GaudiサポートがTGIに直接組み込まれることになりました。

**影響:**
*   **サポートハードウェア:** Intel Gaudi1、Gaudi2、Gaudi3の全ラインナップをサポート。
*   **利用可能場所:**
    | Gaudiバージョン | 利用可能場所 |
    | :-------------- | :----------- |
    | Gaudi1          | AWS EC2 DL1インスタンス |
    | Gaudi2          | Intel Tiber AI Cloud, Denvr Dataworks |
    | Gaudi3          | Intel Tiber AI Cloud, IBM Cloud, Dell, HP, Supermicro (OEM) |
*   **利用開始:** 公式Dockerイメージを使用することで、Gaudiハードウェア上でTGIを簡単に実行可能。
*   **最適化モデル:** Llama 3.1 (8B, 70B)、Mixtral (8x7B)、Mistral (7B)、CodeLlama (13B)、Falcon (180B)、Qwen2 (72B)、Gemma (7B) など、多数の主要LLMモデルがGaudi向けに最適化され、シングルおよびマルチカード構成で最高のパフォーマンスを発揮します。
*   **高度な機能:** Intel Neural Compressor (INC) を介したFP8量子化など、さらなる性能最適化のための高度な機能を提供します。

**関係者:**
*   **Hugging Face:** Text Generation Inference (TGI) の開発元。
*   **Intel:** Gaudi AIアクセラレータの提供元。
*   **オープンソースAIコミュニティ:** LLMデプロイの新たな選択肢を得るユーザー。
*   **クラウド/ハードウェアプロバイダー:** AWS、Intel Tiber AI Cloud、Denvr Dataworks、IBM Cloud、Dell、HP、Supermicroなど。

**データ:**
*   統合に関するプルリクエスト番号: PR #3091

## 引用（Notable quotes）
*   「We're excited to announce the native integration of Intel Gaudi hardware support directly into Text Generation Inference (TGI), our production-ready serving solution for Large Language Models (LLMs). This integration brings the power of Intel's specialized AI accelerators to our high-performance inference stack, enabling more deployment options for the open-source AI community 🎉」
*   「By bringing Intel Gaudi support directly into TGI, we're continuing our mission to provide flexible, efficient, and production-ready tools for deploying LLMs. We're excited to see what you'll build with this new capability! 🎉」

## リスクと課題
*   **過去の課題:** 以前はGaudiデバイス用の別フォークを維持していたため、ユーザーにとって扱いにくく、最新のTGI機能のサポートが遅れるという課題がありました。今回の統合により、この課題は解決されました。
*   **ハードウェアの可用性とコスト:** Gaudiハードウェアは特定のワークロードでコスト効率が良いとされますが、全てのユーザーやワークロードにとって最適な選択肢とは限らず、入手性や初期投資が考慮される必要があります。
*   **学習曲線:** 新しいハードウェアバックエンドへの移行には、ユーザーがGaudi環境でのTGIのセットアップや最適化に関する知識を習得する必要がある場合があります。

## 今後の見通し/アクション
*   **Hugging Faceの計画:** DeepSeek-r1/v3、QWen-VLなど、さらに多くの最先端モデルのサポートを拡大し、AIアプリケーションを強化する予定です。
*   **コミュニティへの呼びかけ:** コミュニティに対し、TGI on Gaudiハードウェアを試用し、フィードバックを提供することが奨励されています。詳細なドキュメントを参照し、貢献ガイドラインを確認したり、GitHubでIssueを報告したりすることが推奨されています。
*   **Hugging Faceのミッション:** LLMデプロイのための柔軟で効率的、かつプロダクション対応のツールを提供し続けるというHugging Faceのミッションを継続します。

## Source URL
https://huggingface.co/blog/intel-gaudi-backend-for-tgi
