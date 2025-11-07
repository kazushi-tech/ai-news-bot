---
title: Diffusers welcomes Stable Diffusion 3.5 Large
title_ja: ''
source_url: 'https://huggingface.co/blog/sd3-5'
date: '2025-11-03'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/sd3-5'
summarized_at: '2025-11-05T11:02:20.150Z'
tldr: '# Diffusers welcomes Stable Diffusion 3.5 Large'
key_points:
  - '- ## TL;DR'
  - '- - Stable Diffusion 3.5 LargeモデルがHugging Face Diffusersライブラリで利用可能になった。'
  - '- - SD3.5は、QK正規化やデュアルアテンション層の採用によりアーキテクチャが改良されたSD3の後継モデルである。'
  - '- - 大規模（8B）モデルと、高速推論向けタイムステップ蒸留モデルの2種類が提供される。'
  - '- - Diffusersは、`bitsandbytes`による量子化をサポートし、メモリ効率を大幅に向上させる。'
---
# Diffusers welcomes Stable Diffusion 3.5 Large

## TL;DR
- Stable Diffusion 3.5 LargeモデルがHugging Face Diffusersライブラリで利用可能になった。
- SD3.5は、QK正規化やデュアルアテンション層の採用によりアーキテクチャが改良されたSD3の後継モデルである。
- 大規模（8B）モデルと、高速推論向けタイムステップ蒸留モデルの2種類が提供される。
- Diffusersは、`bitsandbytes`による量子化をサポートし、メモリ効率を大幅に向上させる。
- コンシューマGPU上でも、量子化を活用することでSD3.5 LargeのLoRA学習が可能となる。

## 重要ポイント
- **DiffusersでのSD3.5 Large提供**: Stable Diffusion 3.5 Largeは、Stable Diffusion 3の改良版としてHugging Face HubおよびDiffusersライブラリを通じて公開されました。大規模な8Bモデルと、少ないステップ数で推論できるタイムステップ蒸留モデルの2種類が提供されます。
- **アーキテクチャの改善**: SD3.5 LargeのTransformerアーキテクチャは、大規模モデルの訓練で標準的とされるQK正規化の導入と、MMDiTブロックにおけるデュアルアテンション層の使用により強化されました。
- **Diffusersでの利用手順**: 最新のDiffusersをインストールし、Hugging Face Hubでのモデルアクセス承認とログイン後、`StableDiffusion3Pipeline.from_pretrained`を使って容易にモデルをロードし、推論を実行できます。
- **メモリ最適化と量子化**: SD3.5 Largeはメモリ要件が高いため、Diffusersは`bitsandbytes`ライブラリを用いたNF4量子化をネイティブでサポート。これにより、少ないVRAMの環境でも効率的な推論が可能となります。
- **LoRAによるファインチューニング**: `bitsandbytes`と`peft`ライブラリの連携により、24GB VRAMのコンシューマGPUでもSD3.5 LargeのLoRA（Low-Rank Adaptation）学習が可能。既存のSD3トレーニングスクリプトに量子化設定を追加するだけで対応できます。

## 概要
Hugging Faceは、改良版の画像生成モデル「Stable Diffusion 3.5 Large」がDiffusersライブラリで利用可能になったことを発表しました。このモデルは、QK正規化とデュアルアテンション層の導入によりアーキテクチャが強化され、大規模モデルと高速推論が可能なタイムステップ蒸留モデルの2種類が提供されます。Diffusersを用いることで、`bitsandbytes`による量子化によるメモリ最適化や、コンシューマGPUでのLoRA学習が可能となり、より多くのユーザーが強力な生成AIモデルにアクセスできるようになります。
