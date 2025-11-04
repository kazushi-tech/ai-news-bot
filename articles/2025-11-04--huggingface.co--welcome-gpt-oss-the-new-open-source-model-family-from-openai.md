---
title: "Welcome GPT OSS, the new open-source model family from OpenAI!"
title_ja: "OpenAI、待望のオープンソースAIモデル「GPT OSS」ファミリー公開"
source_url: "https://huggingface.co/blog/welcome-openai-gpt-oss"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
OpenAIは、強力な推論、エージェントタスク、多様な開発者ユースケース向けに設計された新しいオープンソースモデルファミリー「GPT OSS」をリリースしました。このファミリーは、117Bパラメータの「gpt-oss-120b」と21Bパラメータの「gpt-oss-20b」の2つのモデルで構成され、いずれもMixture-of-Experts (MoE) アーキテクチャとMXFP4 4ビット量子化を採用し、高速推論と低リソース使用を実現しています。Apache 2.0ライセンスで提供され、AIの恩恵を広くアクセス可能にするというOpenAIのコミットメントを示すものです。Hugging Faceは、これらのモデルのコミュニティへの統合と利用を全面的にサポートしています。

## 重要ポイント
*   **モデル**: gpt-oss-120b (117Bパラメータ) と gpt-oss-20b (21Bパラメータ) の2種類。
*   **アーキテクチャ**: Mixture-of-Experts (MoE) とMXFP4 4ビット量子化により、少ないアクティブパラメータで高速推論と低リソース使用を実現。
*   **リソース要件**: 120Bモデルは単一のH100 GPU、20Bモデルは16GBメモリで動作可能（消費者向けハードウェアやオンデバイスアプリケーションに最適）。
*   **ライセンス**: Apache 2.0ライセンスと最小限の使用ポリシー。
*   **機能**: 高度な推論、エージェントタスク、命令追従、ツール利用をサポート。
*   **アクセス方法**:
    *   Hugging Face Inference Providers経由でのAPIアクセス。
    *   Transformers, vLLM, llama.cpp, transformers serveによるローカル推論。
    *   Azure AI Model CatalogおよびDell Enterprise Hubでのデプロイ。
*   **最適化**: mxfp4量子化、Flash Attention 3 (w/ sink attention)、MegaBlocks MoE kernels、AMD ROCmプラットフォームのサポート。

## 詳細レポート（What happened/背景/影響/関係者/データ）
OpenAIは、AIの恩恵を広くアクセス可能にするというミッションに基づき、新しいオープンソースモデルファミリー「GPT OSS」を公開しました。これは、プライベートおよびローカルデプロイメントのニーズに応える重要な一歩です。Hugging Faceは、これらのモデルのコミュニティへの統合と利用を支援するため、詳細なガイドとツールを提供しています。

**モデルの概要とアーキテクチャ**:
*   **パラメータ数**: gpt-oss-120bは合計117B、アクティブ5.1B。gpt-oss-20bは合計21B、アクティブ3.6B。
*   **量子化**: MoEウェイトにMXFP4 4ビット量子化を適用。
*   **能力**: 推論、テキストのみのモデル。Chain-of-thought、調整可能な推論努力レベル、命令追従、ツール利用をサポート。
*   **アーキテクチャ**: Token-choice MoE with SwiGLU activations、softmax-after-topk、RoPE (128Kコンテキスト)、フルコンテキストとスライディング128トークンウィンドウの交互のAttentionレイヤー、学習されたAttention sink。
*   **トークナイザー**: GPT-4oおよび他のOpenAI APIモデルと同じトークナイザーを使用。Responses API互換の新トークンも追加。

**APIアクセスとローカル推論**:
*   **APIアクセス**: Hugging Face Inference Providersを通じて利用可能。OpenAI互換のResponses APIもサポート。
*   **ローカル推論**:
    *   **Transformers**: 最新版(v4.55.1+)、accelerate、kernels、triton>=3.4をインストールすることで、mxfp4量子化によるメモリ削減（20Bモデルは16GB GPUで動作）とFlash Attention 3 (Hopper GPU向け) を利用可能。非mxfp4互換GPU向けにはMegaBlocks MoE kernelsも提供。
    *   **Llama.cpp**: ネイティブMXFP4サポートとFlash Attentionを提供し、Metal、CUDA、Vulkanなどのバックエンドで最適性能を発揮。llama-server経由での利用を推奨。
    *   **vLLM**: Flash Attention 3カーネルを開発し、Hopper GPUで最高のパフォーマンスを提供。Chat CompletionとResponses APIをサポート。
    *   **transformers serve**: 依存関係なしでローカルサーバーを起動し、Responses APIとCompletions APIでリクエストを送信可能。

