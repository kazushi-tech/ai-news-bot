---
title: "Deploy Meta Llama 3.1 405B on Google Cloud Vertex AI"
title_ja: "Google Cloud Vertex AI、Meta Llama 3.1 405Bを導入"
source_url: "https://huggingface.co/blog/llama31-on-vertex-ai"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

本記事は、Metaが2024年7月にリリースした最新のオープンLLM「Meta Llama 3.1 405B Instruct FP8」を、Google Cloud Vertex AIにデプロイし、オンライン予測を実行する詳細な手順を解説しています。Hugging FaceのText Generation Inference (TGI) 用Deep Learning Containers (DLCs) を活用し、Google CloudのA3インスタンス（8 x H100 NVIDIA GPU）上で、コードベースおよびVertex AI UIからのデプロイと推論方法を網羅しています。

## 重要ポイント

*   **モデル:** Meta Llama 3.1 405B Instruct FP8。Metaの最新オープンLLMで、128Kトークンの大規模コンテキスト長、多言語対応、ツール利用機能、より寛容なライセンスが特徴です。
*   **プラットフォーム:** Google Cloud Vertex AI。MLモデルのトレーニング、デプロイ、およびLLMのカスタマイズを可能にする統合プラットフォームです。
*   **ハードウェア要件:** Llama 3.1 405B FP8モデルの推論には約405GBのVRAMが必要です。Google CloudのA3-highgpu-8gインスタンス（8 x H100 80GB GPU、合計640GB VRAM）を使用します。
*   **デプロイ方法:** Hugging FaceのTGI用DLCs (`huggingface-text-generation-inference-cu121.2-2.ubuntu2204.py310`) を利用し、Vertex AI Model Registryにモデルを登録後、Vertex AI Endpointにデプロイします。
*   **予測方法:** Python SDKまたはVertex AI Online Prediction UIを通じて、リアルタイムのオンライン予測を実行できます。
*   **事前準備:** Google CloudのA3インスタンス利用にはカスタムクォータ増加申請が必要。Meta Llama 3.1モデルはHugging Face Hubでゲートされているため、アクセス承認とHugging Faceトークンが必要です。

## 詳細レポート（What happened/背景/影響/関係者/データ）

*   **What happened:** Hugging Faceは、Meta Llama 3.1 405B Instruct FP8モデルをGoogle Cloud Vertex AIにデプロイし、オンライン予測を行うための詳細なガイドを公開しました。このガイドでは、Hugging FaceのTGI DLCとGoogle Cloudの高性能A3インスタンスを組み合わせた、大規模LLMの効率的な運用方法が示されています。
*   **背景:**
    *   Meta Llama 3.1は、2024年7月にMetaからリリースされた最新のオープンLLMで、8B、70B、405Bの3つのサイズがあります。特に405Bは、合成データ生成、LLM as a Judge、モデル蒸留などの高度なユースケースを想定しています。
    *   Vertex AIは、Google Cloudが提供する機械学習プラットフォームであり、データエンジニアリング、データサイエンス、MLエンジニアリングのワークフローを統合し、LLMのカスタマイズとデプロイをサポートします。
    *   大規模LLMの推論には、モデルサイズと精度に応じた大量のVRAMが必要であり、特に405BモデルのFP8量子化版でも405GBのVRAMを必要とします。
*   **影響:**
    *   ユーザーは、Meta Llama 3.1 405Bのような最先端の大規模オープンLLMを、Google Cloudの堅牢なインフラ上で容易にデプロイし、リアルタイム推論を実行できるようになります。
    *   Hugging FaceのTGI DLCとVertex AIの統合により、デプロイプロセスが簡素化され、開発者はモデルの運用よりもアプリケーション開発に集中できます。
    *   Google CloudのA3インスタンスのような最新GPUの活用により、大規模モデルの効率的かつ高性能な運用が可能になります。
*   **関係者:**
    *   **Meta:** Llama 3.1モデルの開発元。
    *   **Hugging Face:** Llama 3.1モデルのHugging Face Hubでの提供、TGI DLCの開発、本デプロイガイドの提供。
    *   **Google Cloud:** Vertex AIプラットフォーム、A3インスタンスなどのインフラ提供。
