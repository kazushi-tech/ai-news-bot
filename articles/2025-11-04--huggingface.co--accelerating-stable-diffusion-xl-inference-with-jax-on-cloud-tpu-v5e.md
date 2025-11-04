---
title: "🧨 Accelerating Stable Diffusion XL Inference with JAX on Cloud TPU v5e"
title_ja: "JAXとCloud TPU v5eでSDXL推論を加速"
source_url: "https://huggingface.co/blog/sdxl_jax"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Face Diffusersは、JAXとGoogle Cloud TPU v5eを統合し、Stable Diffusion XL (SDXL) の推論を大幅に高速化し、コスト効率を高めることを発表しました。JAXのJITコンパイルとpmapによる並列処理、そしてTPU v5eの最適化されたハードウェアにより、SDXLのような大規模生成AIモデルのデプロイが容易になります。ベンチマークでは、TPU v5eがTPU v4と比較して最大2.4倍のperf/$を達成しました。

## 重要ポイント
*   **SDXL推論の高速化とコスト削減**: Hugging Face DiffusersがJAX on Cloud TPU v5eをサポートし、SDXLの高性能かつコスト効率の高い推論を実現。
*   **JAXの最適化機能**: JAXのJIT (Just-In-Time) コンパイルにより、静的シェイプの推論を一度コンパイルすれば超高速に実行可能。pmap (SPMD) により、複数デバイスでの並列処理が容易で、高バッチサイズでの高スループットを維持。
*   **Cloud TPU v5eの優位性**: TPU v5eはTPU v4の半額以下のコストで、大規模AIモデルの学習・推論に特化して設計されており、優れたコスト効率と性能を提供。
*   **ベンチマーク結果**: TPU v5eはTPU v4と比較してSDXLで最大2.4倍のperf/$を達成。デモではTPU v5e-4が4枚の画像を約2.3秒で生成。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Face Diffusersは、JAXとGoogle Cloud TPU v5eを組み合わせることで、Stable Diffusion XL (SDXL) の推論を加速するソリューションを発表しました。これにより、高性能かつコスト効率の良いSDXL推論が可能になります。デモも公開され、ユーザーは実際にその性能を体験できます。

**背景:**
SDXLは、UNetコンポーネントが前バージョンより約3倍大きい大規模な画像生成モデルであり、その増加したメモリ要件と推論時間により、本番環境でのデプロイが困難でした。この課題を解決するため、Hugging FaceはJAXとGoogle Cloud TPU v5eの組み合わせに着目しました。

**影響:**
*   SDXLのような大規模な生成AIモデルを、より多くの組織が低コストで高性能にデプロイできるようになります。
*   開発者は、JAXのJITコンパイルとpmapによる並列処理を活用し、Diffusersライブラリを通じて効率的な画像生成パイプラインを構築できます。
*   AIモデルの推論コストが削減され、幅広いアプリケーションでの生成AIの利用が促進されます。

**関係者:**
*   **Hugging Face**: Diffusersライブラリの開発・提供。
*   **Google Cloud**: Cloud TPU v5eハードウェアの提供。
*   **Stability AI**: Stable Diffusion XL (SDXL) モデルの開発。

**データ:**
*   **SDXLモデルサイズ**: UNetコンポーネントは前バージョン比約3倍。
*   **TPU v5eコスト**: TPU v4の半額以下。
*   **デモ性能**:
    *   TPU v5e-4インスタンス複数台を使用。
    *   4枚の1024x1024画像を約4秒で生成（実際の生成時間は約2.3秒）。
    *   JAXの初回コンパイル時間: 約3分。
    *   コンパイル後の推論時間: 4枚の画像生成に約2秒。
*   **ベンチマーク (SDXL 1.0 base, 20ステップ, Euler Discrete scheduler, Python 3.10, JAX 0.4.16)**:

| Batch Size | Latency (TPU v5e-4 JAX) | Perf/$ (TPU v5e-4 JAX) | Latency (TPU v4-8 JAX) | Perf/$ (TPU v4-8 JAX) |
| :--------- | :---------------------- | :--------------------- | :--------------------- | :-------------------- |
| 4          | 2.33s                   | 21.46                  | 2.16s                  | 9.05                  |
| 8          | 4.99s                   | 20.04                  | 4.17s                  | 8.98                  |

*   **コスト効率**: TPU v5eはTPU v4と比較してSDXLで最大2.4倍のperf/$を達成。

## 引用（Notable quotes）
*   "Today, we are thrilled to announce that Hugging Face Diffusers now supports serving SDXL using JAX on Cloud TPUs, enabling high-performance, cost-efficient inference."
*   "At less than half the cost of TPU v4, TPU v5e makes it possible for more organizations to train and deploy AI models."
*   "TPU v5e achieves up to 2.4x greater perf/$ on SDXL compared to TPU v4, demonstrating the cost-efficiency of the latest TPU generation."

## リスクと課題
*   **JITコンパイルの制約**: JAXのJITコンパイルは、入力、中間、出力のシェイプが静的（事前に既知）である必要がある。シェイプが変更されると、コストのかかる再コンパイルがトリガーされる。
*   **初回コンパイル時間**: JAXのJITコンパイルは初回実行時に時間がかかる（約3分）。
*   **精度に関する注意**: モデルパラメータをbfloat16に変換する際、スケジューラ状態はfloat32に保つ必要がある。さもないと精度誤差が蓄積し、低品質または黒い画像が生成される可能性がある。
*   **デモの負荷分散**: 現在のデモは複数の事前に割り当てられたTPUインスタンスに基づくシンプルな負荷分散を採用しており、動的な負荷適応には対応していない。

## 今後の見通し/アクション
*   Hugging Faceは、Diffusers + JAX + Cloud TPUsを活用してユーザーがどのような革新的なアプリケーションを構築するかを楽しみにしています。
*   将来的には、Google Kubernetes Engine (GKE) を使用して、負荷に動的に適応するより高度なソリューション（TPUインスタンスの動的な割り当てなど）について、別のブログ記事で紹介する予定です。
*   デモのコードはオープンソースとしてHugging Face Diffusersで公開されており、すぐに利用可能です。

## Source URL
https://huggingface.co/blog/sdxl_jax
