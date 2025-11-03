---
title: "Welcome GPT OSS, the new open-source model family from OpenAI!"
title_ja: "OpenAI、AI普及へ待望のオープンソースモデル「GPT OSS」ファミリー公開"
source_url: "https://huggingface.co/blog/welcome-openai-gpt-oss"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
OpenAIは、強力な推論とエージェントタスク向けに設計された新しいオープンソースモデルファミリー「GPT OSS」をリリースしました。これには117Bパラメータのgpt-oss-120bと21Bパラメータのgpt-oss-20bが含まれ、両モデルはMoE（Mixture-of-Experts）アーキテクチャとMXFP4 4-bit量子化を採用し、高速推論と低リソース使用を実現しています。Apache 2.0ライセンスで提供され、Hugging FaceはAPIアクセス、ローカル推論、ファインチューニング、パートナーデプロイなど、エコシステム全体での包括的なサポートを提供します。

## 重要ポイント
*   **モデル**: OpenAIがgpt-oss-120b (117Bパラメータ) と gpt-oss-20b (21Bパラメータ) の2つのオープンソースモデルを公開。
*   **アーキテクチャ**: 両モデルともMixture-of-Experts (MoE) で、MXFP4 4-bit量子化により効率的な推論を実現。
*   **リソース効率**: 120Bモデルは単一のH100 GPU、20Bモデルは16GBメモリで動作し、コンシューマーハードウェアにも対応。
*   **ライセンス**: Apache 2.0ライセンスと最小限の利用ポリシーの下で提供。
*   **機能**: 強力な推論能力、エージェントタスク、命令追従、ツール利用をサポート。
*   **Hugging Face統合**: Inference Providers経由のAPIアクセス、Transformers、vLLM、llama.cppなどによるローカル推論、ファインチューニング、Azure/DellなどのパートナーデプロイをHugging Faceが全面的にサポート。
*   **最適化**: MXFP4、Flash Attention 3、MegaBlocks MoEカーネル、AMD ROCmプラットフォームへの対応など、多様なハードウェアと環境でのパフォーマンス最適化を提供。

## 詳細レポート（What happened/背景/影響/関係者/データ）
OpenAIは、AIの恩恵を広くアクセス可能にするというミッションの一環として、GPT OSSモデルファミリーをオープンソースとしてリリースしました。これにより、プライベートおよびローカル環境でのAIデプロイメントの需要に応えます。

**モデルの概要とアーキテクチャ**:
*   **gpt-oss-120b**: 総パラメータ117B、アクティブパラメータ5.1B。単一の80GB GPUに適合。
*   **gpt-oss-20b**: 総パラメータ21B、アクティブパラメータ3.6B。単一の16GB GPUに適合（コンシューマーGPU含む）。
*   両モデルはMoEアーキテクチャを採用し、MoEウェイトにMXFP4 4-bit量子化を適用。
*   推論、テキスト処理、思考連鎖、調整可能な推論努力レベル、命令追従、ツール利用をサポート。
*   RoPE (Rotary Positional Embeddings) と128Kコンテキスト、attention sink、GPT-4oと同じトークナイザーを使用。

**APIアクセス**:
Hugging Face Inference Providersを通じて、OpenAI互換のResponses APIとChat Completions APIを提供。CerebrasやFireworks AIなどのプロバイダー経由で利用可能です。

**ローカル推論**:
*   **Transformers**: `transformers` v4.55.1以降、`accelerate`、`kernels`、`triton>=3.4`をインストールすることで、Hopper/BlackwellだけでなくAda、Ampere、Tesla GPUでもMXFP4量子化を利用可能。
*   **Flash Attention 3**: vLLMチームが開発したattention sink対応カーネルを統合。Hopperカード（H100、H200）で最適なパフォーマンスを発揮。
*   **MegaBlocks MoEカーネル**: MXFP4非対応のGPU向けに、bfloat16でMoE層を最適化。
*   **AMD ROCmサポート**: AMD Instinctハードウェア（MI300シリーズ）で検証済み。MegaBlocks MoEカーネル加速が利用可能。
*   **llama.cpp**: day-0からネイティブMXFP4とFlash Attentionをサポートし、Metal、CUDA、Vulkanバックエンドに対応。
*   **vLLM**: Hopperカード向けにFlash Attention 3カーネルを最適化。
*   **transformers serve**: 依存関係なしでローカルサーバーを起動し、Responses APIとCompletions APIで利用可能。

