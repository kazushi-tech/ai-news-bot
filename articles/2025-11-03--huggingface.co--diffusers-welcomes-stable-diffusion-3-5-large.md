---
title: "Diffusers welcomes Stable Diffusion 3.5 Large"
title_ja: "Diffusers、Stable Diffusion 3.5 Largeに対応"
source_url: "https://huggingface.co/blog/sd3-5"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceのDiffusersライブラリが、Stable Diffusion 3の改良版である「Stable Diffusion 3.5 Large」をサポートしました。このモデルはHugging Face Hubで利用可能で、推論とLoRA学習の両方に対応しています。8Bパラメータの通常モデルと、少ないステップで高速推論が可能なtimestep-distilledモデルの2種類が提供され、QK正規化やデュアルアテンションレイヤーといったアーキテクチャ変更が施されています。メモリ最適化のためにbitsandbytesによる量子化もサポートされており、コンシューマーGPUでの利用も促進されます。

## 重要ポイント
*   **Stable Diffusion 3.5 Largeのサポート**: DiffusersライブラリがStable Diffusion 3.5 Large (SD3.5) を正式にサポート。
*   **モデルの提供**: Hugging Face Hubで8Bパラメータの通常モデルと、高速推論向けtimestep-distilledモデルの2種類が公開。
*   **アーキテクチャの改善**: SD3 Mediumと比較して、QK正規化とデュアルアテンションレイヤーが導入され、性能が向上。
*   **メモリ最適化**: SD3.5 LargeはSD3 Mediumより大きいため、bitsandbytesライブラリによるNF4量子化をサポートし、メモリ効率を大幅に改善。
*   **LoRA学習のサポート**: 24GB VRAMのコンシューマーGPUでも量子化を利用したLoRAファインチューニングが可能。
*   **利用方法**: Diffusersの最新バージョンをインストールし、Hugging Face Hubでのモデルゲート承認とログインが必要。

## 詳細レポート
### What happened
Hugging FaceのDiffusersライブラリが、Stability AIによって開発された画像生成モデル「Stable Diffusion 3.5 Large」のサポートを開始しました。これにより、DiffusersユーザーはSD3.5モデルを簡単に利用し、推論やLoRA学習を行うことができるようになりました。

### 背景
Stable Diffusion 3.5は、前身であるStable Diffusion 3の改良版です。Hugging Faceは、この最新モデルをDiffusersエコシステムに統合することで、ユーザーが最先端の画像生成技術にアクセスできるようにしました。モデルはHugging Face Hubを通じて提供され、利用にはモデルゲートの承認が必要です。

### 影響
*   Diffusersユーザーは、より高性能なStable Diffusionモデルを自身のプロジェクトに組み込むことが可能になります。
*   メモリ最適化技術（bitsandbytesによる量子化）のサポートにより、限られたGPUメモリ（例: 24GB VRAM）を持つコンシューマー向けハードウェアでも、SD3.5 Largeの推論やLoRA学習が可能になります。
*   timestep-distilledモデルの提供により、少ない推論ステップで高品質な画像を生成できるようになり、効率的な利用が促進されます。

### 関係者
*   **Hugging Face**: Diffusersライブラリの開発・提供、Hugging Face Hubでのモデルホスティング。
*   **Stability AI**: Stable Diffusion 3.5 Largeモデルの開発元。

### データ
| 特徴           | Stable Diffusion 3.5 Large (通常版) | Stable Diffusion 3.5 Large (timestep-distilled版) |
| :------------- | :---------------------------------- | :------------------------------------------------ |
| パラメータ数   | 8B                                  | 8B                                                |
| 推論ステップ数 | 通常 (例: 40ステップ)               | 少ない (例: 4-8ステップ)                          |
| 特徴           | 推奨される推論方法                  | Classifier-free guidanceなし、高速推論            |

**アーキテクチャ変更点 (SD3 Mediumとの比較):**
*   **QK正規化 (QK normalization)**: 大規模Transformerモデルの学習における標準的な手法として導入。
*   **デュアルアテンションレイヤー (Dual attention layers)**: MMDiTブロックにおいて、単一のアテンションレイヤーではなく、二重のアテンションレイヤーを使用。
*   テキストエンコーダー、VAE、ノイズスケジューラーはSD3 Mediumと同じ。

**メモリ要件と最適化:**
*   SD3.5 LargeはSD3 Mediumよりも大幅に大きいため、メモリ最適化が重要。
*   DiffusersはbitsandbytesライブラリによるNF4精度での量子化をネイティブサポート。
*   LoRA学習は、量子化とPEFTライブラリを組み合わせることで、24GB VRAMのコンシューマーGPUでも実行可能。

## 引用（Notable quotes）
該当なし

## リスクと課題
*   **メモリ要件**: SD3.5 LargeはSD3 Mediumよりも大幅に大きいため、特にコンシューマー向けハードウェアでの推論にはメモリ最適化が不可欠です。
*   **モデルゲート**: Hugging Face Hubでモデルを利用するには、利用規約への同意とログインが必要です。

## 今後の見通し/アクション
*   Diffusersユーザーは、`pip install -U diffusers`で最新バージョンに更新し、Hugging Face HubでSD3.5 Largeのモデルゲートを承認することで、すぐに利用を開始できます。
*   メモリ制約のある環境では、bitsandbytesによるNF4量子化を活用して推論を実行することが推奨されます。
*   LoRAを用いたファインチューニングを検討しているユーザーは、提供されているスクリプト例と量子化のヒントを参考に、24GB VRAMのGPUでも学習を進めることができます。
*   Stability AIが公開しているオリジナルチェックポイントファイルを用いたシングルファイルロードも可能です。

## Source URL
https://huggingface.co/blog/sd3-5