**ファインチューニング**:
*   trlライブラリと完全に統合されており、LoRAを用いた多言語推論のファインチューニング例や基本的なスクリプトが提供されています。

**Hugging Faceパートナーでのデプロイ**:
*   **Azure**: Azure AI Model CatalogでGPT OSSモデルが利用可能で、リアルタイム推論のためのオンラインエンドポイントにデプロイできます。
*   **Dell**: Dell Enterprise HubでGPT OSSモデルが利用可能で、Dellプラットフォーム上でのオンプレミスデプロイメントが可能です。

**モデルの評価**:
*   GPT OSSモデルは推論モデルであるため、評価には非常に大きな生成サイズ（max_new_tokens）が必要です。推論トレースをモデルの回答から除去してからメトリクスを計算することが推奨されます。lightevalを用いた評価例が示されています。

**チャットとチャットテンプレート**:
*   モデル出力は「analysis」と「final」の「チャンネル」を使用し、通常はユーザーに表示される「final」チャンネルのメッセージのみを使用します。
*   トレーニング時には「thinking」キーを使用してchain-of-thoughtを含めることができますが、ファインチューニング時にはCoTの扱いとラベルマスキングに注意が必要です。
*   「system」と「developer」メッセージを区別し、chat templateで`model_identity`や`reasoning_effort`引数でシステムメッセージをカスタマイズできます。
*   **ツール利用**: 「builtin」ツール（browser、python）とカスタムツールをサポート。ツール呼び出しと結果の処理フローが詳細に説明されています。

**最適化の概要**:

| 最適化 | Hopper GPUs (H100, H200) | CUDA GPUS (16+ GB RAM) | Other CUDA GPUs | AMD Instinct (MI3XX) | 有効化方法 |
| :----- | :----------------------- | :--------------------- | :-------------- | :------------------- | :--------- |
| mxfp4 | ✅ | ✅ | ❌ | ❌ | triton 3.4 + kernels library |
| Flash Attention 3 (w/ sink attention) | ✅ | ❌ | ❌ | ❌ | vllm-flash-attn3 from kernels-community |
| MegaBlocks MoE kernels | ❌ | ❌ | ✅ | ✅ | use_kernels |

## 引用（Notable quotes）
*   「私たちのツールが安全に、責任を持って、民主的に使用されることを目指し、その使用方法に対する皆様の管理を最大限に高めます。gpt-ossを使用することにより、適用されるすべての法律を遵守することに同意するものとします。」
*   「OpenAIによると、このリリースは、AIの恩恵を広くアクセス可能にするという彼らの掲げるミッションに沿った、オープンソースエコシステムへのコミットメントにおける有意義な一歩です。」
*   「私たちは、これらが長く愛され、インスピレーションを与え、影響力のあるモデルになると信じています。」

## リスクと課題
*   **使用ポリシーの遵守**: モデルの使用には、安全、責任ある、民主的な利用を求めるポリシーと、適用されるすべての法律の遵守が求められます。
*   **評価の複雑性**: 推論モデルの正確な評価には、大きな生成サイズの設定と、推論トレースの適切な除去が必要です。これらを誤ると、評価結果に偽陰性が生じる可能性があります。
*   **ファインチューニングの特殊性**: マルチターン会話のファインチューニングでは、chain-of-thoughtの扱いとラベルマスキングに関して、モデルの学習データに合わせた特定の注意が必要です。
*   **ハードウェアとソフトウェアの依存性**: 最適なパフォーマンスを得るためには、特定のGPU（Hopper、CUDA 16GB+、AMD Instinct）と、triton、kernelsなどのライブラリの最新バージョンが必要です。非互換環境では性能が低下する可能性があります。

## 今後の見通し/アクション
*   **Hugging Face**: コミュニティがGPT OSSモデルを効果的に利用できるよう、統合、最適化、サポートを継続的に提供します。
*   **OpenAI**: AIの恩恵を広くアクセス可能にするというミッションを推進し、オープンソースエコシステムへの貢献を続けることが期待されます。
*   **開発者と企業**: Hugging Face Inference Providers、ローカル推論ツール、ファインチューニング機能、AzureやDellなどのパートナーデプロイメントを活用し、GPT OSSモデルを多様なアプリケーションやサービスに統合することが推奨されます。
*   **技術の進化**: Flash Attention 3 (w/ sink attention) のような最適化技術が、より多くのGPUで互換性を持つよう進化することが期待されます。

## Source URL
https://huggingface.co/blog/welcome-openai-gpt-oss