**ファインチューニング**:
GPT OSSモデルは`trl`ライブラリに完全に統合されており、LoRAを使用した多言語推論の例や基本的なファインチューニングスクリプトが提供されています。

**Hugging Faceパートナーでのデプロイ**:
*   **Azure**: Azure AI Model Catalogを通じて、マネージドオンラインエンドポイントへのデプロイが可能。
*   **Dell**: Dell Enterprise Hubを通じて、オンプレミスデプロイメント向けに最適化されたコンテナとDellハードウェアサポートを提供。

**モデル評価**:
GPT OSSは推論モデルであるため、評価には大きな生成サイズと、推論トレース（`analysis`チャンネル）の除去が必要です。`lighteval`ツールを使用した評価例が示されており、IFEvalで69.5、AIME25で63.3のスコアが報告されています。

**チャットとチャットテンプレート**:
*   モデル出力は`analysis`（思考連鎖）と`final`（ユーザー向けメッセージ）の「チャンネル」に分かれています。通常は`final`チャンネルのみをユーザーに表示します。
*   トレーニング時には、思考連鎖を`thinking`キーに含め、最終ターンのみCoTを含めることで、モデルがCoTを適切に学習するようにします。
*   「システム」メッセージと「開発者」メッセージを区別し、`model_identity`や`reasoning_effort`引数でカスタマイズ可能です。
*   組み込みツール（browser, python）とカスタムツールの両方に対応し、ツール呼び出しと結果処理のフローが提供されています。

**関係者**:
Hugging Faceのオープンソースチーム、TRLチーム、評価チーム、カーネルチーム、商業パートナーシップチーム、Hub/製品チーム、法務チームなど、多数のHugging FaceメンバーがGPT OSSの統合とサポートに貢献しました。vLLMやOpenAIのコミュニティへの貢献にも感謝が表明されています。

## 引用（Notable quotes）
*   「GPT OSSは、強力な推論、エージェントタスク、多様な開発者ユースケースのために設計された、OpenAIによる待望のオープンウェイトリリースです。」
*   「私たちは、AIの恩恵を広くアクセス可能にするというOpenAIのミッションに沿って、このリリースがオープンソースエコシステムへの彼らのコミットメントにおける有意義な一歩であると認識しています。」
*   「多くのユースケースがプライベートおよび/またはローカルデプロイメントに依存しており、私たちHugging FaceはOpenAIをコミュニティに迎えることを非常に嬉しく思います。これらは長く使われ、インスピレーションを与え、影響力のあるモデルになると信じています。」

## リスクと課題
*   **利用ポリシー**: Apache 2.0ライセンスに加え、安全で責任ある利用を求める最小限の利用ポリシーが存在します。
*   **評価の複雑さ**: 推論モデルの特性上、評価には適切な生成サイズと推論トレースの除去が必須であり、不適切な設定は誤った評価結果を招く可能性があります。
*   **チャットテンプレートの独自性**: 「チャンネル」の概念やシステム/開発者メッセージの区別など、他のモデルとは異なる独自のチャットテンプレートの挙動があり、適切に扱うための理解と実装が必要です。
*   **ハードウェアと最適化の要件**: 最適なパフォーマンスを得るためには、特定のGPU（Hopperなど）や特定のライブラリ（Triton、kernels、Flash Attention 3、MegaBlocks）の導入が必要となる場合があります。

## 今後の見通し/アクション
*   Flash Attention 3 (w/ sink attention) のさらなるGPU互換性拡大が期待されています。
*   Hugging Faceは、コミュニティがこれらのモデルを効果的に使用できるよう、統合とサポートを継続します。
*   vLLMのような企業との協力や推論プロバイダーとの連携を継続し、よりシンプルで効率的なAI構築方法を提供していく方針です。
*   OpenAIの今後のオープンソースリリースへの期待が表明されています。

## Source URL
https://huggingface.co/blog/welcome-openai-gpt-oss
