---
title: "Welcome GPT OSS, the new open-source model family from OpenAI!"
title_ja: "OpenAI、待望のオープンソースAI「GPT OSS」ファミリー発表"
source_url: "https://huggingface.co/blog/welcome-openai-gpt-oss"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
OpenAIは、強力な推論とエージェントタスク向けに設計された新しいオープンソースモデルファミリー「GPT OSS」をリリースしました。このファミリーには、117Bパラメータの「gpt-oss-120b」と21Bパラメータの「gpt-oss-20b」が含まれ、両モデルともMixture-of-Experts (MoE) アーキテクチャとMXFP4 4-bit量子化を採用しています。Apache 2.0ライセンスで提供され、Hugging Faceのエコシステムを通じてAPIアクセス、ローカル推論、ファインチューニング、AzureやDellなどのパートナープラットフォームへのデプロイが幅広くサポートされます。

## 重要ポイント
*   **新モデルリリース**: OpenAIがオープンウェイトのGPT OSSモデルファミリー（gpt-oss-120bとgpt-oss-20b）を発表。
*   **アーキテクチャ**: 両モデルともMixture-of-Experts (MoE) とMXFP4 4-bit量子化を採用し、高速推論と低リソース消費を実現。
*   **性能と要件**: 120Bモデルは単一のH100 GPUに適合し、20Bモデルは16GBメモリで動作可能（コンシューマーGPUやオンデバイス向け）。
*   **ライセンス**: Apache 2.0ライセンスと最小限の利用ポリシーの下で提供され、AIの広範なアクセス可能性を促進。
*   **エコシステム統合**: Hugging Faceが全面的にサポートし、Inference Providers、Transformers、vLLM、llama.cppなど多様な方法で利用可能。
*   **最適化**: MXFP4量子化、Flash Attention 3、MegaBlocks MoEカーネル、AMD ROCmサポートにより、様々なハードウェアでのパフォーマンスを最大化。
*   **ツール利用とファインチューニング**: 命令追従とツール利用をサポートし、trlライブラリによるファインチューニングも可能。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
OpenAIは、強力な推論、エージェントタスク、および多様な開発者ユースケースに対応する新しいオープンソースモデルファミリー「GPT OSS」をリリースしました。このファミリーは、117Bパラメータの「gpt-oss-120b」と21Bパラメータの「gpt-oss-20b」の2つのモデルで構成されています。Hugging Faceは、これらのモデルのコミュニティへの統合とサポートを主導しています。

**背景:**
OpenAIは、AIの恩恵を広くアクセス可能にするというミッションと、オープンソースエコシステムへのコミットメントの一環として、このオープンウェイトモデルをリリースしました。多くのユースケースがプライベートおよび/またはローカルデプロイメントに依存しているため、今回のリリースはAI技術の民主化に向けた重要な一歩と位置付けられています。

**影響:**
*   **開発者への恩恵**: 強力な推論能力とエージェントタスクへの対応により、開発者はより高度で多様なAIアプリケーションを構築できるようになります。
*   **ローカルデプロイメントの促進**: 20Bモデルは16GBメモリで動作するため、コンシューマーハードウェアやオンデバイスアプリケーションでの利用が容易になります。
*   **オープンソースエコシステムの強化**: Apache 2.0ライセンスにより、モデルの自由な利用、改変、配布が可能となり、AI研究と開発が加速されます。
*   **広範なアクセス**: Hugging FaceのInference Providers、主要な推論フレームワーク、およびAzureやDellなどのパートナープラットフォームを通じて、モデルへのアクセスが大幅に簡素化されます。

**関係者:**
*   **OpenAI**: GPT OSSモデルの開発元。
*   **Hugging Face**: モデルの統合、エコシステムサポート、ブログ記事の公開、Inference Providersの提供、Transformersライブラリのサポート。
*   **Cerebras, Fireworks AI**: Hugging Face Inference Providersを通じてGPT OSSモデルを提供する推論プロバイダー。
*   **vLLM**: Flash Attention 3カーネルの開発と最適化に貢献。
*   **llama.cpp**: ネイティブMXFP4サポートとFlash Attentionを提供。
*   **AMD**: ROCmプラットフォームでのサポートと最適化されたカーネルを提供。
*   **Azure**: Azure AI Model Catalogを通じてモデルのデプロイをサポート。
*   **Dell**: Dell Enterprise Hubを通じてオンプレミスデプロイをサポート。

**データ:**
*   **モデルサイズ**:
    *   gpt-oss-120b: 117B総パラメータ、5.1Bアクティブパラメータ。
    *   gpt-oss-20b: 21B総パラメータ、3.6Bアクティブパラメータ。
