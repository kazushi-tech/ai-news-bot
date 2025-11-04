---
title: "Deploy Meta Llama 3.1 405B on Google Cloud Vertex AI"
title_ja: ""
source_url: "https://huggingface.co/blog/llama31-on-vertex-ai"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
本記事は、Metaが2024年7月にリリースした最新のオープンLLM「Meta Llama 3.1 405B-Instruct-FP8」を、Google Cloud Vertex AIのA3インスタンス（8x NVIDIA H100 GPU）にデプロイし、オンライン予測を実行する手順を解説しています。Hugging FaceのText Generation Inference (TGI) 用Deep Learning Containers (DLCs) を活用することで、大規模なLLMの高性能な推論環境を容易に構築できることを示しています。

## 重要ポイント
*   **Meta Llama 3.1のリリース**: 2024年7月にMetaからリリースされた最新のオープンLLM。8B、70B、405Bの3サイズがあり、128Kトークンの長いコンテキスト長、多言語対応、ツール利用、より寛容なライセンスが特徴。
*   **Vertex AIでのデプロイ**: Google CloudのVertex AIプラットフォームを利用し、Hugging Face HubからMeta Llama 3.1 405B-Instruct-FP8モデルをデプロイ。
*   **高性能ハードウェアの活用**: デプロイには、8x H100 80GB NVIDIA GPUを搭載したGoogle Cloud A3インスタンスを使用。FP8量子化により、405Bモデルを単一ノードで効率的に実行。
*   **Hugging Face TGI DLCsの利用**: Hugging Faceが提供するText Generation Inference (TGI) 用のDeep Learning Containers (DLCs) を活用し、高性能なテキスト生成コンテナを簡単に構築。
*   **デプロイと予測の実行**: モデルの登録、エンドポイントへのデプロイ、Python SDKまたはVertex AI UIを通じたオンライン予測の実行方法を具体的に解説。

## 詳細レポート
### What happened/背景
Metaは2024年7月に、最新のオープン大規模言語モデル（LLM）であるMeta Llama 3.1をリリースしました。このモデルは、8B、70B、405Bの3つのサイズで提供され、特に405Bモデルは合成データ生成、LLM as a Judge、蒸留などの高度なユースケースを想定しています。Llama 3.1の主な特徴は、128Kトークンという大幅に拡張されたコンテキスト長、多言語対応、ツール利用能力、そしてより寛容なライセンスです。

本記事では、このMeta Llama 3.1 405B-Instruct-FP8（FP8量子化版）を、Google Cloudの機械学習プラットフォームであるVertex AIにデプロイする方法を詳細に説明しています。具体的には、8基のNVIDIA H100 GPUを搭載したGoogle Cloud A3ノード上で、Hugging Faceが提供するText Generation Inference (TGI) 用のDeep Learning Containers (DLCs) を使用して、プログラム的にデプロイする手順が示されています。これにより、ユーザーは高性能なLLMをGoogle Cloud上で容易に利用できるようになります。

### 影響
*   **大規模LLMの利用促進**: Meta Llama 3.1 405Bのような非常に大規模なオープンLLMを、Google Cloudの高性能インフラ上で効率的にデプロイし、リアルタイム推論に利用できる道が開かれました。
*   **開発効率の向上**: Hugging FaceのTGI DLCとVertex AIの組み合わせにより、LLMのデプロイとサービングのプロセスが簡素化され、開発者はモデルの運用よりもアプリケーション開発に集中できるようになります。
*   **コスト効率の改善**: FP8量子化とA3インスタンスの活用により、大規模モデルのVRAM要件が最適化され、コスト効率の良い推論が可能になります。

### 関係者
*   **Meta**: Meta Llama 3.1モデルの開発元。
*   **Hugging Face**: Meta Llama 3.1モデルをHugging Face Hubで提供し、Vertex AIでのデプロイを可能にするText Generation Inference (TGI) 用Deep Learning Containers (DLCs) を開発。
*   **Google Cloud**: Vertex AIプラットフォーム、A3 GPUインスタンスなどのクラウドインフラを提供し、大規模LLMのデプロイと運用をサポート。

### データ
#### Meta Llama 3.1モデルのVRAM要件

| Model Size | FP16  | FP8   | INT4  |
| :--------- | :---- | :---- | :---- |
| 8B         | 16 GB | 8 GB  | 4 GB  |
| 70B        | 140 GB| 70 GB | 35 GB |
| 405B       | 810 GB| 405 GB| 203 GB|

*   **A3インスタンスのスペック**: 8 x H100 80GB NVIDIA GPUs (合計約640GB VRAM), 208 vCPUs, 1872 GBメモリ。
*   **デプロイ時間**: Meta Llama 3.1 405BのVertex AIへのデプロイには約25〜30分かかります。これには、Google Cloudリソースの割り当て、Hugging Face Hubからのウェイトダウンロード（約10分）、TGIへのモデルロード（約2分）が含まれます。
*   **クォータ要件**: A3 High GPUマシンタイプを使用するには、以下のVertex AI APIクォータを増やす必要があります。
    *   Custom model serving Nvidia H100 80GB GPUs per region: 8
    *   Custom model serving A3 CPUs per region: 208

## 引用（Notable quotes）
*   「Hugging FaceのText Generation Inference (TGI) 用DLCとGoogle Cloud Vertex AIのおかげで、大規模言語モデル (LLM) を提供するための高性能テキスト生成コンテナのデプロイがかつてないほど容易になりました。」
*   「私たちはここで止まるつもりはありません。Google Cloud上でオープンモデルを使ってAIを構築するための、より多くの体験を提供できるよう、ご期待ください！」

## リスクと課題
*   **ハードウェア要件**: Meta Llama 3.1 405Bモデル（FP8で約400GB VRAM）の推論には、A3インスタンスのような高性能かつ高VRAMのGPUリソースが必須です。
*   **クォータ申請**: A3マシンタイプは特定の承認が必要なため、Google Cloudでカスタムクォータの増加を事前にリクエストする必要があります。また、A3マシンは一部のゾーンでのみ利用可能です。
*   **モデルアクセス**: Meta Llama 3.1モデルはHugging Face Hubでゲートされており、アクセス申請と承認が必要です。
*   **デプロイ時間**: モデルのデプロイには、リソースの割り当てや大規模なモデルウェイトのダウンロードのため、約25〜30分かかります。
*   **コスト管理**: デプロイされたリソース（エンドポイント、モデルなど）は、使用しない場合は不要なコストを避けるために適切にクリーンアップする必要があります。

## 今後の見通し/アクション
*   Hugging FaceとGoogle Cloudは、Google Cloudプラットフォーム上でオープンモデルを活用したAI構築のためのさらなる機能や体験を提供していく予定です。
*   ユーザーは、本記事で示された手順に従い、Meta Llama 3.1 405BをVertex AIにデプロイし、自身のAIアプリケーションに統合することが推奨されます。
*   不要なコストを避けるため、デプロイしたリソースは使用後に必ずクリーンアップする手順を実行する必要があります。

## Source URL
https://huggingface.co/blog/llama31-on-vertex-ai
