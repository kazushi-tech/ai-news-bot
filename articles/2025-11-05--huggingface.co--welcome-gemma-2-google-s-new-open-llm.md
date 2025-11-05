---
title: "Welcome Gemma 2 - Google’s new open LLM"
title_ja: "Google、最新オープンLLM「Gemma 2」を公開"
source_url: "https://huggingface.co/blog/gemma2"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Googleは、オープンLLMファミリーの最新版「Gemma 2」をリリースしました。Hugging Faceエコシステムとの緊密な統合が特徴で、9Bと27Bの2つのモデルサイズ（ベースモデルとインストラクションチューニング版）が提供されます。前世代の約2倍のデータで学習され、スライディングウィンドウアテンション、Logitソフトキャッピング、知識蒸留、モデルマージといった先進技術が導入されています。主要ベンチマークで高い性能を示し、Hugging Face Hub、Transformers、Google Cloud、Inference Endpointsを通じて利用可能です。

## 重要ポイント
*   **モデルラインナップ:** Gemma 2は9Bと27Bの2つのパラメータサイズで提供され、それぞれにベースモデルとインストラクションチューニング版があります。
*   **学習データ:** 27B版は13兆トークン、9B版は8兆トークンで学習され、前世代の約2倍のデータ量で性能が向上しています。
*   **技術的進歩:**
    *   **スライディングウィンドウアテンション:** 局所的アテンションと全体的アテンションを組み合わせ、長文コンテキストでの品質を向上。
    *   **Logitソフトキャッピング:** ロジットの過度な成長を防ぎ、訓練の安定性を向上。
    *   **知識蒸留:** 9Bモデルの訓練に活用され、特に「オンポリシー蒸留」により訓練-推論のミスマッチを軽減。
    *   **モデルマージ:** WARPという新しい手法を用いて、複数のLLMを統合し性能を向上。
*   **性能評価:** 主要ベンチマークにおいて、Gemma 2 (9B) はLlama 3 (8B) やMistral (7B) を上回り、Gemma 2 (27B) はQwen 1.5 (32B) と競争力のある性能を示しています。
*   **エコシステム統合:** Hugging Face Transformersライブラリ、Hugging Chatデモ、Google Cloud、Hugging Face Inference Endpointsとの連携が強化されています。
*   **ライセンス:** 寛容なオープンライセンスで、再配布、ファインチューニング、商用利用、派生作品が許可されています。
*   **リソース要件:** 27Bモデルはbfloat16で約56GBのRAMが必要ですが、4-bit量子化により約18GBのRAMで実行可能となり、多くのコンシューマーGPUで利用できます。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Googleは、オープンソースの大規模言語モデル（LLM）であるGemmaシリーズの最新版「Gemma 2」をリリースしました。Hugging Faceは、Gemma 2のHugging Faceエコシステムへの最適な統合を保証するためにGoogleと協力し、Hugging Face Hubで4つのオープンウェイトモデル（2つのベースモデルと2つのファインチューニングモデル）を提供しています。

**背景:**
Gemma 2は、Google DeepMind GeminiをベースとしたオープンLLMの最新イテレーションです。オープンソースAIコミュニティへの貢献と、Hugging Faceの広範なツールとプラットフォームを通じて、開発者がGemma 2を容易に利用、ファインチューニング、デプロイできるようにすることが目的です。

**影響:**
*   開発者は、最先端のオープンLLMをHugging Faceエコシステム内で直接利用できるようになります。
*   特に、4-bit量子化により27BモデルがコンシューマーGPUで実行可能となり、より多くのユーザーが高度なモデルにアクセスできるようになります。
*   新しい訓練技術（オンポリシー蒸留、WARPマージ）の導入は、今後のLLM開発とファインチューニングのトレンドに影響を与える可能性があります。
*   オープンLLMの性能競争がさらに加速し、多様なアプリケーションでの利用が促進されると期待されます。

**関係者:**
*   **Google:** Gemma 2の開発、訓練、リリース元。
*   **Hugging Face:** Gemma 2のHugging Faceエコシステムへの統合、Transformersライブラリのサポート、Hugging Chatデモの提供、評価、Inference Endpointsへのデプロイ支援。
*   **コミュニティメンバー:** LLM評価、Text Generation Inferenceサポート、Transformers統合、Hugging Chat統合に貢献。

**データ:**
*   **モデル構成:**
    *   `gemma-2-9b`: ベース9Bモデル
    *   `gemma-2-9b-it`: 9Bモデルのインストラクションファインチューニング版
    *   `gemma-2-27b`: ベース27Bモデル
    *   `gemma-2-27b-it`: 27Bモデルのインストラクションファインチューニング版
*   **コンテキスト長:** 8192トークン
*   **学習データ量:**
    *   27B版: 13兆トークン
    *   9B版: 8兆トークン
    *   データソース: 主に英語のウェブデータ、コード、数学（前世代の約2倍）
