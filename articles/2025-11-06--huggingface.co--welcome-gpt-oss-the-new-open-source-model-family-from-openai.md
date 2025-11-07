---
title: 'Welcome GPT OSS, the new open-source model family from OpenAI!'
title_ja: OpenAI、待望のオープンソースモデル「GPT OSS」ファミリー公開
source_url: 'https://huggingface.co/blog/welcome-openai-gpt-oss'
date: '2025-11-06'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - OpenAIは、強力な推論、エージェントタスク、多用途な開発者ユースケース向けに設計された新しいオープンソースモデルファミリー「GPT
    OSS」をApache 2.0ライセンスでリリースしました。これには、117Bパラメータのgpt-oss
  - '- ## 重要ポイント'
  - '- *   **モデルファミリー**: 117Bパラメータのgpt-oss-120bと21Bパラメータのgpt-oss-20bの2モデル。'
  - >-
    - *   **効率的なアーキテクチャ**: Mixture-of-Experts (MoE) とMXFP4
    4ビット量子化により、低リソースで高速推論を実現（120BはH100単体、20Bは16GBメモリで動作）。
  - '- *   **オープンライセンス**: Apache 2.0ライセンスと最小限の利用ポリシーにより、幅広い利用とコミュニティ貢献を促進。'
---
## 概要 (TL;DR)
OpenAIは、強力な推論、エージェントタスク、多用途な開発者ユースケース向けに設計された新しいオープンソースモデルファミリー「GPT OSS」をApache 2.0ライセンスでリリースしました。これには、117Bパラメータのgpt-oss-120bと21Bパラメータのgpt-oss-20bの2モデルが含まれ、Mixture-of-Experts (MoE) アーキテクチャと4ビット量子化（MXFP4）により効率的な推論を実現します。Hugging Faceは、APIアクセス、ローカル推論、ファインチューニング、主要クラウド/オンプレミスデプロイメントなど、広範なエコシステムサポートを提供し、AIの民主化を推進します。

## 重要ポイント
*   **モデルファミリー**: 117Bパラメータのgpt-oss-120bと21Bパラメータのgpt-oss-20bの2モデル。
*   **効率的なアーキテクチャ**: Mixture-of-Experts (MoE) とMXFP4 4ビット量子化により、低リソースで高速推論を実現（120BはH100単体、20Bは16GBメモリで動作）。
*   **オープンライセンス**: Apache 2.0ライセンスと最小限の利用ポリシーにより、幅広い利用とコミュニティ貢献を促進。
*   **主要機能**: 強力な推論能力、エージェントタスク、命令追従、ツール利用をサポート。
*   **広範なエコシステム統合**: Hugging Face Inference Providers、Transformers、vLLM、llama.cppなど、多様な推論フレームワークで利用可能。
*   **デプロイオプション**: Azure AI Model CatalogおよびDell Enterprise Hubを通じて、クラウドおよびオンプレミスでのデプロイをサポート。
*   **最適化**: MXFP4、Flash Attention 3、MegaBlocks MoEカーネル、AMD ROCmサポートなど、多様なハードウェア向けに最適化された推論オプションを提供。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
OpenAIは、強力な推論、エージェントタスク、多様な開発者ユースケース向けに設計された新しいオープンソースモデルファミリー「GPT OSS」をリリースしました。これには、117Bパラメータのgpt-oss-120bと21Bパラメータのgpt-oss-20bの2つのモデルが含まれます。Hugging Faceは、これらのモデルの広範なエコシステム統合とサポートを発表し、開発者が容易にアクセス・利用できる環境を整備しました。

**背景:**
OpenAIは、AIの恩恵を広くアクセス可能にするというミッションと、オープンソースエコシステムへのコミットメントの一環として、このオープンウェイトモデルをリリースしました。多くのユースケースがプライベートおよび/またはローカルデプロイメントに依存しており、Hugging FaceはOpenAIのコミュニティ参加を歓迎し、これらのモデルが長期的かつ影響力のあるものになると期待しています。

**影響:**
このリリースは、開発者がよりアクセスしやすく、制御しやすい形でAIモデルを利用できる機会を拡大します。特に、ローカル環境やオンデバイスアプリケーションでの利用が促進され、AIの民主化に貢献すると期待されます。Hugging Faceのエコシステム統合により、開発者は既存のツールやワークフローを活用してGPT OSSモデルを容易に導入・利用できるようになります。

