---
title: "\U0001F9E8 Accelerating Stable Diffusion XL Inference with JAX on Cloud TPU v5e"
date: '2025-11-03'
model: gemini-2.5-flash
source_url: 'https://huggingface.co/blog/sdxl_jax'
host: huggingface.co
tldr: >-
  Hugging Face Diffusersは、JAXとCloud TPU v5eを活用してStable Diffusion XL (SDXL)
  の推論を高速化し、高性能かつコスト効率の高い運用を可能にしました。これにより、SDXLのような大規模モデルのデプロイにおける計算上の課題が解決されます。
key_points:
  - SDXLはUNetコンポーネントが前バージョン比で約3倍の大きさであり、メモリ要件と推論時間の増加により本番環境でのデプロイが困難です。
  - >-
    Hugging Face DiffusersはJAXとCloud TPU
    v5eを用いてSDXLの推論をサポートし、高性能かつコスト効率の良い方法を提供します。
  - >-
    JAXのJust-in-Time (JIT)
    コンパイルは、静的な入力・中間・出力シェイプに最適化されたTPUバイナリを生成し、特に画像生成のような固定シェイプのワークロードに適しています。
  - >-
    JAXのpmap機能は、単一プログラム多データ (SPMD)
    プログラムを可能にし、複数のTPUデバイスにわたるワークロードの並列化により、バッチサイズを増やしてもパフォーマンスを損なうことなく高スループットを実現します。
  - >-
    ベンチマークによると、Cloud TPU v5eはSDXL推論において、TPU
    v4と比較して最大2.4倍の性能対費用効率を達成しており、最新世代TPUのコスト効率を示しています。
title_ja: ''
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/sdxl_jax'
summarized_at: '2025-11-05T10:57:52.543Z'
---
# 🧨 Accelerating Stable Diffusion XL Inference with JAX on Cloud TPU v5e

## TL;DR
- Hugging Face Diffusersは、Stable Diffusion XL (SDXL)の推論をJAXとCloud TPU v5eで高速化・費用対効果を高めて提供することを発表しました。
- JAXのJITコンパイルとXLAのpmapによる並列処理を活用し、SDXLのUNetのような大規模モデルの推論性能を最大化します。
- Cloud TPU v5eは、TPU v4と比較してSDXLの性能/コスト比(perf/$)で最大2.4倍の向上を達成し、高い費用対効果を示します。
- デモでは、TPU v5e-4インスタンス（4チップ）を使用し、4枚の1024x1024画像を約2.3秒で生成する能力を実証しました。
- この統合により、増大するメモリ要件と推論時間の課題を抱えるSDXLのようなモデルのデプロイが容易になります。

## 重要ポイント
- SDXLは以前のモデルと比較してUNetコンポーネントが約3倍大きく、本番環境でのデプロイにはメモリ要件と推論時間の増加という課題がありました。
- Google Cloud TPU v5eは、大規模AIモデル向けに最適化されたカスタム設計のAIアクセラレータで、TPU v4の半分以下のコストで高い費用対効果とパフォーマンスを提供します。
- JAXのJIT（Just-In-Time）コンパイルは、静的シェイプの入力に対して初回実行時に高度に最適化されたTPUバイナリを生成し、以降の推論を大幅に高速化します。画像生成は固定サイズの入力・出力に適しています。
- JAXのpmap機能により、XLAコンパイラを介して単一プログラム複数データ（SPMD）プログラムを実行し、複数のデバイスにわたる並列処理を容易に実現します。これにより、チップ数に応じて同時に生成できる画像数が増加しても性能が維持されます。
- Diffusers JAXパイプラインでは、モデルパラメータをbfloat16に変換してメモリと計算速度を最適化しつつ、スケジューラ状態をfloat32に保持することで精度エラーを防ぎます。また、プロンプトのトークン化や乱数シードの複製によって並列処理を効率的に実装できます。

## 概要
Hugging Faceは、増大するStable Diffusion XL (SDXL)の推論コストと性能課題に対し、JAXとGoogle Cloud TPU v5eを組み合わせたソリューションを発表しました。JAXのJITコンパイルによる最適化と、XLAのpmapによる強力な並列処理を活用することで、TPU v5eはTPU v4と比較してSDXLの性能/コスト比を最大2.4倍向上させます。Hugging Face DiffusersライブラリがJAX on Cloud TPUsをサポートしたことで、ユーザーは高パフォーマンスかつ費用対効果の高い方法でSDXLをデプロイできるようになります。提供されるデモでは、TPU v5e-4インスタンスで4枚の1024x1024画像を約2.3秒で生成する速さが実証されています。