*   **アーキテクチャ**: Mixture-of-Experts (MoE)、MXFP4 4-bit量子化（MoEウェイトに適用）。
*   **ハードウェア要件**:
    *   120Bモデル: 単一の80GB H100 GPUに適合。
    *   20Bモデル: 単一の16GB GPUに適合（NVIDIA 3090, 4090, 5080など）。
*   **ライセンス**: Apache 2.0ライセンスと最小限の利用ポリシー。
*   **コンテキスト長**: RoPEにより128Kコンテキストをサポート。
*   **トークナイザー**: GPT-4oおよび他のOpenAI APIモデルと同じトークナイザーを使用。
*   **ベンチマーク結果 (20Bモデル)**:
    *   IFEval (strict prompt): 69.5 (+/-1.9)
    *   AIME25 (in pass@1): 63.3 (+/-8.9)

**利用可能な最適化の概要:**

| | mxfp4 | Flash Attention 3 (w/ sink attention) | MegaBlocks MoE kernels |
|---|---|---|---|
| Hopper GPUs (H100, H200) | ✅ | ✅ | ❌ |
| CUDA GPUS with 16+ GB of RAM | ✅ | ❌ | ❌ |
| Other CUDA GPUs | ❌ | ❌ | ✅ |
| AMD Instinct (MI3XX) | ❌ | ❌ | ✅ |
| How to enable | triton 3.4 + kernels library | Use vllm-flash-attn3 from kernels-community | use_kernels |

## 引用（Notable quotes）
*   「私たちは、ツールが安全に、責任を持って、民主的に使用されることを目指し、その使用方法に対する皆様の管理を最大限に高めます。gpt-ossを使用することにより、適用されるすべての法律を遵守することに同意するものとします。」
*   「OpenAIによると、このリリースは、AIの恩恵を広くアクセス可能にするという彼らの掲げるミッションに沿った、オープンソースエコシステムへのコミットメントにおける有意義な一歩です。」
*   「私たちは、これらのモデルが長く使われ、刺激的で影響力のあるものになると信じています。」（Hugging Faceのコメント）

## リスクと課題
*   **モデル評価の複雑さ**: GPT OSSモデルは推論モデルであるため、評価には非常に大きな生成サイズが必要。推論が途中で中断されると誤った結果（偽陰性）が生じるリスクがある。また、メトリクス計算前に推論トレースをモデルの回答から除去する必要がある。
*   **チャットテンプレートの理解**: モデル出力には「analysis」と「final」の「チャンネル」概念があり、通常は「final」チャンネルのメッセージのみをユーザーに表示すべき。トレーニング時やツール利用時には「analysis」メッセージを含める必要があるなど、適切な処理が求められる。
*   **システム/デベロッパーメッセージの区別**: GPT OSSは「システム」メッセージと「デベロッパー」メッセージを区別するが、他のモデルでは「システム」メッセージのみが一般的であり、この区別が混乱を招く可能性がある。
*   **ファインチューニングの注意点**: ファインチューニング時には、マルチターン会話において最終アシスタントターンのCoTのみを含め、それ以外のCoTはドロップし、ラベルをマスクする必要がある。これを誤ると、CoTなしで応答を生成するようにモデルが学習してしまう可能性がある。

## 今後の見通し/アクション
*   **最適化の拡大**: Flash Attention 3 (w/ sink attention) は、今後さらに多くのGPUとの互換性が拡大される見込みです。
*   **利用の促進**: Hugging Faceは、コミュニティがこれらのモデルを効果的に使用できるよう、vLLMなどの企業との協力や推論プロバイダーとの連携を継続し、よりシンプルな構築方法を提供していきます。
*   **開発者向けアクション**:
    *   **APIアクセス**: Hugging Face Inference Providersを通じて、OpenAI互換のResponses APIまたはChat Completions APIを利用してモデルにアクセスできます。
    *   **ローカル推論**: `transformers`ライブラリの最新バージョン（v4.55.1以降）をインストールし、MXFP4量子化やFlash Attention 3などの最適化を活用してモデルを実行できます。llama.cppやvLLM、transformers serveも利用可能です。
    *   **ファインチューニング**: `trl`ライブラリと統合されており、OpenAIクックブックのLoRA例や基本的なスクリプトを参考に、モデルを特定のニーズに合わせてファインチューニングできます。
    *   **デプロイ**: Azure AI Model CatalogやDell Enterprise Hubを通じて、エンタープライズ環境にモデルをデプロイできます。
    *   **評価**: `lighteval`ライブラリを使用して、モデルの推論能力を適切に評価できます。

## Source URL（必須）
https://huggingface.co/blog/welcome-openai-gpt-oss
