---
title: "Diffusers welcomes Stable Diffusion 3"
title_ja: "Diffusers、Stable Diffusion 3を統合"
source_url: "https://huggingface.co/blog/sd3"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Stability AIの最新画像生成モデル「Stable Diffusion 3 Medium (2Bパラメータ)」がHugging Face Hubで公開され、Diffusersライブラリに統合されました。これにより、ユーザーはDiffusersを通じてSD3を利用できるようになり、テキスト-to-イメージ、イメージ-to-イメージ生成、およびDreambooth/LoRAによるファインチューニングが可能になります。大規模なモデルのVRAM要件に対応するため、メモリ最適化とパフォーマンス最適化が提供されています。

## 重要ポイント
*   **SD3のDiffusers統合**: Stable Diffusion 3 Medium (2Bパラメータ) がHugging Face Hubで利用可能になり、Diffusersライブラリに完全に統合されました。
*   **新アーキテクチャ**: 3つのテキストエンコーダ（CLIP L/14, OpenCLIP bigG/14, T5-v1.1-XXL）と、テキストと画像の双方向情報フローを特徴とするMultimodal Diffusion Transformer (MMDiT) を採用しています。
*   **Rectified Flow Matching**: 新しいトレーニング手法「Conditional Flow-Matching Objective」と、それに対応するFlowMatchEulerDiscreteSchedulerを導入し、少ないサンプリングステップで高品質な画像を生成します。
*   **メモリ最適化**: 大規模なT5-XXLテキストエンコーダによるVRAM消費を軽減するため、モデルオフロード、T5エンコーダの削除、8bit量子化などの手法が提供され、24GB未満のVRAMを持つGPUでも実行可能になりました。
*   **パフォーマンス最適化**: `torch.compile()` を使用することで、推論速度を最大4倍に高速化できることが示されています。
*   **ファインチューニング**: DreamboothとLoRAによるSD3のファインチューニングスクリプトが提供され、カスタムモデルの作成が容易になりました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Stability AIの最新画像生成モデル「Stable Diffusion 3 Medium (2Bパラメータ)」がHugging Face Hubで公開され、Diffusersライブラリに統合されました。これにより、ユーザーはDiffusersを通じてSD3のテキスト-to-イメージおよびイメージ-to-イメージ生成機能を利用できるようになりました。また、モデルの利用を容易にするためのメモリ最適化、パフォーマンス最適化、およびファインチューニングスクリプトも同時に提供されています。

### 背景
SD3は、より高度なテキスト理解と画像生成能力を目指して開発されました。特に、複数のテキストエンコーダと新しいMMDiTアーキテクチャを導入することで、テキストと画像間の情報フローを強化しています。しかし、その大規模な構造、特に4.7BパラメータのT5-XXLテキストエンコーダは、高いVRAM要件を伴うため、幅広いハードウェアでの利用を可能にするための最適化が不可欠でした。

### 影響
*   **アクセシビリティ向上**: Diffusersの統合とメモリ最適化により、より多くのユーザーがSD3の高度な画像生成能力を利用できるようになりました。特に、24GB未満のVRAMを持つGPUでも実行可能になったことは大きな進歩です。
*   **効率的な利用**: パフォーマンス最適化により、推論速度が大幅に向上し、より効率的な開発と実験が可能になります。
*   **カスタマイズ性**: DreamboothとLoRAのファインチューニングスクリプトの提供により、ユーザーはSD3を特定のスタイルやオブジェクトに合わせて容易にカスタマイズできるようになります。

### 関係者
*   **Stability AI**: Stable Diffusion 3モデルの開発元。
*   **Hugging Face**: SD3をHugging Face Hubでホストし、Diffusersライブラリへの統合、および関連する最適化とドキュメントを提供。
*   **Linoy**: ブログ記事のサムネイル作成に貢献。

### データ
**メモリ最適化ベンチマーク (A100 GPU, 80GB VRAM, fp16, PyTorch 2.3)**

| Technique                 | Inference Time (secs) | Memory (GB)         |
| :------------------------ | :-------------------- | :------------------ |
| Default                   | 4.762                 | 18.765              |
| Offloading                | 32.765 (~6.8x 🔼)     | 12.0645 (~1.55x 🔽) |
| Offloading + no T5        | 19.110 (~4.013x 🔼)   | 4.266 (~4.398x 🔽)  |
| 8bit T5                   | 4.932 (~1.036x 🔼)    | 10.586 (~1.77x 🔽)  |

**パフォーマンス最適化ベンチマーク (A100 GPU, 80GB VRAM, fp16, PyTorch 2.3, 20 diffusion steps)**
*   `torch.compile()` 使用時: 平均推論時間 0.585秒 (eager executionと比較して4倍高速化)。

## 引用（Notable quotes）
記事中に特定の引用は含まれていません。

## リスクと課題
*   **VRAM要件**: T5-XXLモデルの存在により、メモリ最適化なしでは24GB未満のVRAMを持つGPUでの実行が困難です。
*   **推論速度とメモリのトレードオフ**: メモリ最適化手法（例：CPUオフロード、T5エンコーダの削除）は、メモリ消費を削減する一方で、推論速度の低下を招く可能性があります。
*   **モデルアクセス制限**: SD3モデルはゲートされており、Hugging Face Hubでフォームに記入し、利用規約に同意する必要があります。

## 今後の見通し/アクション
*   **広範な利用**: Diffusersの統合と提供された最適化により、より多くの開発者や研究者がSD3を自身のプロジェクトに組み込むことが期待されます。
*   **カスタムモデル開発の促進**: DreamboothおよびLoRAのファインチューニングスクリプトは、特定のユースケースに特化したSD3モデルの作成を加速させるでしょう。
*   **継続的な最適化**: Hugging Faceは、SD3のメモリ効率とパフォーマンスをさらに向上させるための追加の最適化を継続的に提供する可能性があります。

## Source URL（必須）
https://huggingface.co/blog/sd3
