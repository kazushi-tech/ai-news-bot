---
title: "Build AI on premise with Dell Enterprise Hub"
title_ja: "デル、Dell Enterprise HubでオープンモデルのオンプレミスAI構築を容易に"
source_url: "https://huggingface.co/blog/dell-enterprise-hub"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging FaceはDell Technologiesとの提携に基づき、「Dell Enterprise Hub」を発表しました。これは、企業がオープンモデルをDellプラットフォーム上でオンプレミスで簡単にトレーニングおよびデプロイできる新しいサービスです。セキュリティ、コンプライアンス、プライバシー要件を満たしながら、大規模言語モデル（LLM）のオンプレミス導入に伴う複雑なエンジニアリング作業を数週間から数分に短縮します。

## 重要ポイント

*   **オンプレミスAIの簡素化**: 企業がオープンモデルをDellプラットフォーム上でオンプレミスで容易にデプロイ・トレーニングできる。
*   **セキュリティ・プライバシーの確保**: 企業独自のセキュアなIT環境内でAIシステムを構築し、顧客データや機密情報を保護。
*   **主要オープンモデルのキュレーション**: MetaのLlama 3、Mistral AIのMixtral、GoogleのGemmaなど、厳選された最先端オープンモデルを提供。
*   **Dellプラットフォームへの最適化**: 各Dellプラットフォームのハードウェア、メモリ、接続性に合わせてデプロイ・トレーニング設定を最適化。
*   **既存モデルの持ち込み（BYOM）**: 企業が独自にトレーニングしたモデルやファインチューニングしたモデルもオンプレミスでデプロイ可能。
*   **OpenAI互換API**: デプロイされたモデルはOpenAI互換のMessages APIで利用でき、既存プロトタイプからの移行を容易にする。

## 詳細レポート

**What happened:**
Hugging Faceは、Dell Technologiesとの協業の一環として「Dell Enterprise Hub」を発表しました。これにより、企業はHugging Face上でDellプラットフォームを利用し、オープンモデルをオンプレミスで簡単にトレーニングおよびデプロイできるようになります。

**背景:**
企業はセキュリティ、コンプライアンス、プライバシーの要件を満たすため、AIシステムをオンプレミスで構築する必要があります。オープンモデルは、企業がAI機能を理解、所有、制御し、セキュアなIT環境内でホストできるため、これらの要件を満たす最良のソリューションとされています。しかし、LLMをオンプレミスインフラストラクチャで扱う場合、コンテナ、並列処理、量子化、メモリ不足エラーなど、数週間にわたる試行錯誤とエンジニアリング作業が必要となることが課題でした。

**Dell Enterprise Hubの機能と影響:**
Dell Enterprise Hubは、これらの課題を解決し、オンプレミスでのLLM導入を簡素化します。

*   **モデルの提供**: Llama 3、Mixtral、Gemmaなど、厳選された最先端のオープンモデルを提供。Hugging Faceアカウントがあればアクセス可能で、モデルのライセンスやサイズでフィルタリングできます。
*   **企業向けモデルカード**: 各モデルには、サイズ、対応Dellプラットフォームなどの主要情報を含む包括的なモデルカードが用意されています。Hugging Faceアカウントの権限が引き継がれるため、モデルへのアクセス許可は一度で済みます。
*   **簡単なデプロイ**: サポートされるDellプラットフォームと使用するGPU数を指定するだけで、提供されるスクリプトをDell環境で実行すれば、モデルがAPIエンドポイントとして利用可能になります。Hugging Faceは各Dellプラットフォーム向けに最適化されたデプロイ設定を提供し、定期的にテストしています。
*   **簡単なトレーニング（ファインチューニング）**: 企業固有の機密データを含むトレーニングデータを用いてモデルをファインチューニングすることで、特定のドメインやユースケースでのパフォーマンスを向上させます。オンプレミスでファインチューニングを行うことで、データが企業外に出るのを防ぎます。トレーニングデータセットのローカルパスとファインチューニングモデルのアップロード先を指定するだけで実行できます。
*   **BYOM（Bring Your Own Model）**: 独自にトレーニングしたモデルや、Dell Enterprise Hubでファインチューニングしたモデルも、セキュアなオンプレミス環境内でデプロイできます。
*   **OpenAI互換API**: デプロイされたモデルはOpenAI互換のMessages APIで呼び出し可能であり、OpenAIで構築されたプロトタイプからセキュアなオンプレミス環境への移行を容易にします。

**関係者:**
*   **Hugging Face**: Dell Enterprise Hubのプラットフォーム提供、モデルのキュレーション、Dellプラットフォームへの最適化。
*   **Dell Technologies**: オンプレミスAIプラットフォームの提供。
*   **Meta, Mistral AI, Google**: Llama 3, Mixtral, Gemmaなどのオープンモデル提供元。
*   **NVIDIA, AMD, Intel Gaudi**: Dellプラットフォームに搭載されるAIハードウェアアクセラレータの提供元。

**データ:**
「数週間のエンジニアリング作業を数分に短縮 (reducing weeks of engineering work into minutes)」。

## 引用（Notable quotes）

*   "Enterprises need to build AI with open models"
*   "Dell Enterprise Hub: On-Premise LLMs made easy"
*   "reducing weeks of engineering work into minutes."
*   "Fine-tuned open models have been shown to outperform the best available closed models like GPT-4"

## リスクと課題

Dell Enterprise Hubは、従来のオンプレミスLLM導入における技術的な複雑さ（コンテナ管理、並列処理、量子化、メモリ不足エラーなど）という主要な課題を解決することを目指しています。これにより、企業がセキュリティ、コンプライアンス、プライバシー要件を満たしながら、オープンモデルを迅速かつ効率的に導入・活用できるようになります。記事本文に直接的なリスクの記述はありませんが、オンプレミス環境の維持管理、ハードウェアコスト、専門知識の必要性は引き続き考慮すべき点です。

## 今後の見通し/アクション

Dell Enterprise Hubは、Dell Technologiesとの協業発表から6ヶ月でのリリースとなります。Hugging Faceは、NVIDIA (optimum-nvidia)、AMD (optimum-amd)、Intel (optimum-intelおよびoptimum-habana) とのエンジニアリング協業を通じて、NVIDIA、AMD、Intel GaudiのAIハードウェアアクセラレータを搭載したDellプラットフォーム向けに、さらに最適化されたコンテナを提供していく予定です。今後、より多くの最先端オープンモデルとDellプラットフォームへのサポート拡大を目指しています。

## Source URL

https://huggingface.co/blog/dell-enterprise-hub
