---
title: "Introducing HUGS - Scale your AI with Open Models"
title_ja: "HUGS登場！オープンモデルAIを高速・簡単に拡張"
source_url: "https://huggingface.co/blog/hugs"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、オープンモデル向けの最適化されたゼロコンフィグ推論マイクロサービス「HUGS (Hugging Face Generative AI Services)」を発表しました。これにより、開発者は自社インフラ内でオープンモデルを活用したAIアプリケーションを、迅速かつ効率的に構築・スケールできるようになります。NVIDIA、AMD GPUなどの多様なハードウェアをサポートし、OpenAI互換APIを提供することで、デプロイの複雑さを解消し、開発時間を大幅に短縮します。

## 重要ポイント

*   **自社インフラでのデプロイ**: データとモデルをセキュアな環境に保持し、インターネットから隔離して運用可能。
*   **ゼロコンフィグレーション**: モデルとサービング設定の最適化を自動化し、デプロイ時間を数週間から数分に短縮。
*   **ハードウェア最適化**: Hugging FaceのText Generation Inference (TGI) を基盤とし、NVIDIA、AMD GPU、今後AWS Inferentia、Google TPUなど多様なハードウェアでピーク性能を発揮。
*   **OpenAI互換API**: 既存のGenerative AIアプリケーションとの連携が容易で、コード変更を最小限に抑えられる。
*   **エンタープライズ対応**: 長期サポート、厳格なテスト、SOC2準拠、必要なライセンスと利用規約を含むエンタープライズ向けディストリビューション。
*   **幅広いモデルサポート**: Llama-3.1、Mixtral、Gemma-2など、主要なオープンソースLLMを多数サポート。

## 詳細レポート

Hugging Faceは、オープンモデルを用いたAIアプリケーション開発を簡素化・加速するための新サービス「HUGS (Hugging Face Generative AI Services)」をローンチしました。これは、オープンソースのHugging Face技術（Text Generation Inference、Transformersなど）を基盤とした、最適化されたゼロコンフィグ推論マイクロサービスです。

**What happened:**
Hugging FaceがHUGSを発表し、開発者が自社インフラでオープンモデルを効率的にデプロイ・スケールできるソリューションを提供開始しました。

**背景:**
開発者や組織は、LLM推論を特定のGPUやAIアクセラレータで最適化する際のエンジニアリングの複雑さに直面していました。HUGSは、この課題を解決し、最大スループットでのデプロイをゼロコンフィグで実現します。

**影響:**
HUGSを利用することで、オープンモデルのデプロイ時間が数週間から数分に短縮され、企業は主権AI要件を満たしつつ、AIアプリケーション開発を加速できます。OpenAI互換APIにより、既存のアプリケーションからの移行も容易です。

**関係者:**
*   **提供元**: Hugging Face
*   **早期アクセス顧客**: Polyconseil (CTO Henri Jouhaud氏)、Orange (Research Engineer Ghislain Putois氏)

**データ:**
*   **提供チャネル**:
    *   AWS Marketplace
    *   Google Cloud Platform Marketplace
    *   DigitalOcean (1-Click Modelsサービスとしてネイティブ提供)
    *   Enterprise Hub (カスタムアクセス)
*   **サポートされるハードウェア**: NVIDIA GPUs, AMD GPUs (近日中にAWS Inferentia, Google TPUsをサポート予定)
*   **ローンチ時にサポートされる主要LLM (13種類)**:
    *   meta-llama/Llama-3.1-8B-Instruct
    *   meta-llama/Llama-3.1-70B-Instruct
    *   meta-llama/Llama-3.1-405B-Instruct-FP8
    *   NousResearch/Hermes-3-Llama-3.1-8B
    *   NousResearch/Hermes-3-Llama-3.1-70B
    *   NousResearch/Hermes-3-Llama-3.1-405B-FP8
    *   NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO
    *   mistralai/Mixtral-8x7B-Instruct-v0.1
    *   mistralai/Mistral-7B-Instruct-v0.3
    *   mistralai/Mixtral-8x22B-Instruct-v0.1
    *   google/gemma-2-27b-it
    *   google/gemma-2-9b-it
    *   Qwen/Qwen2.5-7B-Instruct
*   **価格**:

| 提供チャネル             | 料金                                       | 備考                                                              |
| :----------------------- | :----------------------------------------- | :---------------------------------------------------------------- |
| AWS Marketplace          | $1/時間/コンテナ                           | コンピュート利用料はCSPが別途請求。5日間の無料トライアルあり。    |
| Google Cloud Platform Marketplace | $1/時間/コンテナ                           | コンピュート利用料はCSPが別途請求。                               |
| DigitalOcean             | 追加費用なし                               | GPU Dropletsのコンピュート費用は別途発生。                        |
| Enterprise Hub           | カスタム料金                               | 営業チームに問い合わせ。                                          |

## 引用（Notable quotes）

*   **Henri Jouhaud氏 (Polyconseil CTO)**:
    「HUGSは、高性能なモデルをローカルにデプロイする時間を大幅に節約してくれる。以前は1週間かかっていたのが、今では1時間未満で完了する。主権AI要件を持つ顧客にとっては画期的なものだ！」
*   **Ghislain Putois氏 (Orange Research Engineer)**:
    「HUGSを使ってGCPのL4 GPUにGemma 2をデプロイしたが、ライブラリやバージョン、パラメータをいじる必要がなく、すぐに動作した。HUGSはオープンモデルの社内利用をスケールできるという自信を与えてくれる！」

## リスクと課題

HUGS自体に明示的なリスクは記載されていません。HUGSが解決する主な課題は、開発者や組織が直面する「LLM推論ワークロードを特定のGPUやAIアクセラレータで最適化する際のエンジニアリングの複雑さ」です。HUGSは、この複雑さをゼロコンフィグレーションと最適化されたデプロイメントによって解消します。利用には、適切なサブスクリプションまたはマーケットプレイスへのアクセスが必要です。

## 今後の見通し/アクション

*   **今後の見通し**:
    *   Microsoft Azureでのサポートを近日中に開始予定。
    *   AWS InferentiaおよびGoogle TPUsへのサポートを拡大予定。
*   **アクション**:
    *   AWS、Google Cloud、DigitalOceanの各マーケットプレイスを通じてHUGSの利用を開始できます。
    *   Enterprise Hubをご利用の組織は、Hugging Faceの営業チームに連絡してHUGSへのアクセスをリクエストしてください。

## Source URL（必須）
https://huggingface.co/blog/hugs
