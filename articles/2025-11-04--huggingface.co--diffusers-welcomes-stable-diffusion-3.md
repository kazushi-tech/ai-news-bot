---
title: "Diffusers welcomes Stable Diffusion 3"
title_ja: ""
source_url: "https://huggingface.co/blog/sd3"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Stable Diffusion 3 (SD3) Medium (2Bパラメータ) がHugging Face Hubで公開され、Diffusersライブラリに統合されました。本リリースでは、新しいモデルアーキテクチャ（Multimodal Diffusion Transformerと3つのテキストエンコーダー）、Rectified Flow Matchingによるトレーニング、Diffusersでの利用方法、メモリ最適化、パフォーマンス最適化、およびDreamBooth/LoRAファインチューニングスクリプトが提供されます。特に、T5-XXLテキストエンコーダーによる高いVRAM要件に対応するための様々な最適化手法が紹介されています。

## 重要ポイント
*   **SD3 Mediumのリリース**: Stability AIの最新モデル「Stable Diffusion 3 Medium (2Bパラメータ)」がHugging Face Hubで利用可能になり、Diffusersライブラリに統合されました。
*   **新アーキテクチャ**: CLIP L/14、OpenCLIP bigG/14、T5-v1.1-XXLの3つのテキストエンコーダーと、テキスト・画像間の双方向情報フローを特徴とするMultimodal Diffusion Transformer (MMDiT) を採用。
*   **Rectified Flow Matching**: 新しいトレーニング手法と、少ないサンプリングステップで高性能を発揮するFlowMatchEulerDiscreteSchedulerを導入。
*   **メモリ最適化**: T5-XXLモデルによる高いVRAM要件（24GB以上推奨）に対応するため、モデルオフロード、T5エンコーダーの無効化、8bit量子化T5の利用といった手法を提供。
*   **パフォーマンス最適化**: `torch.compile()`を用いることで、推論速度を最大4倍向上させることが可能。
*   **ファインチューニング**: LoRAを活用したDreamBoothファインチューニングスクリプトが提供され、カスタムデータでのモデル適応をサポート。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Stability AIの最新画像生成モデル「Stable Diffusion 3 Medium (2Bパラメータ)」がHugging Face Hubで公開され、Diffusersライブラリに完全に統合されました。これにより、ユーザーはDiffusersを通じてSD3モデルの利用、メモリ・パフォーマンス最適化、およびファインチューニングが可能になります。

**背景:**
SD3は、従来のモデルとは異なる革新的なアーキテクチャを採用しています。
*   **モデル構成**: CLIP L/14、OpenCLIP bigG/14、T5-v1.1-XXLの3つのテキストエンコーダー、Multimodal Diffusion Transformer (MMDiT)、およびStable Diffusion XLに類似した16チャネルAutoEncoderで構成されます。
*   **MMDiT**: テキスト入力とピクセル潜在を埋め込みシーケンスとして処理し、テキストと画像の両方の表現がアテンション操作中に互いを考慮できる双方向の情報フローを実現します。これは、固定されたテキスト表現をクロスアテンションで組み込む従来のテキスト・ツー・イメージ合成アプローチとは異なります。
*   **トレーニング**: データとノイズ分布を直線で結ぶRectified Flowとして順方向ノイズプロセスを定義する、条件付きフローマッチング目的関数でトレーニングされています。これにより、少ないサンプリングステップでの推論性能が向上します。

**影響:**
*   **Diffusersでの利用**: `pip install --upgrade diffusers`で最新版に更新後、Hugging Face Hubでモデルゲートを承認し、`huggingface-cli login`でログインすることで、Text-To-ImageおよびImage-To-ImageタスクでSD3を利用できます。
*   **メモリ要件の課題と最適化**: SD3は、特に大規模なT5-XXLテキストエンコーダー（4.7Bパラメータ）を使用するため、24GB未満のVRAMを持つGPUでの実行が困難です。Diffusersは以下のメモリ最適化を提供します。
    *   **モデルオフロード**: 推論時にモデルコンポーネントをCPUにオフロードし、VRAM使用量を削減します（推論時間は増加）。
    *   **T5テキストエンコーダーの無効化**: T5-XXLエンコーダーを無効にすることで、メモリ要件を大幅に削減できます（性能はわずかに低下）。
    *   **8bit量子化T5**: `bitsandbytes`ライブラリを使用してT5-XXLモデルを8bitでロードし、メモリ要件をさらに削減します。
*   **パフォーマンス最適化**: `torch.compile()`を使用することで、VAEおよびTransformerコンポーネントの計算グラフを最適化し、推論速度を最大4倍に向上させることができます。
*   **ファインチューニング**: LoRAを活用したDreamBoothファインチューニングスクリプトが提供されており、ユーザーは特定のデータセットでSD3を効率的にカスタマイズできます。

**関係者:**
*   **Stability AI**: Stable Diffusion 3モデルの開発元。
*   **Hugging Face**: DiffusersライブラリへのSD3統合、Hugging Face Hubでのモデル提供、および本ブログ記事の執筆。

**データ（メモリ最適化ベンチマーク）:**
A100 GPU (80GB VRAM, fp16精度, PyTorch 2.3) でのSD3 2Bモデルのメモリ最適化ベンチマーク結果。

| Technique                 | Inference Time (secs) | Memory (GB) |
| :------------------------ | :-------------------- | :---------- |
| Default                   | 4.762                 | 18.765      |
| Offloading                | 32.765 (~6.8x 🔼)     | 12.0645 (~1.55x 🔽) |
| Offloading + no T5        | 19.110 (~4.013x 🔼)   | 4.266 (~4.398x 🔽) |
| 8bit T5                   | 4.932 (~1.036x 🔼)    | 10.586 (~1.77x 🔽) |

## 引用（Notable quotes）
*   「Stable Diffusion 3 (SD3), Stability AI’s latest iteration of the Stable Diffusion family of models, is now available on the Hugging Face Hub and can be used with 🧨 Diffusers.」
*   「The model released today is Stable Diffusion 3 Medium, with 2B parameters.」
*   「This two-way flow of information between text and image data differs from previous approaches for text-to-image synthesis, where text information is incorporated into the latent via cross-attention with a fixed text representation.」
*   「Removing the memory-intensive 4.7B parameter T5-XXL text encoder during inference can significantly decrease the memory requirements for SD3 with only a slight loss in performance.」
*   「We found that the average inference time with the compiled versions of the models was 0.585 seconds, a 4X speed up over eager execution.」

## リスクと課題
*   **高いVRAM要件**: T5-XXLテキストエンコーダーの存在により、デフォルト設定では24GB未満のVRAMを持つGPUでのSD3実行が困難です。
*   **最適化と性能のトレードオフ**: モデルオフロードやT5エンコーダーの無効化といったメモリ最適化手法は、推論時間の増加を伴う可能性があります。

## 今後の見通し/アクション
*   Diffusersユーザーは、Hugging Face HubからStable Diffusion 3 Mediumをダウンロードし、提供されたコードスニペットと最適化手法を活用して、様々なハードウェアで画像生成タスクを実行できます。
*   提供されたDreamBoothおよびLoRAファインチューニングスクリプトを利用することで、特定のユースケースやデータセットに合わせてSD3モデルをカスタマイズすることが推奨されます。
*   `torch.compile()`などのパフォーマンス最適化を適用することで、より高速な推論を実現し、効率的な開発と利用が可能になります。

## Source URL（必須）
https://huggingface.co/blog/sd3
