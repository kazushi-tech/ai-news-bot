---
title: Deploy Meta Llama 3.1 405B on Google Cloud Vertex AI
title_ja: ''
source_url: 'https://huggingface.co/blog/llama31-on-vertex-ai'
date: '2025-11-03'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/llama31-on-vertex-ai'
summarized_at: '2025-11-05T11:01:59.480Z'
tldr: '# Deploy Meta Llama 3.1 405B on Google Cloud Vertex AI'
key_points:
  - '- ## TL;DR'
  - >-
    - -   Meta Llama 3.1 405B Instruct FP8モデルをGoogle Cloud Vertex
    AIにデプロイする詳細な手順を解説しています。
  - >-
    - -   Hugging FaceのText Generation Inference (TGI) Deep Learning
    ContainerとGoogle Cloud A3インスタンス (8xH100 GPU) を使用します。
  - '- -   モデルの登録、デプロイ、オンライン推論の実行、そしてリソースのクリーンアップまでを網羅した実践的なガイドです。'
  - >-
    - -   Llama 3.1 405Bの推論には高いVRAM (約405GB) が必要で、Google
    CloudでのA3インスタンス利用にはカスタムクォータ申請が必須です。
---
# Deploy Meta Llama 3.1 405B on Google Cloud Vertex AI

## TL;DR
-   Meta Llama 3.1 405B Instruct FP8モデルをGoogle Cloud Vertex AIにデプロイする詳細な手順を解説しています。
-   Hugging FaceのText Generation Inference (TGI) Deep Learning ContainerとGoogle Cloud A3インスタンス (8xH100 GPU) を使用します。
-   モデルの登録、デプロイ、オンライン推論の実行、そしてリソースのクリーンアップまでを網羅した実践的なガイドです。
-   Llama 3.1 405Bの推論には高いVRAM (約405GB) が必要で、Google CloudでのA3インスタンス利用にはカスタムクォータ申請が必須です。

## 重要ポイント
-   **Meta Llama 3.1の特徴**: 2024年7月リリースのオープンLLMで、128Kトークンの長いコンテキスト長、多言語対応、ツール利用、より緩やかなライセンスが特徴です。405Bモデルは合成データ生成やLLM as a Judgeに適しています。
-   **Vertex AIとHugging Face TGIの統合**: Google CloudのVertex AIプラットフォーム上で、Hugging FaceのTGI Deep Learning Containerを利用してMeta Llama 3.1モデルをデプロイし、リアルタイムでのオンライン推論を実現します。
-   **ハードウェアとGoogle Cloudクォータ要件**: Llama 3.1 405B (FP8) の推論には約405GBのGPU VRAMが必要であり、Google CloudのA3インスタンス (8x NVIDIA H100 80GB GPU) が推奨されます。A3インスタンスの利用には、Vertex AI APIのカスタムモデルサービングGPUおよびCPUに関するクォータ増加申請が必須です。
-   **プログラムによるデプロイ手順**: Google Cloud環境のセットアップ、Hugging Face Hubへのアクセス許可取得、`google-cloud-aiplatform` SDKを使用したVertex AI Model Registryへのモデル登録、およびA3インスタンスへのモデルデプロイといった一連のステップをコード例と共に説明します。
-   **オンライン推論とリソース管理**: デプロイされたモデルに対するオンライン予測をPython (同じ/異なるセッション) またはVertex AI Online Prediction UIから実行する方法を示し、不要なコストを避けるためにモデルやエンドポイントのリソースをクリーンアップする手順も提供されます。

## 概要
本記事は、最新のオープンLLMであるMeta Llama 3.1 405B Instruct FP8をGoogle Cloud Vertex AIにプログラム的にデプロイする手順を詳細に解説します。Hugging FaceのText Generation Inference (TGI) Deep Learning Containerと、高いVRAM要件を満たすGoogle CloudのA3インスタンス (8x NVIDIA H100 GPU) を活用。Google Cloud環境のセットアップからモデル登録、デプロイ、オンライン推論の実行、そしてリソースのクリーンアップまでを網羅しており、大規模LLMをクラウド環境で運用するための実践的なガイドとなっています。