*   **訓練環境:** Google Cloud TPU (27Bはv5p、9BはTPU v4) を使用し、JAXとML Pathwaysで訓練。
*   **ファインチューニング手法:** Supervised Fine-Tuning (SFT)、大規模モデルからの蒸留、Reinforcement Learning from Human Feedback (RLHF)、WARPによるモデルマージ。
*   **技術的詳細:**
    *   **Sliding window attention:** 隔層でスライディングウィンドウアテンション（4096トークン）とフル二次グローバルアテンション（8192トークン）を交互に適用。
    *   **Logit soft-capping:** ロジットを固定範囲にスケーリングし、訓練を安定化。アテンションロジットは50.0、最終ロジットは30.0でキャップ。
    *   **Knowledge Distillation:** 9Bモデルの事前訓練と、ポスト訓練での「オンポリシー蒸留」に利用。
    *   **Model Merging:** WARP（Exponential Moving Average, Spherical Linear intERPolation, Linear Interpolation Towards Initializationの3段階）を使用。

**性能評価（Technical Report results）:**

| ベンチマーク | Llama 3 (70B) | Qwen 1.5 (32B) | Gemma 2 (27B) |
| :---------- | :------------ | :------------- | :------------ |
| MMLU        | 79.2          | 74.3           | 75.2          |
| GSM8K       | 76.9          | 61.1           | 75.1          |
| ARC-c       | 68.8          | 63.6           | 71.4          |
| HellaSwag   | 88.0          | 85.0           | 86.4          |
| Winogrande  | 85.3          | 81.5           | 83.7          |

| ベンチマーク | Mistral (7B) | Llama 3 (8B) | Gemma (8B) | Gemma 2 (9B) |
| :---------- | :----------- | :----------- | :--------- | :----------- |
| MMLU        | 62.5         | 66.6         | 64.4       | 71.3         |
| GSM8K       | 34.5         | 45.7         | 50.9       | 62.3         |
| ARC-C       | 60.5         | 59.2         | 61.1       | 68.4         |
| HellaSwag   | 83.0         | 82.0         | 82.3       | 81.9         |
| Winogrande  | 78.5         | 78.5         | 79.0       | 80.6         |

## 引用（Notable quotes）
*   「Google released Gemma 2, the latest addition to its family of state-of-the-art open LLMs, and we are excited to collaborate with Google to ensure the best integration in the Hugging Face ecosystem.」
*   「This approach is quite interesting, as we’ve seen in the community that on-policy methods like online DPO produce stronger models, and one advantage of on-policy distillation is that you only need the logits from the teacher, so you don’t need to rely on reward models or LLM-as-a-judge to improve the model. It will be exciting to see if this method becomes more popular among fine-tuners in the coming months!」

## リスクと課題
*   **訓練データの詳細不足:** 訓練ミックスやファインチューニングのハイパーパラメータに関する詳細が公開されておらず、再現性や深い理解に制約がある可能性があります。
*   **LogitソフトキャッピングとFlash Attentionの非互換性:** 訓練時にソフトキャッピングを有効にする場合、Flash Attention/SDPAが利用できず、eager attentionの使用が推奨されるため、訓練効率に影響を与える可能性があります。
*   **27Bモデルのfloat16での不安定性:** 27Bインストラクションチューニングモデルはfloat16で不安定な出力を生成するため、bfloat16の使用が必須となり、ハードウェアの互換性や性能に影響を与える可能性があります。
*   **Google Cloud統合の遅延:** GKEおよびVertex AIへの新しいコンテナの追加が進行中であり、現時点ではGoogle Cloud上での効率的な実行が完全にはサポートされていません。
*   **知識蒸留の訓練-推論ミスマッチ:** 知識蒸留は効果的ですが、モデル容量のミスマッチにより訓練-推論のミスマッチが発生する可能性があり、Gemma 2では「オンポリシー蒸留」で対処していますが、その効果の限界は未知数です。

## 今後の見通し/アクション
*   **Hugging Faceエコシステムでの広範な利用:** Hugging Face Transformersライブラリの最新版 (>=4.42.3) を使用することで、Gemma 2モデルのロード、推論、ファインチューニングが容易になります。Hugging Chatでのデモも利用可能です。
*   **Google Cloudとの連携強化:** GKEおよびVertex AIへの新しいコンテナが利用可能になり次第、Google Cloud上でのGemma 2の効率的なデプロイと実行がサポートされる予定です。
*   **ファインチューニングの普及:** 🤗 TRLライブラリとQLoRA技術を活用することで、コンシューマーGPUでもGemma 2のファインチューニングが可能となり、コミュニティでのカスタマイズモデル開発が促進されるでしょう。
*   **オンポリシー蒸留の採用拡大:** Gemma 2で採用された「オンポリシー蒸留」は、より強力なモデルを生成する可能性があり、今後のファインチューニング手法としてコミュニティで注目され、広く採用される可能性があります。
*   **評価結果の更新:** 新しいOpen LLM LeaderboardでのGemma 2の個別評価結果が近日中に公開され、モデルの相対的な性能がより明確になるでしょう。
*   **追加リソースの提供:** Google NotebookやVertex AIモデルガーデンが近日中に公開され、Gemma 2の利用と開発をさらにサポートする予定です。

## Source URL（必須）
https://huggingface.co/blog/gemma2
