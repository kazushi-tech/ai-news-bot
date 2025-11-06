---
title: "🧨 Accelerating Stable Diffusion XL Inference with JAX on Cloud TPU v5e"
title_ja: "JAXとCloud TPU v5eでSDXL推論を爆速化"
source_url: "https://huggingface.co/blog/sdxl_jax"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Face Diffusersは、JAXとGoogle Cloud TPU v5eを統合することで、Stable Diffusion XL (SDXL) の推論を劇的に高速化し、コスト効率を向上させました。SDXLは大規模なモデルであり、その推論には高い計算コストとメモリ要件が伴いますが、JAXのJITコンパイルとpmapによる並列処理、そしてTPU v5eの専用ハードウェアがこれらを解決します。ベンチマークでは、TPU v5eがTPU v4と比較してSDXLにおいて最大2.4倍の性能対価格比（perf/$）を達成し、大規模な画像生成モデルのデプロイをより手頃なものにしています。

## 重要ポイント

*   **SDXLの推論課題の解決**: SDXLはUNetが前バージョンより約3倍大きく、メモリ要件と推論時間の増加が課題でしたが、JAX on Cloud TPU v5eがこれを高性能かつコスト効率良く解決します。
*   **TPU v5eの優位性**: Cloud TPU v5eは大規模AIモデルの学習と推論に特化しており、TPU v4の半額以下のコストで優れた性能とコスト効率を提供します。
*   **JAXの最適化機能**:
    *   **JITコンパイル**: 初回実行時にコードをコンパイルし、最適化されたTPUバイナリを生成。静的シェイプの画像生成ワークロードに最適で、超高速な推論を実現します。
    *   **pmapによる並列処理**: Single-Program Multiple-Data (SPMD) プログラムを可能にし、複数のデバイスでワークロードを並列実行。バッチサイズを増やしても性能が低下せず、例えば8チップTPUでは8画像を1チップ1画像と同じ時間で生成できます。
*   **ベンチマーク結果**: SDXL 1.0 baseの推論において、TPU v5eはTPU v4と比較して最大2.4倍のperf/$を達成し、大幅なコスト効率の改善を示しました。
*   **デモの性能**: 複数のTPU v5e-4インスタンスを使用し、4枚の1024x1024画像を約4秒（実際の生成時間は約2.3秒）で生成するデモが公開されています。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Face Diffusersは、JAXフレームワークとGoogle Cloud TPU v5eアクセラレータを統合し、Stable Diffusion XL (SDXL) モデルの推論をサポートすることを発表しました。これにより、SDXLのような大規模な画像生成モデルを、高い性能と優れたコスト効率で運用することが可能になりました。

**背景:**
SDXLは、そのUNetコンポーネントが前バージョンのモデルと比較して約3倍の大きさを持つ大規模な画像生成モデルです。この規模のモデルを本番環境にデプロイするには、増大するメモリ要件と推論時間の長さが大きな課題となっていました。Google Cloud TPUsは、大規模AIモデルの学習と推論に最適化されたカスタム設計のAIアクセラレータであり、特に新しいCloud TPU v5eは、大規模AIの学習と推論に必要なコスト効率と性能を提供するために開発されました。JAXは、そのJITコンパイルとpmapによる並列処理機能により、TPUの性能を最大限に引き出すための理想的なソフトウェアスタックです。

**影響:**
この統合により、より多くの組織がSDXLのような最先端の生成AIモデルを、以前よりも低いコストで、かつ高いスループットでデプロイできるようになります。開発者は、DiffusersライブラリとJAXを組み合わせることで、効率的な画像生成パイプラインを容易に構築できるようになります。

**関係者:**
*   **Hugging Face**: Diffusersライブラリを提供し、JAXとTPU v5eの統合を主導。
*   **Google Cloud**: Cloud TPU v5eハードウェアと関連インフラストラクチャを提供。
*   **Stability AI**: Stable Diffusion XLモデルの開発元。

**データ:**
以下のベンチマークは、SDXL 1.0 baseモデルを20ステップ、デフォルトのEuler Discreteスケジューラで実行した際の測定値です。

| Batch Size | Latency (s) | Perf/$ |
| :--------- | :---------- | :----- |
| **TPU v5e-4 (JAX)** | | |
| 4          | 2.33        | 21.46  |
| 8          | 4.99        | 20.04  |
| **TPU v4-8 (JAX)** | | |
| 4          | 2.16        | 9.05   |
| 8          | 4.17        | 8.98   |

*   **結果**: TPU v5eはTPU v4と比較して、SDXL推論において最大2.4倍の性能対価格比（perf/$）を達成しました。
*   **測定方法**: 推論性能はスループットで測定され、モデルがコンパイル・ロードされた後の画像あたりのレイテンシを測定。スループットはバッチサイズをチップあたりのレイテンシで割って算出され、これをリスト価格で割ることでperf/$を算出しています。

## 引用（Notable quotes）

*   「Today, we are thrilled to announce that Hugging Face Diffusers now supports serving SDXL using JAX on Cloud TPUs, enabling high-performance, cost-efficient inference.」
*   「TPU v5e achieves up to 2.4x greater perf/$ on SDXL compared to TPU v4, demonstrating the cost-efficiency of the latest TPU generation.」

## リスクと課題

*   **JAX JITコンパイルの制約**: JITコンパイルは、入力、中間、出力のシェイプが静的（事前に既知）である必要があります。シェイプが変更されると、コストのかかる再コンパイルがトリガーされます。
*   **初回コンパイル時間**: JAXのJITコンパイルは初回実行時に時間がかかります（デモでは約3分）。サービス開始時やシェイプ変更時にこのオーバーヘッドが発生します。
*   **精度に関する注意**: 最良の結果を得るためには、スケジューラの状態をfloat32で保持する必要があります。bfloat16に変換すると、精度エラーが蓄積し、低品質な画像や黒い画像が生成される可能性があります。
*   **デモのシンプルさ**: 現在のデモは、事前に割り当てられたTPUインスタンスに基づくシンプルなロードバランシングサーバーを使用しています。動的な負荷適応ソリューションは今後の課題です。

## 今後の見通し/アクション

*   Hugging Face Diffusers、JAX、Cloud TPUsの組み合わせは、SDXLのような大規模な生成AIモデルを効率的にデプロイするための強力なフレームワークとして確立されます。
*   将来的には、Google Kubernetes Engine (GKE) を使用して、負荷に動的に適応するスケーラブルなソリューションの構築方法が公開される予定です。
*   デモのすべてのコードはオープンソースとしてHugging Face Diffusersで公開されており、開発者はこの基盤を利用して独自のアプリケーションを構築できます。

## Source URL
https://huggingface.co/blog/sdxl_jax