*   **データ:**
    *   **Meta Llama 3.1モデルのVRAM要件（概算）:**
        | Model Size | FP16 | FP8 | INT4 |
        | :--------- | :--- | :-- | :--- |
        | 8B         | 16 GB | 8 GB | 4 GB |
        | 70B        | 140 GB | 70 GB | 35 GB |
        | 405B       | 810 GB | 405 GB | 203 GB |
    *   **Google Cloud A3インスタンス（a3-highgpu-8g）:** 8 x H100 80GB NVIDIA GPUs（合計約640GB VRAM）、208 vCPUs、1872 GBメモリ。
    *   **デプロイ時間:** Vertex AI上でのMeta Llama 3.1 405Bのデプロイには、リソース割り当て、モデルダウンロード（約10分）、推論用ロード（約2分）を含め、約25〜30分かかります。
    *   **使用されるHugging Face TGI DLC:** `us-docker.pkg.dev/deeplearning-platform-release/gcr.io/huggingface-text-generation-inference-cu121.2-2.ubuntu2204.py310` (TGI v2.2、Meta Llama 3.1アーキテクチャ対応)。

## 引用（Notable quotes）

*   「Meta Llama 3.1 is the latest open LLM from Meta, released in July 2024.」
*   「In this blog you will learn how to programmatically deploy meta-llama/Meta-Llama-3.1-405B-Instruct-FP8... in a Google Cloud A3 node with 8 x H100 NVIDIA GPUs on Vertex AI with Text Generation Inference (TGI) using the Hugging Face purpose-built Deep Learning Containers (DLCs) for Google Cloud.」
*   「Thanks to the Hugging Face DLCs for Text Generation Inference (TGI), and Google Cloud Vertex AI, deploying a high-performance text generation container for serving Large Language Models (LLMs) has never been easier.」

## リスクと課題

*   **高コストなハードウェア要件:** Llama 3.1 405Bのような大規模モデルは、FP8量子化版でも405GBのVRAMを必要とし、A3インスタンスのような高性能かつ高価なGPUリソースが必須となるため、運用コストが高くなる可能性があります。
*   **Google Cloudクォータ制限:** A3インスタンスは、特定の承認が必要なカスタムクォータ増加を申請する必要があり、すぐに利用できない場合や、利用可能なリージョンが限られる場合があります。
*   **モデルアクセス制限:** Meta Llama 3.1モデルはHugging Face Hubでゲートされており、利用にはアクセス承認とHugging Faceトークンの取得が必要です。
*   **デプロイ時間:** モデルのダウンロードとロードに時間がかかり、デプロイ完了までに25〜30分程度の待機時間が発生します。
*   **リソースクリーンアップの必要性:** 不要なコスト発生を避けるため、デプロイしたリソース（エンドポイント、モデル）を手動で削除する作業が不可欠です。

## 今後の見通し/アクション

*   **ユーザー向けアクション:**
    1.  Google CloudプロジェクトとVertex AIの環境をセットアップします。
    2.  A3インスタンス利用のためのGoogle Cloudクォータ増加を申請します。
    3.  Hugging Face HubでMeta Llama 3.1モデルへのアクセスをリクエストし、トークンを取得します。
    4.  Hugging Face TGI DLCsを使用して、Vertex AI Model Registryにモデルを登録します。
    5.  A3-highgpu-8gインスタンスにモデルをデプロイし、Vertex AI Endpointを作成します。
    6.  Python SDKまたはVertex AI UIを通じてオンライン予測を実行し、モデルの動作を確認します。
    7.  不要になったリソースは、コストを避けるために必ずクリーンアップします。
*   **Hugging Face / Google Cloudの今後の展開:**
    *   Hugging FaceとGoogle Cloudは、オープンモデルを活用したAI構築のためのさらなる体験を提供し続けることを表明しています。
    *   将来的には、より多くのモデルやデプロイオプションがVertex AI上で利用可能になることが期待されます。

## Source URL（必須）
https://huggingface.co/blog/llama31-on-vertex-ai
