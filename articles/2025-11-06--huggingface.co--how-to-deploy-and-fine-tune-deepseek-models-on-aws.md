---
title: "How to deploy and fine-tune DeepSeek models on AWS"
title_ja: "DeepSeekモデル、AWSでデプロイ・ファインチューン術"
source_url: "https://huggingface.co/blog/deepseek-r1-aws"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
DeepSeek AIが推論能力に優れた大規模言語モデル「DeepSeek-R1」とその蒸留モデルをオープンソース化しました。Hugging FaceとAWSは協力し、開発者がこれらのDeepSeekモデルをAWS上で簡単にデプロイし、将来的にはファインチューニングできるよう、複数のサービス（Hugging Face Inference Endpoints, Amazon Bedrock Marketplace, Amazon SageMaker AI, EC2 Neuron）を通じた具体的な手順とツールを提供しています。

## 重要ポイント
*   **DeepSeek-R1のオープンソース化**: OpenAIのo1モデルに匹敵する推論能力を持つDeepSeek-R1およびその蒸留モデルが公開されました。
*   **AWSとの連携強化**: Hugging FaceはAWSと協力し、DeepSeekモデルのAWS上での利用を容易にしています。
*   **多様なデプロイオプション**: Hugging Face Inference Endpoints、Amazon Bedrock Marketplace、Amazon SageMaker AI、EC2 Neuronなど、複数のAWSサービスでDeepSeekモデルを展開可能です。
*   **具体的なデプロイガイド**: 各サービスでのデプロイ手順（コードスニペット、推奨ハードウェア設定など）が詳細に解説されています。
*   **ファインチューニング機能は開発中**: SageMaker AIおよびEC2 Neuronでのファインチューニング機能は現在開発中です。

## 詳細レポート
### What happened
DeepSeek AIが、高度な推論能力を持つ大規模言語モデル「DeepSeek-R1」とその蒸留モデル（DeepSeek-R1-Zero、DeepSeek-R1、LlamaおよびQwenアーキテクチャに基づく6つの蒸留モデル）をオープンソースとして公開しました。これを受け、Hugging FaceはAmazon Web Services (AWS) と連携し、開発者がこれらのDeepSeekモデルをAWSの各種サービス上で容易にデプロイおよびファインチューニングできる方法を公開しました。

### 背景
OpenAIの「o1」モデルが推論時に計算リソースを多く使用することで、数学、コーディング、論理などのタスクで大幅な性能向上を示す中、その手法は秘匿されていました。DeepSeek-R1は、この「より長く考える」アプローチを取り入れ、そのレシピをオープンソースとして公開することで、AIコミュニティに大きな影響を与えました。Hugging Faceは、最新のオープンモデルをAWS上で利用しやすくすることを目指し、今回の連携に至りました。

### 影響
開発者は、DeepSeek-R1の強力な推論能力を、Hugging FaceのツールとAWSのインフラストラクチャを活用して、より迅速かつ効率的に生成AIアプリケーションに組み込むことが可能になります。特に、Hugging Face Inference Endpointsを利用すれば、インフラ管理なしで数クリックでデプロイでき、コスト削減やセキュリティ強化も実現できます。

### 関係者
*   **DeepSeek AI**: DeepSeek-R1モデルの開発元。
*   **Hugging Face**: DeepSeekモデルの提供、AWS上でのデプロイ・ファインチューニングツールとガイドの提供。
*   **Amazon Web Services (AWS)**: DeepSeekモデルをホスト・実行するためのクラウドインフラストラクチャとサービス（Inference Endpoints, Bedrock Marketplace, SageMaker AI, EC2 Neuron）の提供。

### データ
DeepSeek蒸留モデルのSageMaker AIにおける推奨ハードウェア構成は以下の通りです。

| Model                                   | Instance Type      | # of GPUs per replica |
| :-------------------------------------- | :----------------- | :-------------------- |
| deepseek-ai/DeepSeek-R1-Distill-Llama-70B | ml.g6.48xlarge     | 8                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | ml.g6.12xlarge     | 4                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | ml.g6.12xlarge     | 4                     |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ml.g6.2xlarge      | 1                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B  | ml.g6.2xlarge      | 1                     |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ml.g6.2xlarge      | 1                     |

## 引用（Notable quotes）
「私たちはAmazon Web Servicesと協力し、開発者が最新のHugging FaceモデルをAWSサービスにデプロイし、より優れた生成AIアプリケーションを構築することを容易にしています。」

## リスクと課題
*   **DeepSeek-R1のGPUデプロイ**: Amazon SageMaker AIでのDeepSeek-R1（非蒸留版）のGPUデプロイは現在開発中です。
*   **NeuronインスタンスでのR1デプロイ**: Hugging Face Neuron Deep Learning AMIを使用したTrainiumおよびInferentiaでのDeepSeek R1デプロイは現在開発中です。
*   **ファインチューニング機能**: Amazon SageMaker AIのHugging Face Training DLCsおよびEC2 NeuronのHugging Face Neuron Deep Learning AMIを使用したDeepSeekモデルのファインチューニング機能は、いずれも現在開発中です。

## 今後の見通し/アクション
Hugging FaceとAWSは、DeepSeekモデルのAWS上での利用体験をさらに向上させるため、現在開発中の機能（DeepSeek-R1のGPUデプロイ、NeuronインスタンスでのR1デプロイ、全DeepSeekモデルのファインチューニング機能）の提供に向けて取り組んでいます。ユーザーは、Hugging Face Inference Endpoints、Amazon Bedrock Marketplace、Amazon SageMaker AI (蒸留モデル)、EC2 Neuron (蒸留モデル) を利用して、DeepSeekモデルのデプロイをすぐに開始できます。

## Source URL
https://huggingface.co/blog/deepseek-r1-aws
