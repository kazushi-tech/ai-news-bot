---
title: "Welcome Gemma 2 - Google’s new open LLM"
title_ja: ""
source_url: "https://huggingface.co/blog/gemma2"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Googleは、最先端のオープンLLMファミリーの最新版「Gemma 2」をリリースしました。90億（9B）と270億（27B）パラメータの2つのモデルサイズで提供され、それぞれベースモデルと指示チューニング版があります。初代Gemmaの約2倍のデータで学習され、スライディングウィンドウアテンション、Logitソフトキャッピング、知識蒸留、モデルマージといった技術的進歩を特徴としています。主要なベンチマークで高い性能を示し、Hugging Faceエコシステム（Transformers、TRL、Inference Endpoints）との深い統合が提供されます。商用利用可能な許容的なライセンスで提供され、オープンソースAIコミュニティに大きな影響を与えることが期待されます。

## 重要ポイント

*   **Googleの最新オープンLLM「Gemma 2」リリース**: 9Bと27Bの2つのモデルサイズ（ベースと指示チューニング版）で提供。
*   **大規模な学習データ**: 27B版は13兆トークン、9B版は8兆トークンで学習され、初代Gemmaの約2倍のデータ量。
*   **主要な技術的進歩**:
    *   **スライディングウィンドウアテンション**: 長文コンテキストでの品質と効率を両立。
    *   **Logitソフトキャッピング**: トレーニングの安定性を向上。
    *   **知識蒸留**: 9Bモデルの事前学習と全モデルの事後学習に利用。
    *   **モデルマージ**: Warpという新しい3段階手法で性能を向上。
*   **競争力のある性能**: 主要ベンチマークでLlama 3 8B/70B、Mistral 7B、Qwen 1.5 32Bなどと比較して優れた結果。
*   **Hugging Faceエコシステムとの深い統合**: Hugging Face Hubでのモデル提供、Transformers、🤗 TRL、Inference Endpoints、Hugging Chatでのサポート。
*   **商用利用可能なライセンス**: 再配布、ファインチューニング、商用利用、派生作品が許可される許容的なライセンス。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Googleは、オープンLLMの最新世代であるGemma 2を発表し、Hugging Faceエコシステムとの緊密な連携を通じて、その利用を促進しています。Gemma 2は、90億と270億パラメータの2つのサイズで提供され、それぞれ事前学習済み（ベース）モデルと指示チューニング済みモデルがHugging Face Hubで公開されています。Hugging Face Transformers、🤗 TRL、Inference Endpointsなどのツールとの統合が同時にリリースされ、開発者がGemma 2を容易に利用、ファインチューニング、デプロイできるようになりました。

**背景:**
Gemma 2は、Google DeepMindのGeminiをベースとしており、初代Gemmaの成功を踏まえ、より大規模な学習データと先進的な技術を導入することで、性能と効率の向上を目指しました。オープンソースAIコミュニティへの貢献と、高性能なオープンLLMへの需要に応えることが開発の背景にあります。

**影響:**
Gemma 2のリリースは、オープンソースLLMの選択肢を広げ、開発者が最先端のモデルを商用利用可能なライセンスで利用できる機会を提供します。Hugging Faceエコシステムとの深い統合により、モデルの利用、カスタマイズ、デプロイが簡素化され、AIアプリケーション開発の加速に貢献します。

**関係者:**
*   **Google (DeepMind)**: Gemma 2の開発とリリース。
*   **Hugging Face**: Gemma 2のHugging Faceエコシステムへの統合（Transformers、TRL、Inference Endpoints、Hugging Chatなど）。
*   **コミュニティ貢献者**: LLM評価、Text Generation Inferenceサポート、Transformers統合、Hugging Chat統合など、多岐にわたる貢献。

**データ:**
*   **モデルサイズ**: 90億 (9B) および 270億 (27B) パラメータ。それぞれベースモデルと指示チューニング版が存在。
*   **コンテキスト長**: 8Kトークン。
*   **学習データ**: 27B版は13兆トークン、9B版は8兆トークン（主に英語のウェブデータ、コード、数学）で学習。これは初代Gemmaの約2倍のデータ量に相当します。
*   **ライセンス**: 初代Gemmaと同じ許容的なライセンスで、再配布、ファインチューニング、商用利用、派生作品が許可されています。

**技術的進歩:**
Gemma 2は、初代Gemmaと比較して以下の4つの主要な技術的進歩を遂げています。
*   **Sliding window attention**: トランスフォーマーモデルのアテンション計算のメモリと時間要件を削減する手法。Gemma 2では、偶数層でスライディングウィンドウアテンション（4096トークン）、奇数層でフルクアドラティックグローバルアテンション（8192トークン）を交互に適用することで、長文コンテキストにおける品質と効率を両立しています。
*   **Logit soft-capping**: Logitが過度に大きくなるのを防ぎ、トレーニングを安定させる技術。Logitを最大値で割ってtanh層を通し、再び最大値を掛けることで、Logitを固定範囲に収めます。最終層と全てのアテンション層に適用され、アテンションLogitは50.0、最終Logitは30.0でキャップされます。
*   **Knowledge Distillation**: より大きな教師モデル（9Bモデルの事前学習、全モデルの事後学習に利用。教師モデルはGemini Ultraと推測）の振る舞いを模倣するように、より小さな学生モデルをトレーニングする手法。Gemma 2では、学生モデルが生成した補完と教師モデルのLogit間のKLダイバージェンスを最小化する「オンポリシー蒸留」を導入し、train-inference mismatchの問題に対処しています。
*   **Model Merging**: 複数のLLMを単一の新しいモデルに結合する技術。Gemma 2では、Warpという新しい3段階のマージ手法（RLファインチューニング中のEMA、複数のポリシーのRLファインチューニング後のSLERP、SLERP後のLITI）を使用して、全体的な性能を向上させています。

