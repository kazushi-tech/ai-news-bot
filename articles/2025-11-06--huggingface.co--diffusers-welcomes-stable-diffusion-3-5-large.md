---
title: "Diffusers welcomes Stable Diffusion 3.5 Large"
title_ja: "Diffusers、Stable Diffusion 3.5 Largeに対応"
source_url: "https://huggingface.co/blog/sd3-5"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceのDiffusersライブラリがStable Diffusion 3.5 Large (SD3.5 Large) に対応しました。SD3.5 Largeは、前身のSD3からアーキテクチャが改善され、より高性能な画像生成が可能です。8Bパラメータの通常モデルと、少ないステップで推論可能なタイムステップ蒸留モデルの2種類が提供されます。Diffusersを通じて、量子化によるメモリ最適化やLoRAトレーニングもサポートされ、コンシューマーGPUでの利用も容易になります。

## 重要ポイント
*   **SD3.5 LargeのリリースとDiffusers対応:** Stable Diffusion 3.5 LargeがHugging Face Hubで公開され、Diffusersライブラリで利用可能になりました。
*   **2種類のモデル提供:**
    *   大規模な8Bパラメータモデル。
    *   少ない推論ステップで高速生成が可能な8Bパラメータのタイムステップ蒸留モデル。
*   **アーキテクチャの改善:** QK正規化とデュアルアテンションレイヤーが導入され、モデル性能が向上しています。
*   **メモリ最適化機能:** `bitsandbytes`によるNF4量子化をサポートし、メモリ消費を大幅に削減。低RAM環境での推論を可能にします。
*   **LoRAトレーニングのサポート:** 量子化と`peft`ライブラリを活用することで、24GB VRAMのコンシューマーGPUでもSD3.5 LargeのLoRAファインチューニングが可能です。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging FaceのDiffusersチームは、Stability AIが開発した最新の画像生成モデル「Stable Diffusion 3.5 Large」のサポートを発表しました。これにより、DiffusersユーザーはHugging Face HubからSD3.5 Largeモデルにアクセスし、推論やファインチューニングを行えるようになりました。

**背景:**
Stable Diffusion 3.5 Largeは、既存のStable Diffusion 3 (SD3) の改良版としてリリースされました。特に、大規模なトランスフォーマーモデルのトレーニングにおける標準的な手法であるQK正規化や、MMDiTブロックにおけるデュアルアテンションレイヤーの採用など、アーキテクチャレベルでの改善が施されています。これにより、より高品質な画像生成が期待されます。

**影響:**
*   **開発者とユーザー:** Diffusersユーザーは、最新かつ高性能な画像生成モデルを、使い慣れたフレームワークで利用できるようになります。
*   **メモリ効率の向上:** 量子化サポートにより、SD3.5 Largeのような大規模モデルでも、より少ないGPUメモリ（例: 24GB VRAMのコンシューマーGPU）で推論やLoRAトレーニングが可能になり、アクセシビリティが向上します。
*   **高速推論:** タイムステップ蒸留モデルの提供により、少ないステップ数で高品質な画像を生成できるようになり、推論速度が向上します。

**関係者:**
*   **Stability AI:** Stable Diffusion 3.5 Largeモデルの開発元。
*   **Hugging Face:** Diffusersライブラリの開発・保守、Hugging Face Hubでのモデルホスティング、本ブログ記事の公開元。

**データ:**
*   **モデルサイズ:** 8Bパラメータ（Largeモデル）。
*   **精度:** 推奨される推論精度は`torch.bfloat16`。
*   **量子化:** `bitsandbytes`によるNF4精度量子化をサポート。
*   **アーキテクチャ変更点:**
    *   **QK正規化:** 大規模トランスフォーマーモデルのトレーニングに標準的な手法として導入。
    *   **デュアルアテンションレイヤー:** MMDiTブロックにおいて、単一のアテンションレイヤーの代わりに二重のアテンションレイヤーを使用。
    *   テキストエンコーダー、VAE、ノイズスケジューラーはSD3 Mediumと同じ。

## 引用（Notable quotes）
該当なし

## リスクと課題
*   **メモリ要件:** SD3.5 LargeはSD3 Mediumよりも大幅に大きいため、メモリ最適化（量子化、CPUオフロードなど）が必須となる場合があります。
*   **モデルへのアクセス:** SD3.5 Largeはゲートモデルであるため、Hugging Face Hubで利用規約に同意し、ログインする必要があります。

## 今後の見通し/アクション
*   **ユーザーの利用促進:** Diffusersの最新バージョンをインストールし、Hugging Face Hubでモデルへのアクセスを承認することで、SD3.5 Largeの高性能な画像生成機能をすぐに利用できます。
*   **メモリ最適化の活用:** 量子化やCPUオフロードなどの機能を利用して、様々なハードウェア環境での推論およびLoRAトレーニングを試すことが推奨されます。
*   **コミュニティの貢献:** Diffusersの既存の最適化手法やトレーニングスクリプトはSD3.5 Largeにも適用可能であり、コミュニティによるさらなる活用が期待されます。

## Source URL（必須）
https://huggingface.co/blog/sd3-5
