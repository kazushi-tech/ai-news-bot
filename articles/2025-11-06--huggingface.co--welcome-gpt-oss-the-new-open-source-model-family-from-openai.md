---
title: "Welcome GPT OSS, the new open-source model family from OpenAI!"
title_ja: "OpenAI、待望のオープンソース「GPT OSS」公開"
source_url: "https://huggingface.co/blog/welcome-openai-gpt-oss"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
OpenAIは、強力な推論、エージェントタスク、多様な開発者ユースケース向けに設計された新しいオープンソースモデルファミリー「GPT OSS」をリリースしました。このファミリーは、117Bパラメータの「gpt-oss-120b」と21Bパラメータの「gpt-oss-20b」の2つのモデルで構成され、いずれもMixture-of-Experts (MoE) アーキテクチャとMXFP4量子化を採用しています。これにより、低リソース使用量で高速な推論が可能となり、Apache 2.0ライセンスで提供されます。Hugging Faceは、これらのモデルがオープンソースエコシステムに大きな影響を与えると歓迎し、`transformers`ライブラリや各種推論プロバイダーを通じた広範なサポートを提供します。

## 重要ポイント
*   **モデル構成:** 117Bパラメータの`gpt-oss-120b`と21Bパラメータの`gpt-oss-20b`の2種類。
*   **アーキテクチャ:** Mixture-of-Experts (MoE) と4ビットMXFP4量子化により、少ないアクティブパラメータで高速かつ効率的な推論を実現。
*   **リソース要件:** `gpt-oss-120b`は単一のH100 GPUに、`gpt-oss-20b`は16GBメモリ内で動作し、消費者向けハードウェアやオンデバイスアプリケーションに適しています。
*   **ライセンス:** Apache 2.0ライセンスと最小限の利用ポリシーにより、安全で責任ある民主的な利用を促進。
*   **アクセス方法:** Hugging Face Inference Providersを通じたAPIアクセス、`transformers`、`llama.cpp`、`vLLM`、`ollama`などによるローカル推論をサポート。
*   **最適化:** Flash Attention 3 (アテンションシンク対応)、MegaBlocks MoE kernels、AMD ROCmプラットフォームのサポートにより、多様なハードウェアで高性能を実現。
*   **ファインチューニング:** `trl`ライブラリと完全に統合されており、LoRAなどのファインチューニング例が提供されています。
*   **デプロイ:** Azure AI Model CatalogおよびDell Enterprise Hubを通じて、企業環境でのセキュアなデプロイが可能です。
*   **推論と評価:** 推論モデル特有の「チャネル」出力（analysis/final）と「推論トレース」の概念があり、評価時には適切な処理（`lighteval`の`--remove-reasoning-tags`など）が必要です。
*   **ツール利用:** 組み込みツール（browser, python）およびカスタムツールの利用をサポート。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
OpenAIは、強力な推論能力とエージェントタスクに特化した新しいオープンソースモデルファミリー「GPT OSS」を発表しました。Hugging Faceは、このモデルファミリーのHugging Faceエコシステムへの統合を詳細に解説し、開発者がモデルを効果的に利用、デプロイ、ファインチューニングするための広範なサポートとツールを提供しています。

**背景:**
OpenAIは、AIの恩恵を広くアクセス可能にするというミッションの一環として、オープンソースエコシステムへのコミットメントを強化しています。多くのユースケースがプライベートまたはローカルデプロイメントに依存しており、GPT OSSのリリースはこれらのニーズに応えるものです。Hugging Faceは、OpenAIのこの取り組みを歓迎し、コミュニティへの貢献を期待しています。

**影響:**
GPT OSSのリリースは、オープンソースAIコミュニティに大きな影響を与えます。開発者は、高性能な推論モデルをより手軽に利用できるようになり、特にリソース制約のある環境やオンデバイスアプリケーションでのAI活用が促進されます。広範なフレームワークとハードウェアサポート、そしてApache 2.0ライセンスにより、モデルの採用とイノベーションが加速されると期待されます。

**関係者:**
*   **OpenAI:** GPT OSSモデルの開発元。
*   **Hugging Face:** モデルのエコシステム統合、`transformers`ライブラリ、Inference Providers、ファインチューニングツール、評価スクリプトの提供。
*   **vLLM:** Flash Attention 3カーネルの開発。
*   **Cerebras, Fireworks AI:** Hugging Face Inference Providersを通じたAPIアクセス提供。
*   **Azure, Dell:** モデルのエンタープライズデプロイメントパートナー。
*   **AMD:** ROCmプラットフォームでのサポート。
*   **llama.cpp, ollama:** ローカル推論のサポート。

**データ:**

**GPT OSS モデル概要**

