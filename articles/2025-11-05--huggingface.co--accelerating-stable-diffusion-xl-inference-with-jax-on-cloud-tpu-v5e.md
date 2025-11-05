---
title: "🧨 Accelerating Stable Diffusion XL Inference with JAX on Cloud TPU v5e"
title_ja: ""
source_url: "https://huggingface.co/blog/sdxl_jax"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Face Diffusersは、JAXとGoogle Cloud TPU v5eを組み合わせることで、大規模画像生成モデルStable Diffusion XL (SDXL) の推論を高性能かつコスト効率良く実行できるようになりました。JAXのJITコンパイルとpmapによる並列化を活用し、TPU v5eの最適化されたハードウェアとソフトウェアスタックにより、SDXLのデプロイにおける計算コストと推論時間の課題を解決します。ベンチマークでは、TPU v5eがTPU v4と比較して最大2.4倍のPerf/$を達成し、大幅なコスト効率向上を示しています。

## 重要ポイント
*   **SDXL推論の高速化とコスト効率化:** Hugging Face DiffusersがJAX on Cloud TPU v5eでのStable Diffusion XL (SDXL) 推論をサポート開始。
*   **TPU v5eの優位性:** 大規模AIモデル向けに最適化されたAIアクセラレータで、TPU v4の半額以下のコストで高性能を実現。
*   **JAXによる最適化:**
    *   **JIT (Just-In-Time) コンパイル:** 初回実行時に最適化されたTPUバイナリを生成し、以降の推論を高速化。画像生成のように入力シェイプが静的なワークロードに最適。
    *   **pmapによる並列化:** 複数のTPUチップ間でワークロードを効率的に並列実行し、高バッチサイズでのスループットを向上。例えば、TPU v5e-4で4枚の画像を約2.3秒で生成。
*   **ベンチマーク結果:** TPU v5eはTPU v4と比較して、SDXL推論において最大2.4倍のPerf/$（コストあたりの性能）を達成。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Face Diffusersは、JAXフレームワークとGoogle Cloud TPU v5eハードウェアを統合し、Stable Diffusion XL (SDXL) モデルの推論を大幅に高速化し、コスト効率を高めるソリューションを発表しました。これにより、SDXLのような大規模な生成AIモデルを本番環境で容易にデプロイできるようになります。

**背景:**
SDXLは、前バージョンの約3倍の大きさのUNetコンポーネントを持つ大規模な画像生成モデルであり、その巨大さゆえに高いメモリ要件と長い推論時間が課題となっていました。これにより、本番環境でのデプロイメントが困難でした。

**影響:**
*   SDXLの推論が高速化され、ユーザー体験が向上。
*   TPU v5eのコスト効率により、より多くの組織がSDXLのような大規模AIモデルを導入・運用可能に。
*   JAXとDiffusersの組み合わせにより、開発者はTPUの高性能を容易に活用できるようになる。

**関係者:**
*   **Hugging Face:** Diffusersライブラリを提供し、JAXとTPU v5eの統合を実現。
*   **Google Cloud:** Cloud TPU v5eハードウェアと関連サービスを提供。
*   **Stability AI:** Stable Diffusion XLモデルを開発。

**技術的詳細とデータ:**
*   **JAX + TPU v5eの組み合わせ:**
    *   **JITコンパイル:** JAXのJITコンパイラは、初回実行時にコードをトレースし、高度に最適化されたTPUバイナリを生成します。これにより、以降の呼び出しでは超高速な推論が可能になります。画像生成は、固定サイズの画像や固定シェイプのテキスト埋め込みベクトルを使用するため、JITコンパイルに非常に適しています。
    *   **JAX pmapによる並列化:** JAXのpmap機能は、SPMD (Single-Program Multiple-Data) プログラムを表現し、複数のTPUデバイス間でワークロードを並列実行します。TPU v5eは1チップから256チップまでの構成が可能で、チップ間の超高速ICIリンクにより、バッチサイズを増やしてもパフォーマンスを損なわずにスケーリングできます。例えば、8チップのTPUでは、1チップで1枚の画像を生成するのと同じ時間で8枚の画像を生成できます。
