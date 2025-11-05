---
title: "Diffusers welcomes Stable Diffusion 3"
title_ja: "DiffusersがSD3に対応、最新画像生成AIを統合"
source_url: "https://huggingface.co/blog/sd3"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Stability AIの最新画像生成モデル「Stable Diffusion 3 Medium (2Bパラメータ)」がHugging Face Hubで公開され、Hugging FaceのDiffusersライブラリに統合されました。これにより、開発者はSD3を簡単に利用、最適化、ファインチューニングできるようになります。特に、大規模なモデルのメモリ要件を軽減するための最適化手法や、推論速度を向上させるパフォーマンス最適化が提供されています。

## 重要ポイント
*   **SD3のリリース**: Stability AIの最新モデル「Stable Diffusion 3 Medium (2Bパラメータ)」がHugging Face HubとDiffusersで利用可能になりました。
*   **新アーキテクチャ**: 3つのテキストエンコーダ（CLIP L/14, OpenCLIP bigG/14, T5-v1.1-XXL）と、テキストと画像情報を双方向に処理するMultimodal Diffusion Transformer (MMDiT) を採用し、テキスト理解と画像生成能力を向上させています。
*   **学習手法**: Rectified Flow Matchingを採用することで、少ないサンプリングステップで高品質な生成が可能になりました。
*   **Diffusers統合**: 最新のDiffusersライブラリを通じて、Text-to-ImageおよびImage-to-Image生成が容易に行えます。
*   **メモリ最適化**: T5-XXLモデルのVRAM消費を抑えるため、モデルオフロード、T5エンコーダの無効化、8bit量子化などの手法が提供され、24GB未満のVRAMを持つGPUでも実行可能になりました。
*   **パフォーマンス最適化**: `torch.compile()` を使用することで、推論速度を最大4倍向上させることが可能です。
*   **ファインチューニング**: DreamBoothとLoRAによるファインチューニングスクリプトも提供され、モデルのカスタマイズが容易です。

## 詳細レポート（What happened/背景/影響/関係者/データ）

*   **What happened**: Stability AIの最新画像生成モデル「Stable Diffusion 3 Medium (2Bパラメータ)」がHugging Face Hubで公開され、Hugging FaceのDiffusersライブラリに統合されました。これにより、開発者はSD3をより簡単に利用、最適化、ファインチューニングできるようになりました。
*   **背景**:
    *   SD3はStable Diffusionシリーズの最新モデルであり、より高品質な画像生成とテキスト理解を目指して開発されました。
    *   大規模なモデル（特にT5-XXLテキストエンコーダ）はVRAM消費が大きく、一般的なGPUでの実行が困難という課題がありました。
    *   Hugging FaceのDiffusersチームは、これらの課題を解決するためのメモリ・パフォーマンス最適化手法を提供し、幅広いハードウェアでのSD3利用を可能にしました。
*   **影響**:
    *   開発者は最先端の画像生成モデルをより手軽に利用できるようになりました。
    *   メモリ最適化により、24GB未満のVRAMを持つGPUでもSD3を実行できる可能性が広がり、アクセシビリティが向上しました。
    *   パフォーマンス最適化により、推論速度が大幅に向上し、より効率的な開発・運用が可能になりました。
    *   ファインチューニングスクリプトの提供により、特定の用途に合わせたモデルのカスタマイズが容易になりました。
*   **関係者**:
    *   **Stability AI**: Stable Diffusion 3の開発元。
    *   **Hugging Face**: SD3をHugging Face Hubでホストし、Diffusersライブラリへの統合、最適化、ドキュメント提供を行いました。
*   **データ**:
    *   **モデル**: Stable Diffusion 3 Medium (2Bパラメータ)。
    *   **アーキテクチャ**:
        *   潜在拡散モデル。
        *   3つのテキストエンコーダ: CLIP L/14, OpenCLIP bigG/14, T5-v1.1-XXL。
        *   Multimodal Diffusion Transformer (MMDiT): テキストとピクセル潜在を埋め込みシーケンスとして処理し、共通の次元に埋め込み、変調されたアテンションとMLPを通過させる。テキストと画像間で双方向の情報フローを持つ。
        *   16チャンネルAutoEncoder (Stable Diffusion XLに類似)。
    *   **学習手法**: Rectified Flow Matching。
    *   **スケジューラ**: FlowMatchEulerDiscreteScheduler (shift=3.0推奨)。
    *   **メモリ最適化ベンチマーク (A100 GPU, 80GB VRAM, fp16, PyTorch 2.3)**:

| Technique                 | Inference Time (secs) | Memory (GB)           |
| :------------------------ | :-------------------- | :-------------------- |
| Default                   | 4.762                 | 18.765                |
| Offloading                | 32.765 (~6.8x 🔼)     | 12.0645 (~1.55x 🔽)   |
| Offloading + no T5        | 19.110 (~4.013x 🔼)   | 4.266 (~4.398x 🔽)    |
| 8bit T5                   | 4.932 (~1.036x 🔼)    | 10.586 (~1.77x 🔽)    |

    *   **パフォーマンス最適化ベンチマーク (A100 GPU, 80GB VRAM, fp16, PyTorch 2.3)**:
        *   `torch.compile()` 使用で平均推論時間 0.585秒 (eager executionと比較して4倍高速化)。

## 引用（Notable quotes）
*   "Stable Diffusion 3 (SD3), Stability AI’s latest iteration of the Stable Diffusion family of models, is now available on the Hugging Face Hub and can be used with 🧨 Diffusers."
*   "This two-way flow of information between text and image data differs from previous approaches for text-to-image synthesis..."
*   "The rectified flow-matching sampling process is simpler and performs well when reducing the number of sampling steps."
*   "Removing the memory-intensive 4.7B parameter T5-XXL text encoder during inference can significantly decrease the memory requirements for SD3 with only a slight loss in performance."
*   "We found that the average inference time with the compiled versions of the models was 0.585 seconds, a 4X speed up over eager execution."

## リスクと課題
*   **VRAM要件**: デフォルト設定では、T5-XXLモデルを含むSD3は24GB未満のVRAMを持つGPUでの実行が困難であり、メモリ最適化手法の適用が必須となります。
*   **推論速度とメモリのトレードオフ**: モデルオフロードやT5エンコーダの削除はメモリを節約しますが、推論時間が大幅に増加する可能性があります。最適なバランスを見つけるためのチューニングが必要です。
*   **モデルアクセス**: モデルはHugging Face上で「gated」されており、利用にはフォームへの記入と承認が必要です。

## 今後の見通し/アクション
*   **Diffusersのアップグレード**: SD3を利用するためには、`pip install --upgrade diffusers` で最新版へのアップグレードが必須です。
*   **Hugging Face Hubでのアクセス**: `stabilityai/stable-diffusion-3-medium-diffusers` ページでアクセスを申請し、`huggingface-cli login` でログインしてください。
*   **メモリ最適化の適用**: ハードウェアに応じて、モデルオフロード、T5エンコーダの無効化、または8bit量子化を適用し、VRAM消費を最適化してください。
*   **パフォーマンス最適化の適用**: `torch.compile()` を利用して推論速度を向上させ、効率的な運用を目指してください。
*   **ファインチューニング**: 提供されているDreamBooth/LoRAスクリプトを活用し、特定のデータセットでSD3をカスタマイズすることで、多様なアプリケーションへの応用が期待されます。

## Source URL
https://huggingface.co/blog/sd3
