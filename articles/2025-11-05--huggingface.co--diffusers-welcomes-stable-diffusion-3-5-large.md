---
title: "Diffusers welcomes Stable Diffusion 3.5 Large"
title_ja: "Diffusers、Stable Diffusion 3.5 Largeを統合"
source_url: "https://huggingface.co/blog/sd3-5"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Stable Diffusion 3 (SD3) の改良版であるStable Diffusion 3.5 (SD3.5) LargeモデルをDiffusersライブラリで利用可能にしたことを発表しました。このリリースには、8Bパラメータの通常モデルと、少ないステップでの推論を可能にするタイムステップ蒸留モデルの2種類が含まれます。SD3.5はQK正規化とデュアルアテンション層を導入し、Diffusersを通じて簡単に推論やLoRAトレーニングが可能です。特に、bitsandbytes量子化により、コンシューマーGPUでもメモリ効率よく大規模モデルを運用・ファインチューニングできる点が強調されています。

## 重要ポイント
*   **SD3.5 Largeのリリース**: Stable Diffusion 3.5 LargeがHugging Face Hubで公開され、Diffusersライブラリで利用可能になりました。
*   **2種類のモデル**: 8Bパラメータの通常モデルと、高速推論が可能なタイムステップ蒸留モデルが提供されます。
*   **アーキテクチャの改善**: QK正規化とデュアルアテンション層の導入により、大規模トランスフォーマーモデルの性能が向上しています。
*   **Diffusersとの統合**: 最新版のDiffusersをインストールし、Hugging Faceでのモデルアクセス承認後、容易に推論やトレーニングが実行できます。
*   **メモリ最適化**: bitsandbytes量子化をネイティブサポートし、NF4精度でのロードやCPUオフロードにより、メモリ消費を大幅に削減し、コンシューマーGPU (24GB VRAM) でのLoRAファインチューニングも可能になりました。
*   **単一ファイルロード**: Stability AIが公開したオリジナルの`.safetensors`チェックポイントファイルからのロードもサポートしています。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Hugging Faceは、Stability AIが開発した画像生成モデルStable Diffusion 3.5 Largeが、同社のオープンソース機械学習ライブラリDiffusersに統合されたことを発表しました。これにより、開発者や研究者はDiffusersを通じてSD3.5 Largeモデルを容易に利用できるようになりました。
*   **背景**: Stable Diffusion 3.5は、前身であるStable Diffusion 3の改良版として登場しました。大規模モデルの効率的な運用と、より広範なユーザー層（特にコンシューマー向けGPU利用者）が高度な画像生成やファインチューニングを行えるように、メモリ最適化とアーキテクチャ改善が施されています。
*   **影響**:
    *   Diffusersユーザーは、より高性能な画像生成モデルを簡単に利用できるようになりました。
    *   bitsandbytes量子化のサポートにより、メモリ制約のある環境（例：24GB VRAMのコンシューマーGPU）でも、大規模なSD3.5モデルの推論やLoRAファインチューニングが可能になり、アクセシビリティが向上しました。
    *   タイムステップ蒸留モデルの提供により、少ない推論ステップで高品質な画像を生成できるようになり、効率が向上しました。
*   **関係者**:
    *   **Hugging Face**: Diffusersライブラリの開発・提供、モデルホスティングプラットフォーム（Hugging Face Hub）の運営。
    *   **Stability AI**: Stable Diffusion 3.5 Largeモデルの開発・公開。
*   **データ**:
    *   **モデルサイズ**: 8Bパラメータ (Largeモデル)
    *   **モデルの種類**:
        *   `stable-diffusion-3.5-large`: 通常モデル
        *   `stable-diffusion-3.5-large-turbo`: タイムステップ蒸留モデル (4-8ステップでの高速推論向け)
    *   **推奨精度**: `torch.bfloat16`
    *   **アーキテクチャ変更点 (SD3 Medium比)**:
        *   QK normalizationの導入
        *   MMDiTブロックにおけるデュアルアテンション層の使用
    *   **メモリ最適化**: bitsandbytesライブラリによるNF4精度量子化、`enable_model_cpu_offload()`によるCPUオフロード。
    *   **LoRAトレーニング要件**: 24GB VRAMのコンシューマーGPUで可能（bitsandbytesとpeftライブラリ使用時）。

## 引用（Notable quotes）
なし

## リスクと課題
*   **メモリ要件**: SD3.5 LargeはSD3 Mediumより大幅に大きいため、特にコンシューマー向けハードウェアでの推論には、bitsandbytes量子化やCPUオフロードなどのメモリ最適化が不可欠です。
*   **モデルアクセスゲート**: モデルはHugging Face Hubでゲートされており、利用前にフォームへの記入と承認が必要です。
*   **ファインチューニングのVRAM**: 量子化技術によりコンシューマーGPUでのLoRAトレーニングが可能になったとはいえ、依然として24GB程度のVRAMが必要であり、全てのユーザーが利用できるわけではありません。

## 今後の見通し/アクション
*   Diffusersユーザーは、`pip install -U diffusers`で最新版をインストールし、Hugging Face Hubでモデルアクセスを承認することで、SD3.5 Largeの利用を開始できます。
*   メモリ制約のある環境で推論やファインチューニングを行う場合は、bitsandbytes量子化やCPUオフロードなどの最適化手法を積極的に活用することが推奨されます。
*   LoRAトレーニングを検討しているユーザーは、提供されているSD3トレーニングスクリプトをベースに、量子化対応の調整を行うことで、コンシューマーGPUでのファインチューニングが可能になります。

## Source URL（必須）
https://huggingface.co/blog/sd3-5