*   **実装例:**
    *   `FlaxStableDiffusionXLPipeline`を使用し、モデルパラメータをbfloat16に変換（スケジューラ状態はfloat32に保持）してメモリを節約し高速化。
    *   プロンプトは固定次元のテンソルとして準備し、JITコンパイルを可能にする。
    *   `jax.random.split`で異なるシードを各デバイスに供給し、並列で異なる画像を生成。
    *   初回コンパイルには約3分かかるが、以降の4枚の画像生成は約2秒で完了。
*   **ベンチマークデータ:**
    SDXL 1.0 baseモデルを20ステップ、Euler Discreteスケジューラで実行した際のCloud TPU v5eとTPU v4の比較。

| バッチサイズ | レイテンシ (TPU v5e-4, JAX) | Perf/$ (TPU v5e-4, JAX) | レイテンシ (TPU v4-8, JAX) | Perf/$ (TPU v4-8, JAX) |
| :---------- | :-------------------------- | :----------------------- | :------------------------ | :---------------------- |
| 4           | 2.33s                       | 21.46                    | 2.16s                     | 9.05                    |
| 8           | 4.99s                       | 20.04                    | 4.17s                     | 8.98                    |

*   **結果:** TPU v5eはTPU v4と比較して、SDXLにおいて最大2.4倍のPerf/$を達成し、最新世代TPUの優れたコスト効率を実証しました。
*   **デモの仕組み:** 複数のCloud TPU v5e-4インスタンス（各4チップ）を使用し、シンプルなロードバランシングサーバーでユーザーリクエストをバックエンドサーバーにルーティング。ユーザーはプロンプトを入力すると、並列生成された4枚の画像を受け取ります。デモのコードはオープンソースで公開されています。

## 引用（Notable quotes）
*   "Today, we are thrilled to announce that Hugging Face Diffusers now supports serving SDXL using JAX on Cloud TPUs, enabling high-performance, cost-efficient inference."
    （本日、Hugging Face DiffusersがJAX on Cloud TPUでのSDXL提供をサポートすることを発表でき、高性能かつコスト効率の良い推論を可能にします。）
*   "At less than half the cost of TPU v4, TPU v5e makes it possible for more organizations to train and deploy AI models."
    （TPU v4の半額以下のコストで、TPU v5eはより多くの組織がAIモデルを学習・デプロイすることを可能にします。）
*   "TPU v5e achieves up to 2.4x greater perf/$ on SDXL compared to TPU v4, demonstrating the cost-efficiency of the latest TPU generation."
    （TPU v5eはSDXLにおいてTPU v4と比較して最大2.4倍のPerf/$を達成し、最新世代TPUのコスト効率を実証しています。）

## リスクと課題
*   **JITコンパイルの制約:** JAXのJITコンパイルは、入力、中間、出力の全てのシェイプが静的（事前に既知）である必要があります。シェイプが変更されるたびに、高コストな再コンパイルプロセスがトリガーされます。
*   **初回コンパイル時間:** JAXコードの初回実行時には、JITコンパイルのために数分程度の時間がかかります（例: 約3分）。
*   **精度問題:** モデルパラメータをbfloat16に変換する際、スケジューラ状態をfloat32に保たないと、精度エラーが蓄積して低品質な画像や黒い画像が生成される可能性があります。
*   **動的スケーリングの必要性:** 現在のデモは事前に割り当てられたTPUインスタンスに基づくシンプルなロードバランシングソリューションです。実際のプロダクション環境での動的な負荷変動に対応するためには、Google Kubernetes Engine (GKE) などを用いたより高度な動的スケーリングソリューションが必要です。

## 今後の見通し/アクション
*   Hugging Face Diffusers、JAX、Cloud TPUsの組み合わせが、開発者による革新的なアプリケーション構築を促進することが期待されます。
*   将来のブログ記事では、Google Kubernetes Engine (GKE) を使用して負荷に適応する動的なソリューションを作成する方法について詳細を公開する予定です。
*   デモの全てのコードはオープンソースとしてHugging Face Diffusersで公開されており、コミュニティによる活用が奨励されています。

## Source URL
https://huggingface.co/blog/sdxl_jax
