---
title: 'Welcome GPT OSS, the new open-source model family from OpenAI!'
title_ja: OpenAI、待望のオープンソース「GPT OSS」ファミリーをリリース
source_url: 'https://huggingface.co/blog/welcome-openai-gpt-oss'
date: '2025-11-04'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - OpenAIは、強力な推論、エージェントタスク、多様な開発者ユースケース向けに設計された新しいオープンソースモデルファミリー「GPT
    OSS」をリリースしました。このファミリーには、117Bパラメータのgpt-oss-120bと21Bパラメ
  - '- ## 重要ポイント'
  - '- *   **モデル**: gpt-oss-120b (117Bパラメータ) と gpt-oss-20b (21Bパラメータ) の2種類。'
  - '- *   **アーキテクチャ**: Mixture-of-Experts (MoE) とMXFP4 4ビット量子化により、効率的な推論を実現。'
  - '- *   **リソース要件**: 120Bモデルは単一のH100 GPU、20Bモデルは16GBメモリで動作し、コンシューマーハードウェアにも対応。'
---
## 概要 (TL;DR)
OpenAIは、強力な推論、エージェントタスク、多様な開発者ユースケース向けに設計された新しいオープンソースモデルファミリー「GPT OSS」をリリースしました。このファミリーには、117Bパラメータのgpt-oss-120bと21Bパラメータのgpt-oss-20bが含まれ、両モデルともMixture-of-Experts (MoE) アーキテクチャとMXFP4 4ビット量子化を採用し、高速推論と低リソース使用を実現しています。モデルはApache 2.0ライセンスで提供され、Hugging FaceはTransformers、Inference Providers、パートナープラットフォームを通じて広範なサポートを提供します。

## 重要ポイント
*   **モデル**: gpt-oss-120b (117Bパラメータ) と gpt-oss-20b (21Bパラメータ) の2種類。
*   **アーキテクチャ**: Mixture-of-Experts (MoE) とMXFP4 4ビット量子化により、効率的な推論を実現。
*   **リソース要件**: 120Bモデルは単一のH100 GPU、20Bモデルは16GBメモリで動作し、コンシューマーハードウェアにも対応。
*   **ライセンス**: Apache 2.0ライセンスと最小限の利用ポリシー。
*   **機能**: 高度な推論、指示追従、ツール利用、チェーンオブソートをサポート。
*   **エコシステム統合**: Hugging FaceのTransformers、vLLM、llama.cpp、Inference Providers、Azure、Dellなどのパートナープラットフォームで利用可能。

## 詳細レポート（What happened/背景/影響/関係者/データ）
OpenAIは、AIの恩恵を広くアクセス可能にするというミッションの一環として、GPT OSSモデルファミリーをオープンソース化しました。Hugging Faceは、これらのモデルのコミュニティへの統合を主導し、詳細な利用ガイドと技術サポートを提供しています。

**モデルの能力とアーキテクチャ**:
*   **パラメータ**: 120Bモデルは総117B、アクティブ5.1B。20Bモデルは総21B、アクティブ3.6B。
*   **量子化**: MoEウェイトにMXFP4 4ビット量子化を適用。
*   **機能**: 推論、テキスト生成、チェーンオブソート、指示追従、ツール利用をサポート。
*   **特徴**: RoPE、128Kコンテキスト、アテンションシンク、GPT-4oと同じトークナイザーを使用。

**APIアクセス**:
Hugging Face Inference Providersを通じて、OpenAI互換のResponses APIを含むAPIアクセスを提供。PythonやJavaScriptで簡単に利用可能。

**ローカル推論**:
*   **Transformers**: 最新版(`v4.55.1+`)でMXFP4量子化をサポート。`triton>=3.4`と`kernels`ライブラリの導入で、16GB GPU（例: RTX 3090/4090）で20Bモデルを実行可能。
*   **最適化**:
    *   **Flash Attention 3**: vLLMチームが開発したアテンションシンク対応カーネルをHopper GPU (H100/H200) 向けに統合。
    *   **MegaBlocks MoE kernels**: MXFP4非対応GPU向けにbfloat16での高速化を提供。
    *   **AMD ROCmサポート**: AMD Instinctハードウェア向けにMegaBlocks MoEカーネル加速をサポート。
*   **llama.cpp**: day-0からネイティブMXFP4とFlash Attentionをサポート。`llama-server`経由で利用可能。
*   **vLLM**: Flash Attention 3カーネルをサポートし、Hopper GPUで最適なパフォーマンスを発揮。
*   **transformers serve**: 依存関係なしでローカル推論サーバーを起動し、Responses APIとCompletions APIに対応。

