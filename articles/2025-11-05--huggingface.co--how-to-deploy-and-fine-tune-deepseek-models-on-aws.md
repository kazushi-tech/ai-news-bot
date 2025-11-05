---
title: "How to deploy and fine-tune DeepSeek models on AWS"
title_ja: "AWSでDeepSeekモデルをデプロイ、ファインチューニング"
source_url: "https://huggingface.co/blog/deepseek-r1-aws"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、DeepSeek AIがオープンソース化した高性能な推論モデル「DeepSeek-R1」とその蒸留モデルを、AWS上でデプロイおよびファインチューニングするための詳細なガイドを公開しました。開発者はHugging Face Inference Endpoints、Amazon Bedrock、Amazon SageMaker AI、EC2 Neuronといった多様なAWSサービスを通じて、これらのモデルを容易に利用し、生成AIアプリケーション開発に活用できます。特にSageMakerでは、GPUおよびNeuronインスタンス（Inferentia/Trainium）でのデプロイ方法が具体的に示されていますが、一部の機能（DeepSeek-R1のSageMaker GPUデプロイやファインチューニング）は現在開発中です。

## 重要ポイント
*   **DeepSeek-R1の登場**: OpenAIのo1モデルに匹敵する推論能力を持つオープンソースLLM「DeepSeek-R1」とそのLlama/Qwenベースの蒸留モデルがDeepSeek AIによって公開されました。
*   **AWSとの連携強化**: Hugging FaceとAWSの協力により、開発者はDeepSeekモデルをAWS上で容易にデプロイ・利用できるようになりました。
*   **多様なデプロイオプション**:
    *   **Hugging Face Inference Endpoints**: 数クリックで簡単にデプロイ可能（DeepSeek R1は$8.3/時間）。
    *   **Amazon Bedrock Marketplace**: DeepSeek蒸留モデルをSageMaker AIのエンドポイントとしてデプロイ。
    *   **Amazon SageMaker AI**: Hugging Face LLM DLCsを使用し、GPUおよびNeuronインスタンス（Inferentia/Trainium）で蒸留モデルをデプロイ可能。
    *   **EC2 Neuron**: Hugging Face Neuron Deep Learning AMIを使用して直接EC2インスタンスにデプロイ。
*   **ファインチューニングは開発中**: DeepSeekモデルのファインチューニング機能は、SageMaker AIおよびEC2 Neuronの両方で現在開発中です。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、DeepSeek AIが公開したDeepSeek-R1モデルとその蒸留版をAWS上でデプロイおよびファインチューニングするための包括的なガイドをブログ記事で発表しました。このガイドは、開発者が最新の高性能LLMをAWS環境で活用するための具体的な手順を提供します。
*   **背景**: OpenAIのo1モデルは、推論時に計算量を増やすことで数学、コーディング、論理などの推論タスクにおいてLLMの性能が大幅に向上することを示しました。DeepSeek AIは、この「思考時間延長」の概念を具現化したDeepSeek-R1モデルをオープンソース化し、DeepSeek-R1-Zero、DeepSeek-R1、およびLlama/Qwenアーキテクチャに基づく6つの蒸留モデルをリリースしました。Hugging Faceは、AWSとの連携を通じて、これらの画期的なモデルを開発者がAWSサービス上で容易に利用できるようにするための支援を行っています。
*   **影響**: 開発者は、DeepSeek-R1モデルの優れた推論能力を、Hugging Face Inference Endpoints、Amazon Bedrock、Amazon SageMaker AI、EC2 Neuronといった多様なAWSサービス上で迅速に利用できるようになります。これにより、生成AIアプリケーションの開発が加速され、より高度な推論タスクを伴うソリューションの実装が可能になります。特にSageMakerでは、GPUおよびNeuronインスタンス（Inferentia/Trainium）を活用した高性能なデプロイが実現します。
*   **関係者**:
    *   **DeepSeek AI**: DeepSeek-R1モデルとその蒸留モデルの開発元。
    *   **Hugging Face**: モデルハブの提供、Hugging Face Inference Endpoints、LLM DLCs、Neuron Deep Learning AMIなど、AWS上でのモデル利用を容易にするツールとガイドを提供。
    *   **Amazon Web Services (AWS)**: クラウドインフラストラクチャ、Amazon Bedrock、Amazon SageMaker AI、EC2 Neuronなどのサービスを提供。
*   **データ**:
    *   **DeepSeek-R1モデルのデプロイコスト**: Hugging Face Inference EndpointsでDeepSeek R1をデプロイする場合、約$8.3/時間。
    *   **SageMaker AIでのDeepSeek蒸留モデル推奨ハードウェア構成**:

| Model                                   | Instance Type      | # of GPUs per replica |
| :-------------------------------------- | :----------------- | :-------------------- |
| deepseek-ai/DeepSeek-R1-Distill-Llama-70B | ml.g6.48xlarge     | 8                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | ml.g6.12xlarge     | 4                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | ml.g6.12xlarge     | 4                     |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ml.g6.2xlarge      | 1                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B  | ml.g6.2xlarge      | 1                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ml.g6.2xlarge      | 1                     |

## 引用（Notable quotes）
*   「If you’ve ever struggled with a tough math problem, you know how useful it is to think a little longer and work through it carefully. OpenAI’s o1 model showed that when LLMs are trained to do the same—by using more compute during inference—they get significantly better at solving reasoning tasks like mathematics, coding, and logic.」
*   「We collaborate with Amazon Web Services to make it easier for developers to deploy the latest Hugging Face models on AWS services to build better generative AI applications.」

## リスクと課題
*   **機能開発の遅延**: DeepSeek-R1モデルのAmazon SageMaker AI (GPU)へのデプロイ、Inferentiaインスタンスへのデプロイ、および全てのDeepSeekモデルのファインチューニング機能（SageMaker AIおよびEC2 Neuron）は現在開発中であり、利用可能になるまで待機が必要です。
*   **リソース要件**: 一部のモデル（例: DeepSeek-R1-Distill-Llama-70B）をSageMakerでデプロイするには、`ml.g6.48xlarge`や`ml.inf2.48xlarge`などの高性能インスタンスタイプに対するクォータの引き上げが必要となる場合があります。
*   **AMIの購読**: EC2 Neuronでのデプロイには、Hugging Face Neuron Deep Learning AMIのマーケットプレイスからの購読が前提となります。

## 今後の見通し/アクション
*   Hugging FaceとAWSは、現在開発中の機能（DeepSeek-R1のSageMaker GPUデプロイ、Inferentiaインスタンスへのデプロイ、全てのDeepSeekモデルのファインチューニング機能）を順次リリースする予定です。
*   開発者は、既存のデプロイオプション（Hugging Face Inference Endpoints、Amazon Bedrock、SageMaker GPU/Neuronインスタンスでの蒸留モデルデプロイ、EC2 Neuron）を活用してDeepSeekモデルの利用を開始できます。
*   最新の機能アップデートについては、Hugging FaceのブログやAWSのアナウンスを継続的に確認することが推奨されます。

## Source URL（必須）
https://huggingface.co/blog/deepseek-r1-aws
