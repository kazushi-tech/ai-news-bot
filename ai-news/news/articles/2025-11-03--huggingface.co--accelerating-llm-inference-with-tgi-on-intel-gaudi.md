---
title: "\U0001F680 Accelerating LLM Inference with TGI on Intel Gaudi"
date: '2025-11-03'
model: gemini-2.5-flash
source_url: 'https://huggingface.co/blog/intel-gaudi-backend-for-tgi'
host: huggingface.co
tldr: >-
  Hugging Faceは、Text Generation Inference (TGI) にIntel
  Gaudiハードウェアのネイティブサポートを統合しました。これにより、特殊なAIアクセラレータ上でLLM推論が加速され、多様なデプロイメントオプションと効率的なソリューションを提供します。
key_points:
  - 'Intel GaudiハードウェアのサポートがTGIのメインコードベース（PR #3091）に直接統合され、以前の独立したフォーク運用が解消されました。'
  - >-
    Gaudi1 (AWS EC2 DL1)、Gaudi2 (Intel Tiber AI Cloud、Denvr Dataworks)、Gaudi3
    (Intel Tiber AI Cloud、IBM Cloud、OEM) を含むIntel Gaudiハードウェア全ラインをサポートします。
  - >-
    ハードウェアの多様性、費用対効果、TGIの堅牢な生産レディ機能（動的バッチ処理、ストリーミング応答）、Llama
    3.1、Mixtralなどの人気LLMモデルのサポートといった利点を提供します。
  - >-
    マルチカード推論（シャーディング）、視覚言語モデル、Intel Neural Compressor (INC)
    を利用したFP8精度など高度な機能を持ち、Llama 3.1 (8B/70B)、Mixtral (8x7B)、Mistral (7B)
    などのモデルが最適化されています。
  - >-
    公式Dockerイメージを利用した導入が推奨されており、コミュニティからのフィードバックや貢献が奨励されています。DeepSeek-r1/v3やQWen-VLなどの新モデルも今後追加予定です。
title_ja: ''
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/intel-gaudi-backend-for-tgi'
summarized_at: '2025-11-05T10:57:32.325Z'
---
# 🚀 Accelerating LLM Inference with TGI on Intel Gaudi

## TL;DR
- Hugging FaceのTGIがIntel Gaudiハードウェアのネイティブサポートを統合し、LLM推論のデプロイオプションを拡大しました。
- 以前の別フォークからTGIのメインコードベースにGaudiサポートが移行し、Gaudi1/2/3の全ラインに対応しています。
- ハードウェア多様性、コスト効率、TGIの堅牢な機能（動的バッチ処理、ストリーミング応答など）がGaudi上で利用可能になります。
- Llama 3.1を含む多数の人気モデルがGaudi向けに最適化され、FP8量子化などの高度な機能もサポートされます。
- 公式Dockerイメージを通じて簡単に利用を開始でき、コミュニティからのフィードバックと貢献を歓迎しています。

## 重要ポイント
- **TGIへのネイティブ統合**: Hugging FaceのText Generation Inference (TGI) がIntel Gaudiハードウェアをメインコードベースに直接統合し、以前のカスタムフォーク運用を解消しました。
- **包括的なGaudiサポート**: Gaudi1 (AWS DL1)、Gaudi2 (Intel Tiber AI Cloud, Denvr Dataworks)、Gaudi3 (Intel Tiber AI Cloud, IBM Cloud, OEM) の全世代がサポートされ、幅広いデプロイ環境に対応します。
- **提供される主要なメリット**: ハードウェアの多様性、特定のワークロードにおけるコスト効率の向上、TGIの生産準備ができた堅牢な機能群（動的バッチ処理、ストリーミング応答など）をGaudi上で提供します。
- **最適化されたモデルと高度な機能**: Llama 3.1、Mixtral、Mistralなど多数の人気LLMがGaudi向けに最適化され、マルチカード推論、ビジョン-言語モデル、FP8精度などの高度な機能もサポートされます。
- **簡単な利用開始とコミュニティの参加**: 公式Dockerイメージを使用してGaudi上でTGIを簡単に実行でき、詳細なドキュメントが提供され、コミュニティからのフィードバックや貢献が積極的に奨励されています。

## 概要
Hugging Faceは、LLM推論ソリューションであるText Generation Inference (TGI) にIntel Gaudiハードウェアのネイティブサポートを統合したことを発表しました。これにより、Gaudi1, Gaudi2, Gaudi3の全世代がTGIのメインコードベースで直接サポートされ、LLM展開のハードウェア多様性とコスト効率が大幅に向上します。動的バッチ処理やストリーミング応答といったTGIの堅牢な機能群がGaudi上で利用可能となり、Llama 3.1やMixtralなど多くの人気モデルがGaudi向けに最適化されています。公式Dockerイメージを通じて簡単に利用を開始でき、今後もさらなるモデルの追加と、コミュニティからのフィードバックや貢献を歓迎しています。