**関係者:**
*   **OpenAI**: GPT OSSモデルの開発元。
*   **Hugging Face**: モデルの広範なエコシステム統合（Inference Providers、Transformersライブラリ、ファインチューニング、デプロイパートナー連携など）を主導。
*   **vLLM**: Flash Attention 3カーネルの開発に貢献。
*   **llama.cpp**: ネイティブMXFP4サポートとFlash Attentionを提供。
*   **Azure**: Azure AI Model Catalogを通じてモデルのクラウドデプロイをサポート。
*   **Dell**: Dell Enterprise Hubを通じてモデルのオンプレミスデプロイをサポート。
*   **AMD**: ROCmプラットフォームでのサポートと最適化を推進。

**データ:**
*   **モデルサイズ**:
    *   gpt-oss-120b: 総パラメータ数117B、アクティブパラメータ数5.1B。単一の80GB H100 GPUに適合。
    *   gpt-oss-20b: 総パラメータ数21B、アクティブパラメータ数3.6B。単一の16GB GPUに適合（コンシューマーハードウェア向け）。
*   **アーキテクチャ**: Mixture-of-Experts (MoE)、4ビットMXFP4量子化（MoEウェイトに適用）、RoPE (128Kコンテキスト)、GPT-4oと同じトークナイザー。
*   **ライセンス**: Apache 2.0ライセンスと最小限の利用ポリシー。
*   **ベンチマーク（lighteval）**:
    *   gpt-oss-20b: IFEval (strict prompt) で69.5 (+/-1.9)、AIME25 (pass@1) で63.3 (+/-8.9)。
*   **利用可能な最適化の概要**:
| | mxfp4 | Flash Attention 3 (w/ sink attention) | MegaBlocks MoE kernels |
|---|---|---|---|
| Hopper GPUs (H100, H200) | ✅ | ✅ | ❌ |
| CUDA GPUS with 16+ GB of RAM | ✅ | ❌ | ❌ |
| Other CUDA GPUs | ❌ | ❌ | ✅ |
| AMD Instinct (MI3XX) | ❌ | ❌ | ✅ |
| **How to enable** | triton 3.4 + kernels library | Use vllm-flash-attn3 from kernels-community | use_kernels |

## 引用（Notable quotes）
*   「GPT OSSは、強力な推論、エージェントタスク、多用途な開発者ユースケース向けに設計された、OpenAIによる待望のオープンウェイトリリースです。」
*   「OpenAIによると、このリリースは、AIの恩恵を広くアクセス可能にするという彼らの表明されたミッションに沿って、オープンソースエコシステムへの彼らのコミットメントにおける意味のある一歩です。」
*   「Hugging Faceの役割は、コミュニティがこれらのモデルを効果的に使用できるようにすることです。」

## リスクと課題
*   **評価の複雑さ**: 推論モデルであるため、評価には非常に大きな生成サイズが必要。推論トレースが回答に含まれるため、正確なメトリクス計算のためには、推論トレースを適切に除去する必要がある。
*   **ハードウェア要件と最適化の選択**: 最適なパフォーマンスを得るためには、GPUの種類（Hopper、CUDA、AMD Instinct）に応じて、MXFP4、Flash Attention 3、MegaBlocks MoEカーネルなどの適切な最適化手法を選択する必要がある。
*   **チャットテンプレートの理解**: 「analysis」と「final」チャンネルの区別、システムメッセージと開発者メッセージの特殊な扱い、ツール利用時のプロンプト構築など、GPT OSS独自のチャットテンプレートの構造を理解する必要がある。
*   **ファインチューニングの注意点**: マルチターンデータでのファインチューニングでは、最終ターン以外のCoTを破棄し、最終アシスタントターンのみをアンマスクするなど、特定のガイドラインに従う必要がある。

## 今後の見通し/アクション
*   **幅広い採用**: Apache 2.0ライセンスと効率的なリソース要件により、個人開発者から企業まで幅広いユーザーによる採用が期待される。
*   **Hugging Faceによる継続的なサポート**: Hugging Faceは、Transformersライブラリ、Inference Providers、ファインチューニングツール、パートナーシップを通じて、GPT OSSモデルの利用と最適化を継続的にサポートしていく。
*   **コミュニティの貢献**: vLLMのようなコミュニティプロジェクトとの協力により、モデルの性能向上とエコシステムの発展がさらに進む見込み。
*   **AIの民主化の推進**: OpenAIのオープンソースへのコミットメントとHugging Faceのサポートにより、AI技術の民主化と幅広いアクセスがさらに加速される。

## Source URL（必須）
https://huggingface.co/blog/welcome-openai-gpt-oss
