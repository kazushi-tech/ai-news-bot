---
title: "Diffusers welcomes Stable Diffusion 3"
title_ja: "DiffusersがStable Diffusion 3を統合 最新の画像生成モデルが利用開始"
source_url: "https://huggingface.co/blog/sd3"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Stability AIの最新画像生成モデル「Stable Diffusion 3 Medium (2Bパラメータ)」がHugging Face Hubで公開され、Hugging FaceのDiffusersライブラリに統合されました。これにより、開発者は新しいアーキテクチャとトレーニング手法を採用したSD3を、メモリ・パフォーマンス最適化機能やファインチューニングサポートと共に、Diffusersを通じて簡単に利用できるようになります。

## 重要ポイント
*   **SD3 Mediumリリース**: Stability AIの最新モデル、20億パラメータ版がHugging Face Hubで公開され、Diffusersライブラリで利用可能になりました。
*   **新アーキテクチャ**: 3つのテキストエンコーダ（CLIP L/14, OpenCLIP bigG/14, T5-v1.1-XXL）と、テキストと画像の双方向情報フローを可能にするMultimodal Diffusion Transformer (MMDiT) を採用しています。
*   **Rectified Flow Matching**: 新しいトレーニング手法により、少ないサンプリングステップで高品質な画像を生成できます。
*   **Diffusers統合**: `pip install --upgrade diffusers`で簡単に導入でき、Text-to-ImageおよびImage-to-Image生成をサポートします。モデルの利用にはHugging Face Hubでの承認が必要です。
*   **メモリ最適化**: 大規模なT5-XXLエンコーダによる高いVRAM要件に対応するため、モデルオフロード、T5エンコーダの削除、8bit量子化T5-XXLなどの手法を提供し、より多様なハードウェアでの実行を可能にします。
*   **パフォーマンス最適化**: `torch.compile()`を使用することで、推論速度を最大4倍向上させることができます。
*   **ファインチューニング**: DreamboothとLoRAによる効率的なファインチューニングスクリプトが提供され、カスタムモデルの作成をサポートします。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Stability AIの最新画像生成モデルStable Diffusion 3 Medium (2Bパラメータ) がHugging Face Hubで公開され、Hugging FaceのDiffusersライブラリに統合されました。これにより、開発者はSD3を容易に利用できるようになりました。
*   **背景**: SD3は、従来のStable Diffusionモデルの進化版であり、特に複雑なプロンプトの理解と高品質な画像生成、タイポグラフィの改善を目指して開発されました。Hugging Faceは、その普及と利用を促進するため、Diffusersへの統合と各種最適化を提供しています。
*   **影響**:
    *   **開発者**: Diffusersを通じてSD3を容易に利用できるようになり、画像生成アプリケーションの開発が加速されます。
    *   **ハードウェア要件**: デフォルトでは24GB以上のVRAMが必要ですが、Diffusersが提供するメモリ最適化により、より多様なハードウェアでの実行が可能になります。
    *   **性能**: 新しいアーキテクチャとトレーニング手法により、少ないステップで高品質な画像を生成でき、`torch.compile()`による最適化で推論速度も向上します。
*   **関係者**:
    *   **Stability AI**: Stable Diffusion 3の開発元。
    *   **Hugging Face**: SD3をHugging Face Hubでホストし、Diffusersライブラリに統合。
*   **データ**:
    *   **モデル**: Stable Diffusion 3 Medium (2Bパラメータ)。
    *   **アーキテクチャ**:
        *   3つのテキストエンコーダ: CLIP L/14, OpenCLIP bigG/14, T5-v1.1-XXL
        *   Multimodal Diffusion Transformer (MMDiT)
        *   16チャンネルAutoEncoder (Stable Diffusion XLと同様)
    *   **トレーニング**: Rectified Flow Matching objective。
    *   **メモリ最適化ベンチマーク (A100 GPU, 80GB VRAM, fp16, PyTorch 2.3)**:

| Technique                 | Inference Time (secs) | Memory (GB)         |
| :------------------------ | :-------------------- | :------------------ |
| Default                   | 4.762                 | 18.765              |
| Offloading                | 32.765 (~6.8x 🔼)     | 12.0645 (~1.55x 🔽) |
| Offloading + no T5        | 19.110 (~4.013x 🔼)   | 4.266 (~4.398x 🔽)  |
| 8bit T5                   | 4.932 (~1.036x 🔼)    | 10.586 (~1.77x 🔽)  |

    *   **パフォーマンス最適化ベンチマーク (A100 GPU, 80GB VRAM, fp16, PyTorch 2.3, 20 diffusion steps)**:
        *   `torch.compile()` 使用時: 平均推論時間 0.585秒 (eager executionと比較して4倍高速化)。

## 引用（Notable quotes）
記事には具体的な引用文は含まれていませんが、タイトル「Diffusers welcomes Stable Diffusion 3」は、Hugging FaceがSD3の統合とコミュニティへの提供を強く推進している姿勢を示しています。

## リスクと課題
*   **VRAM要件**: デフォルト設定では、大規模なT5-XXLエンコーダを含むため、24GB未満のVRAMを持つGPUでの実行が困難です。ただし、Diffusersのメモリ最適化機能により、この課題は緩和されます。
*   **モデルアクセス**: SD3はゲート付きモデルであり、利用にはHugging Face Hubでのフォーム入力と承認が必要です。
*   **推論速度**: デフォルト設定では、特にメモリ最適化を適用しない場合、推論時間が長くなる可能性があります。`torch.compile()`などの最適化を適用することが推奨されます。

## 今後の見通し/アクション
*   **利用の拡大**: Diffusersとの統合により、SD3はより広範な開発者コミュニティに利用され、多様な画像生成アプリケーションや研究に組み込まれることが期待されます。
*   **さらなる最適化**: 今後もDiffusersライブラリを通じて、SD3のメモリ効率と推論パフォーマンスを向上させるためのさらなる最適化が提供される可能性があります。
*   **ファインチューニングの普及**: DreamboothとLoRAのファインチューニングスクリプトの提供により、ユーザーは特定のスタイルやコンセプトに特化したカスタムモデルを容易に作成できるようになり、SD3の応用範囲が広がります。
*   **コミュニティ貢献**: Hugging Face HubとDiffusersエコシステムを通じて、ユーザーからのフィードバックや貢献がSD3のさらなる発展に繋がるでしょう。

## Source URL（必須）
https://huggingface.co/blog/sd3