| 特徴                 | gpt-oss-120b           | gpt-oss-20b            |
| :------------------- | :--------------------- | :--------------------- |
| 総パラメータ数       | 117B                   | 21B                    |
| アクティブパラメータ数 | 5.1B                   | 3.6B                   |
| 量子化スキーム       | MXFP4 (MoE重みに適用)  | MXFP4 (MoE重みに適用)  |
| メモリ要件           | H100 GPU 1基 (80GB)    | 16GB GPU 1基           |
| ライセンス           | Apache 2.0             | Apache 2.0             |
| 主な用途             | 高度な推論、エージェントタスク | 消費者向けハードウェア、オンデバイス |

**アーキテクチャ詳細:**
*   Token-choice MoE with SwiGLU activations
*   softmax-after-topkによるMoE重み計算
*   RoPE with 128K contextのアテンションレイヤー
*   フルコンテキストとスライディング128トークンウィンドウの交互アテンションレイヤー
*   学習されたアテンションシンク (per-head)
*   GPT-4oおよび他のOpenAI APIモデルと同じトークナイザーを使用
*   Responses API互換性のため、新しいトークンを組み込み

**最適化の概要**

| GPU互換性              | mxfp4 | Flash Attention 3 (w/ sink attention) | MegaBlocks MoE kernels | 有効化方法                                      |
| :--------------------- | :---- | :------------------------------------ | :--------------------- | :---------------------------------------------- |
| Hopper GPUs (H100, H200) | ✅    | ✅                                    | ❌                     | `triton 3.4 + kernels library`, `attn_implementation="kernels-community/vllm-flash-attn3"` |
| CUDA GPUs with 16+ GB of RAM | ✅    | ❌                                    | ❌                     | `triton 3.4 + kernels library`                  |
| Other CUDA GPUs        | ❌    | ❌                                    | ✅                     | `use_kernels=True`                              |
| AMD Instinct (MI3XX)   | ❌    | ❌                                    | ✅                     | `use_kernels=True`                              |

**評価結果 (gpt-oss-20b):**
*   IFEval (strict prompt): 69.5 (+/-1.9)
*   AIME25 (in pass@1): 63.3 (+/-8.9)

## 引用（Notable quotes）
*   "We aim for our tools to be used safely, responsibly, and democratically, while maximizing your control over how you use them. By using gpt-oss, you agree to comply with all applicable law."
    *   (OpenAIのGPT OSS利用ポリシーより)
*   "According to OpenAI, this release is a meaningful step in their commitment to the open-source ecosystem, in line with their stated mission to make the benefits of AI broadly accessible."
    *   (OpenAIのオープンソースへのコミットメントについて)
*   "We believe these will be long-lived, inspiring and impactful models."
    *   (Hugging FaceのGPT OSSモデルへの期待)

## リスクと課題
*   **評価の複雑さ:** 推論モデルであるため、評価には非常に大きな生成サイズが必要。推論トレース（`analysis`チャネルの内容）が生成に含まれるため、正確なメトリクス計算のためにはこれを適切に除去する必要があります。
*   **ファインチューニングの注意点:** マルチターン会話のファインチューニングでは、CoT（Chain-of-Thought）の扱いとラベルマスキングに特定のルール（最終アシスタントターンのみCoTを含み、それ以外はマスクする）に従う必要があります。
*   **チャネル出力の理解:** モデルの出力は`analysis`と`final`の「チャネル」に分かれており、エンドユーザーには通常`final`チャネルのみを表示する必要があります。この区別を正しく理解し、実装することが重要です。
*   **システム/開発者メッセージの区別:** GPT OSSは「システム」メッセージと「開発者」メッセージを区別しますが、他のモデルでは「システム」メッセージが一般的です。`transformers`のチャットテンプレートでは、この違いを吸収するための引数（`model_identity`, `reasoning_effort`）が提供されていますが、慣れるまで混乱する可能性があります。
*   **ハードウェアと最適化の互換性:** 最適なパフォーマンスを得るためには、特定のGPU（Hopper、16GB+ CUDA GPU、AMD Instinct）と、`triton`、`kernels`、`vllm-flash-attn3`などのライブラリの適切なインストールと設定が必要です。

## 今後の見通し/アクション
*   Hugging Faceは、コミュニティがGPT OSSモデルを効果的に利用できるよう、エコシステム統合とサポートを継続します。
*   Flash Attention 3などの最適化技術は、今後さらに多くのGPUとの互換性が拡大されることが期待されます。
*   開発者は、Hugging Face HubからGPT OSSモデルにアクセスし、`transformers`ライブラリ、Hugging Face Inference Providers、`llama.cpp`、`vLLM`などの多様な方法でモデルを利用できます。
*   提供されているファインチューニングの例（OpenAI cookbookのLoRA例、基本的なスクリプト）を活用し、特定のユースケースに合わせてモデルをカスタマイズすることが推奨されます。
*   モデルの評価には、`lighteval`ツールと、推論トレースを適切に処理するための設定（`--remove-reasoning-tags`）の使用が推奨されます。
*   OpenAIのオープンソースへの継続的な貢献と、Hugging FaceやvLLMなどのパートナーとの協力により、AI分野のさらなる進展が期待されます。

## Source URL
https://huggingface.co/blog/welcome-openai-gpt-oss