**Gemma 2評価:**
Gemma 2の性能は、技術レポートとOpen LLM Leaderboardで評価されています。

**Technical Report results:**
以下の表は、Gemma 2 (27B) と他の主要なオープンLLMのベンチマーク結果を比較したものです。

| ベンチマーク | Llama 3 (70B) | Qwen 1.5 (32B) | Gemma 2 (27B) |
| :---------- | :------------ | :------------- | :------------ |
| MMLU        | 79.2          | 74.3           | 75.2          |
| GSM8K       | 76.9          | 61.1           | 75.1          |
| ARC-c       | 68.8          | 63.6           | 71.4          |
| HellaSwag   | 88.0          | 85.0           | 86.4          |
| Winogrande  | 85.3          | 81.5           | 83.7          |

また、Small Language Modelsの比較では、Gemma 2 (9B) が優れた性能を示しています。

| ベンチマーク | Mistral (7B) | Llama 3 (8B) | Gemma (8B) | Gemma 2 (9B) |
| :---------- | :----------- | :----------- | :--------- | :----------- |
| MMLU        | 62.5         | 66.6         | 64.4       | 71.3         |
| GSM8K       | 34.5         | 45.7         | 50.9       | 62.3         |
| ARC-C       | 60.5         | 59.2         | 61.1       | 68.4         |
| HellaSwag   | 83.0         | 82.0         | 82.3       | 81.9         |
| Winogrande  | 78.5         | 78.5         | 79.0       | 80.6         |

**Open LLM Leaderboard results:**
記事執筆時点では、Google Gemma 2は新しいOpen LLM Leaderboardベンチマークで個別に評価中であり、このセクションは後日更新される予定です。

**利用方法:**
*   **プロンプト形式**: ベースモデルには特定のプロンプト形式はありません。指示チューニング版は、`<start_of_turn>user\n...\n<end_of_turn>\n<start_of_turn>model\n...\n<end_of_turn><eos>` という厳密な会話構造を使用します。
*   **Hugging Face Transformers**: `transformers>=4.42.3` でGemma 2モデルを利用できます。9B-itモデルは18GB RAM、27B-itモデルは56GB RAM（bfloat16）を必要としますが、4-bit量子化により27B-itモデルも約18GB RAMで実行可能です。27B-itモデルではbfloat16の使用が必須です。
*   **Hugging Chat**: Gemma 27B InstructモデルのデモがHugging Chatで利用可能です。
*   **Google Cloud**: GKEおよびVertex AIでGemma 2を効率的に実行するための新しいコンテナが現在開発中です。
*   **Fine-tuning with 🤗 TRL**: Hugging Faceの🤗 TRLライブラリを使用して、QLoRA、4-bit量子化、DeepSpeed/ZeRO Stage 3などの技術を活用し、Gemma 2を効率的にファインチューニングできます。
*   **Inference Endpoints**: Hugging Face Inference EndpointsにText Generation InferenceをバックエンドとしてGemma 2をデプロイできます。OpenAI互換のMessages APIをサポートしており、既存のアプリケーションからの移行が容易です。

## 引用（Notable quotes）

*   "GoogleはGemma 2をリリースし、オープンソースAIコミュニティに提供することで、最先端のオープンLLMファミリーをさらに強化しました。"
*   "Hugging Faceエコシステムとの深い統合により、開発者はGemma 2を容易に利用、ファインチューニング、デプロイできるようになります。"

## リスクと課題

*   **トレーニングデータの詳細不足**: トレーニングデータの正確なミックスやファインチューニングのハイパーパラメータに関する詳細が公開されていません。
*   **ソフトキャッピングとFlash Attentionの非互換性**: LogitソフトキャッピングはFlash Attention / SDPAと互換性がないため、安定したファインチューニングにはeager attentionの使用が推奨されます。推論では影響は軽微です。
*   **27B Instructモデルの精度要件**: 27B Instructモデルはfloat16で不安定な出力を生成するため、bfloat16での実行が必須です。
*   **知識蒸留におけるtrain-inference mismatch**: 知識蒸留の一般的な課題として、学生モデルと教師モデルの容量不一致によるtrain-inference mismatchの可能性が指摘されています（Gemma 2ではオンポリシー蒸留で対処）。
*   **モデルマージの実験性**: モデルマージは比較的新しく実験的な技術であり、その効果や最適な適用方法はまだ研究段階にあります。

## 今後の見通し/アクション

*   **Open LLM Leaderboardの評価更新**: Gemma 2のOpen LLM Leaderboardでの評価結果が近日中に更新される予定です。
*   **Google Cloudとの統合強化**: Google Cloud (GKEおよびVertex AI) 向けに、Gemma 2を効率的に実行するための新しいコンテナが間もなく提供される予定です。
*   **追加リソースの提供**: Google NotebookおよびVertex AIモデルガーデンが近日中に利用可能になる予定です。
*   **コミュニティによる活用**: オンポリシー蒸留やモデルマージといった新しい技術が、今後のファインチューニングコミュニティでより広く採用されるか注目されます。

## Source URL（必須）
https://huggingface.co/blog/gemma2