**ファインチューニング**:
`trl`ライブラリと完全に統合されており、LoRAを用いた多言語推論のファインチューニング例や基本的なスクリプトが提供されています。

**Hugging Faceパートナーでのデプロイ**:
*   **Azure**: Azure AI Model Catalogを通じて、GPT OSSモデルをオンラインエンドポイントにデプロイ可能。
*   **Dell**: Dell Enterprise Hubを通じて、Dellプラットフォーム上でのオンプレミスデプロイをサポート。

**モデル評価**:
推論モデルであるため、評価には非常に大きな生成サイズと推論トレースの除去が必要です。`lighteval`ツールを使用し、IFEvalとAIME25のベンチマークスコアが提示されています。

**チャットとチャットテンプレート**:
モデル出力は「analysis」と「final」の2つのチャンネルを持ち、通常は「final」チャンネルのメッセージのみをユーザーに表示します。トレーニング時には「thinking」キーを使用してチェーンオブソートを含めることが推奨されます。また、「system」と「developer」メッセージを区別し、`model_identity`や`reasoning_effort`引数でシステムメッセージをカスタマイズできます。

**ツール利用**:
「builtin」ツール（browser, python）とユーザー定義のカスタムツールをサポート。ツール呼び出しと結果の処理フローが詳細に説明されています。

**最適化の概要**:

| | mxfp4 | Flash Attention 3 (w/ sink attention) | MegaBlocks MoE kernels |
| :-------------------------- | :---- | :------------------------------------ | :--------------------- |
| Hopper GPUs (H100, H200)    | ✅    | ✅                                    | ❌                     |
| CUDA GPUS with 16+ GB of RAM | ✅    | ❌                                    | ❌                     |
| Other CUDA GPUs             | ❌    | ❌                                    | ✅                     |
| AMD Instinct (MI3XX)        | ❌    | ❌                                    | ✅                     |
| How to enable               | triton 3.4 + kernels library | Use vllm-flash-attn3 from kernels-community | use_kernels            |

**関係者**:
Hugging Faceのオープンソースチーム、TRLチーム、評価チーム、カーネルチーム、商業パートナーシップチーム、Hub&製品チーム、法務チームなど、多数のチームと企業がモデルの統合とサポートに貢献しました。vLLMとOpenAIの貢献に感謝が述べられています。

## 引用（Notable quotes）
*   「GPT OSSは、強力な推論、エージェントタスク、多様な開発者ユースケース向けに設計された、OpenAIによる待望のオープンウェイトリリースです。」
*   「私たちは、ツールが安全に、責任を持って、民主的に使用されることを目指し、その使用方法に対する皆様の管理を最大限に高めます。gpt-ossを使用することにより、適用されるすべての法律を遵守することに同意するものとします。」
*   「OpenAIによると、このリリースは、AIの恩恵を広くアクセス可能にするという彼らのミッションに沿った、オープンソースエコシステムへのコミットメントにおける重要な一歩です。」
*   「Hugging Faceの役割は、コミュニティがこれらのモデルを効果的に使用できるようにすることです。」
*   「そしてもちろん、OpenAIがこれらのモデルをコミュニティ全体にリリースするという決定に深く感謝します。今後も大いに期待しています！」

## リスクと課題
*   **利用ポリシー**: Apache 2.0ライセンスに加え、安全で責任ある民主的な利用を求める最小限の利用ポリシーが存在し、適用法遵守が求められる。
*   **評価の複雑さ**: 推論モデルの特性上、正確な評価には非常に大きな生成サイズと、推論トレースを適切に除去する処理が必要となり、設定を誤ると偽陰性を生じる可能性がある。
*   **チャットテンプレートの理解**: 「analysis」と「final」チャンネルの区別、トレーニング時のチェーンオブソートの扱い、システム/開発者メッセージの区別など、モデルの挙動を最大限に活用するにはチャットテンプレートの深い理解が必要。
*   **ハードウェアと最適化の互換性**: MXFP4量子化やFlash Attention 3などの最適化は特定のGPU世代やライブラリに依存するため、全ての環境で最高のパフォーマンスが得られるわけではない。

## 今後の見通し/アクション
*   Flash Attention 3 (w/ sink attention) の追加GPU互換性の拡大が期待されます。
*   Hugging Faceは、コミュニティがこれらのモデルを効果的に利用できるよう、継続的な統合とサポートを提供し続けます。
*   ユーザーは、Hugging Face Inference Providers、ローカル環境、またはHugging Faceパートナー（Azure、Dell）を通じてGPT OSSモデルをデプロイ・利用できます。
*   ファインチューニングやツール利用の機能を活用し、多様なアプリケーション開発が促進されるでしょう。

## Source URL
https://huggingface.co/blog/welcome-openai-gpt-oss
