---
title: "Diffusers welcomes Stable Diffusion 3.5 Large"
title_ja: ""
source_url: "https://huggingface.co/blog/sd3-5"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Face DiffusersがStable Diffusion 3.5 Largeモデルをサポートしました。これはStable Diffusion 3の改良版で、8Bパラメータの通常モデルと、高速推論が可能なtimestep-distilledモデルの2種類がHugging Face Hubで利用可能です。Diffusersユーザーは、推論、量子化によるメモリ最適化、およびLoRA学習を行うための詳細なガイドとコードスニペットが提供されています。大規模モデルのため、メモリ最適化が重要なポイントとなります。

## 重要ポイント
*   **Stable Diffusion 3.5 Largeのリリース**: Stable Diffusion 3の改良版として、Hugging Face HubおよびDiffusersで利用可能になりました。
*   **2種類のモデル**:
    *   大規模 (8B) モデル
    *   大規模 (8B) timestep-distilled モデル (少ないステップ数での高速推論向け)
*   **アーキテクチャの変更点**: SD3.5 LargeはSD3 Mediumと類似していますが、QK正規化とMMDiTブロックにおけるデュアルアテンションレイヤーが導入されています。
*   **Diffusersでの利用**: 最新版のDiffusersをインストールし、Hugging Face Hubでのモデルゲート承認とログインが必要です。
*   **メモリ最適化**: SD3.5 LargeはSD3 Mediumよりも大きいため、bitsandbytesによるNF4量子化やCPUオフロードなどのメモリ最適化手法が推奨されます。
*   **LoRA学習**: bitsandbytesとpeftライブラリを活用することで、24GB VRAMのコンシューマーGPUでも量子化LoRA学習が可能です。
*   **シングルファイルローディング**: Stability AIが公開したオリジナルチェックポイントファイル（.safetensors）を直接ロードする機能も提供されています。

## 詳細レポート
### What happened
Hugging Face Diffusersライブラリが、Stability AIによって開発された画像生成モデル「Stable Diffusion 3.5 Large」のサポートを開始しました。これにより、DiffusersユーザーはHugging Face Hubを通じてSD3.5 Largeモデルを簡単に利用できるようになりました。

### 背景
Stable Diffusion 3.5は、前身であるStable Diffusion 3の改良版としてリリースされました。Hugging Faceは、Diffusersライブラリを通じて最先端の拡散モデルへのアクセスを提供しており、この新しい強力なモデルをコミュニティに提供するために統合を行いました。

### 影響
Diffusersユーザーは、最新かつ改良されたSD3.5モデルを、推論（通常の生成および高速生成）、量子化によるメモリ効率の良い推論、さらにはコンシューマーGPUでのLoRA学習といった多様な用途で活用できるようになります。特に、大規模モデルのメモリ要件を軽減する量子化サポートは、より多くのユーザーが高度なモデルを利用する機会を広げます。

### 関係者
*   **Stability AI**: Stable Diffusion 3.5モデルの開発元。
*   **Hugging Face**: DiffusersライブラリおよびHugging Face Hubの提供元。

### データ
*   **モデルサイズ**: 8Bパラメータ
*   **提供されるチェックポイント**:
    *   `stabilityai/stable-diffusion-3.5-large` (通常版)
    *   `stabilityai/stable-diffusion-3.5-large-turbo` (timestep-distilled版、少ないステップ数で高速推論が可能)
*   **アーキテクチャの変更点**:
    *   **QK正規化**: 大規模Transformerモデルの標準として導入。
    *   **デュアルアテンションレイヤー**: MMDiTブロックにおいて、各モダリティストリームに単一ではなく二重のアテンションレイヤーを使用。
    *   テキストエンコーダー、VAE、ノイズスケジューラーはSD3 Mediumと同じ。
*   **推奨推論精度**: `torch.bfloat16`
*   **量子化**: bitsandbytesライブラリによるNF4精度をサポート。
*   **LoRA学習のVRAM要件**: 量子化を利用することで、24GB VRAMのコンシューマーGPUで学習可能。

### Diffusersでの利用方法
1.  `pip install -U diffusers` でDiffusersを最新版に更新。
2.  Hugging Face HubのStable Diffusion 3.5 Largeページでゲート承認フォームを記入し、承認。
3.  `huggingface-cli login` コマンドでログイン。
4.  `StableDiffusion3Pipeline.from_pretrained` を使用してモデルをロード。

### 量子化推論
`bitsandbytes` と `transformers` をインストールし、`BitsAndBytesConfig` を用いてTransformerをNF4精度でロードすることで、メモリを大幅に削減して推論を実行できます。`pipeline.enable_model_cpu_offload()` もメモリ最適化に有効です。

### LoRA学習
`bitsandbytes` と `peft` ライブラリを使用することで、量子化されたSD3.5 LargeモデルのLoRA学習が可能です。既存のSD3トレーニングスクリプトをベースに、Transformerの初期化時に量子化設定を適用し、`peft.prepare_model_for_kbit_training()` を使用する手順が示されています。

### シングルファイルローディング
Stability AIが公開しているオリジナルチェックポイントファイル（例: `sd3.5_large.safetensors`）を、`SD3Transformer2DModel.from_single_file` メソッドを使って直接ロードすることも可能です。

## 引用（Notable quotes）
該当なし。

## リスクと課題
*   **高いメモリ要件**: SD3.5 LargeはSD3 Mediumよりも大幅に大きいため、コンシューマーGPUでの推論にはメモリ最適化（量子化、CPUオフロードなど）が不可欠です。
*   **モデルゲート承認**: モデルを利用するには、Hugging Face Hubでのゲート承認プロセスを完了する必要があります。

## 今後の見通し/アクション
Diffusersユーザーは、提供された詳細なガイドとコードスニペットを活用して、Stable Diffusion 3.5 Largeモデルを自身のプロジェクトに統合し、画像生成やLoRA学習を行うことが推奨されます。特にメモリ制約のある環境では、量子化やCPUオフロードなどの最適化手法を積極的に利用することで、モデルの利用可能性が広がります。Hugging Faceは、関連するドキュメント、Colabノートブック、トレーニングスクリプトを提供しており、ユーザーがSD3.5を最大限に活用できるようサポートしています。

## Source URL
https://huggingface.co/blog/sd3-5
