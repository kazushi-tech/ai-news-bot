---
title: "How to deploy and fine-tune DeepSeek models on AWS"
title_ja: ""
source_url: "https://huggingface.co/blog/deepseek-r1-aws"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceとAWSは、推論能力に優れたオープンソースLLM「DeepSeek-R1」モデルをAWS上でデプロイおよびファインチューニングする方法を公開しました。開発者はHugging Face Inference Endpoints、Amazon Bedrock、Amazon SageMaker AI（GPU/Neuron）、およびEC2 Neuronといった多様なAWSサービスを通じて、DeepSeek-R1とその蒸留モデルを利用できます。特に、SageMaker AIではPython SDKを用いた詳細なデプロイ手順が提供されています。

## 重要ポイント
*   **DeepSeek-R1のオープンソース化**: DeepSeek AIは、推論時に多くの計算リソースを使用することで数学、コーディング、論理などのタスク解決能力が向上するLLM「DeepSeek-R1」とその蒸留モデル（DeepSeek-R1-Zero、Llama/Qwenベースの6モデル）をオープンソース化しました。
*   **AWS上でのデプロイとファインチューニング**: Hugging FaceとAWSが協力し、DeepSeekモデルをAWSサービス（Inference Endpoints, Bedrock, SageMaker AI, EC2 Neuron）上で容易にデプロイ・ファインチューニングできる環境を提供しています。
*   **多様なデプロイオプション**:
    *   Hugging Face Inference Endpoints: 簡単かつセキュアな本番環境デプロイ（DeepSeek-R1の蒸留モデル、量子化バージョン）。
    *   Amazon Bedrock Marketplace: DeepSeek蒸留モデルのデプロイ。
    *   Amazon SageMaker AI: Hugging Face LLM DLCsを使用し、GPUまたはNeuronインスタンスに蒸留モデルをデプロイ可能。
    *   EC2 Neuron: Hugging Face Neuron Deep Learning AMIを使用し、Neuronインスタンスにデプロイ可能。
*   **開発中の機能**: DeepSeek-R1のSageMaker AI (GPU) デプロイ、Inferentiaインスタンスへのデプロイ、および全DeepSeekモデルのファインチューニング機能は現在開発中です。

## 詳細レポート
### What happened
DeepSeek AIが推論能力に特化した大規模言語モデル「DeepSeek-R1」とその派生モデルをオープンソースとして公開しました。これを受け、Hugging FaceとAmazon Web Services (AWS) は協力し、これらのDeepSeekモデルをAWSの各種サービス上でデプロイおよびファインチューニングするための詳細なガイドとツールを提供しました。

### 背景
OpenAIの「o1」モデルが推論時に計算リソースを増やすことで数学やコーディングなどのタスク解決能力を大幅に向上させることを示した後、その「レシピ」は秘密とされていました。DeepSeek AIは、この推論能力に焦点を当てたDeepSeek-R1モデルをオープンソース化することで、この分野の技術を広く利用可能にしました。Hugging FaceとAWSは、開発者が最新の生成AIアプリケーションを構築できるよう、これらのモデルをAWS上で容易に利用できる環境を整備しています。

### 影響
開発者はDeepSeek-R1とその蒸留モデルをAWSの堅牢なインフラストラクチャ上で利用できるようになり、特に推論タスクを必要とするAIアプリケーションの開発が加速されます。これにより、より高度な数学、コーディング、論理的推論が可能なAIシステムの構築が促進されると期待されます。

### 関係者
*   **DeepSeek AI**: DeepSeek-R1モデルの開発元。
*   **Hugging Face**: モデルハブ、Inference Endpoints、LLM DLCs、Neuron Deep Learning AMIなど、AWS上でのモデル利用を支援するツールとサービスを提供。
*   **Amazon Web Services (AWS)**: クラウドインフラストラクチャ、SageMaker AI、Bedrock、EC2 Neuronなどのサービスを提供。

### データ
*   **Hugging Face Inference EndpointsでのDeepSeek R1利用料金**: $8.3/時間
*   **SageMaker AIでのDeepSeek蒸留モデル推奨ハードウェア構成**:

| Model                                   | Instance Type   | # of GPUs per replica |
| :-------------------------------------- | :-------------- | :-------------------- |
| deepseek-ai/DeepSeek-R1-Distill-Llama-70B | ml.g6.48xlarge  | 8                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | ml.g6.12xlarge  | 4                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | ml.g6.12xlarge  | 4                     |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ml.g6.2xlarge   | 1                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B  | ml.g6.2xlarge   | 1                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ml.g6.2xlarge   | 1                     |

## 引用（Notable quotes）
（該当する引用はありませんでした。）

## リスクと課題
*   **機能の未実装**: DeepSeek-R1のAmazon SageMaker AI (GPU) デプロイ、Inferentiaインスタンスへのデプロイ、Trainium/InferentiaでのEC2 Neuronデプロイ、および全DeepSeekモデルのファインチューニング機能は現在開発中であり、すぐに利用できない可能性があります。
*   **リソース要件**: 大規模なDeepSeekモデルをデプロイ・運用するには、適切なAWSクォータの確保と、ml.g6.48xlargeやml.inf2.48xlargeのような高性能インスタンスタイプが必要です。

## 今後の見通し/アクション
*   Hugging FaceとAWSは、InferentiaインスタンスへのDeepSeekモデルデプロイ、SageMaker AIでのDeepSeek-R1デプロイ、Trainium & InferentiaでのEC2 Neuronデプロイ、および全DeepSeekモデルのファインチューニング機能の提供に向けて開発を継続します。
*   開発者は、既存のHugging Face Inference EndpointsやSageMaker SDKを活用して、DeepSeekの蒸留モデルをAWS上でデプロイし、生成AIアプリケーションに組み込むことができます。

## Source URL
https://huggingface.co/blog/deepseek-r1-aws
