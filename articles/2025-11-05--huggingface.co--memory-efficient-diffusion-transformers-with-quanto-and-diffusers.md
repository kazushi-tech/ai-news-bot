---
title: "Memory-efficient Diffusion Transformers with Quanto and Diffusers"
title_ja: "QuantoとDiffusersで拡散Transformerのメモリ効率を飛躍的に向上"
source_url: "https://huggingface.co/blog/quanto-diffusers"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

本記事は、Hugging FaceのQuantoとDiffusersライブラリを活用し、Transformerベースの拡散モデル（例: PixArt-Sigma, Stable Diffusion 3）のメモリ効率を大幅に向上させる方法を解説しています。特に、拡散バックボーンとテキストエンコーダの両方を量子化することで、GPUメモリ使用量を劇的に削減し、コンシューマーGPUでの大規模モデル利用を可能にします。FP8、INT8、INT4といった異なる量子化タイプが検証され、メモリ削減と推論レイテンシ、画質への影響が詳細に報告されています。

## 重要ポイント

*   **メモリ効率の大幅な改善**: Transformerベースの拡散モデルにおいて、Quantoによる量子化（FP8, INT8, INT4）によりGPUメモリ使用量を劇的に削減できます。
*   **テキストエンコーダの量子化が鍵**: 拡散バックボーンだけでなく、テキストエンコーダも量子化することで、メモリ削減効果がさらに増幅されます。PixArt-Sigmaでは、両方のFP8量子化でメモリが12.086GBから5.363GBに半減以下になりました。
*   **異なる量子化データタイプ**:
    *   **FP8**: 良好なメモリ削減と品質維持のバランスを提供します。
    *   **qint8**: FP8よりも推論レイテンシが優れる傾向があり、QKVプロジェクションの水平融合でさらに高速化可能です。
    *   **qint4**: 最もメモリ効率が高い（PixArt-Sigmaで3.058GB）ですが、レイテンシが増加し、画質劣化のリスクがあるため、最終層の量子化除外や量子化認識学習（QAT）が推奨されます。
*   **bfloat16の利点**: H100などの対応GPUでは、bfloat16精度がFP16よりも高速な推論を可能にする場合があります。
*   **モデルの保存とロード**: 量子化されたDiffusersモデルは、大幅にサイズが削減された状態で（例: PixArt-Sigmaで2.44GBから587MBへ）保存・ロードが可能です。
*   **柔軟な適用**: 異なるパイプラインモジュールに異なる量子化タイプを適用したり、`enable_model_cpu_offload()`などの他のメモリ最適化技術と組み合わせたりできます。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、PyTorchベースの量子化ツールキットQuantoと、Transformerベースの拡散モデルを扱うDiffusersライブラリを統合し、これらのモデルのメモリ効率を向上させる手法を公開しました。これにより、高解像度テキスト-画像生成モデルのGPUメモリ要件を削減し、より多くのユーザーがコンシューマーGPUで大規模モデルを利用できるようにすることを目指しています。

**背景:**
近年、Transformerアーキテクチャをベースとした拡散モデル（PixArt-Alpha, Stable Diffusion 3, Hunyuan DiTなど）がテキスト-画像生成の分野で主流になりつつあります。これらのモデルは0.6Bから8Bパラメータに及ぶ大規模化が進み、それに伴いGPUメモリ要件が急増しています。例えば、Stable Diffusion 3のFP16推論には18.765GBのGPUメモリが必要とされ、これは一般的なコンシューマーGPUでの利用を困難にし、モデルの普及と実験を妨げる要因となっていました。Quantoは、LLM分野で実績のある量子化技術を拡散モデルに適用することで、この課題を解決します。

**影響:**
*   **メモリ削減**: Diffusion TransformerとテキストエンコーダをFP8量子化することで、PixArt-Sigmaのメモリ使用量が12.086GBから5.363GB（バッチサイズ1）へと大幅に削減されました。Stable Diffusion 3でも、特定のテキストエンコーダの量子化により16.403GBから8.204GBに削減されています。
*   **レイテンシへの影響**: 一般的に、量子化はわずかな推論レイテンシの増加を伴いますが、qint8とQKVプロジェクションの融合、またはbfloat16の使用により、レイテンシを最小限に抑えることが可能です。INT4の場合、ネイティブハードウェアサポートがないため、レイテンシ増加が顕著になります。
*   **画質への影響**: FP8やINT8では画質劣化はほとんど見られませんが、INT4のような積極的な量子化では画質が低下する可能性があります。この場合、最終層の量子化除外や量子化認識学習（QAT）が推奨されます。
*   **モデルサイズの削減**: 量子化されたモデルは、保存時のファイルサイズも大幅に削減されます。PixArt-Sigmaの例では、2.44GBから587MBに削減されました。

**関係者:**
*   **Hugging Face**: Diffusersライブラリ、Quanto量子化ツールキット、Optimum（ハードウェア最適化ツールセット）を提供。
*   **PyTorch**: Quantoの基盤となるディープラーニングフレームワーク。

**データ:**
ベンチマークはH100 GPU、CUDA 12.2、PyTorch 2.4.0、Diffusers（特定コミット）、Quanto（特定コミット）の環境で実施されました。VAEは量子化されていません。

**PixArt-SigmaのFP8量子化によるメモリ/レイテンシ比較 (Diffusion Transformerのみ)**

| Batch Size | Quantization | Memory (GB) | Latency (Seconds) |
| :--------- | :----------- | :---------- | :---------------- |
| 1          | None         | 12.086      | 1.200             |
| 1          | FP8          | 11.547      | 1.540             |
| 4          | None         | 12.087      | 4.482             |
| 4          | FP8          | 11.548      | 5.109             |

**PixArt-SigmaのFP8量子化によるメモリ/レイテンシ比較 (Diffusion Transformer + Text Encoder)**

| Batch Size | Quantization | Quantize TE | Memory (GB) | Latency (Seconds) |
| :--------- | :----------- | :---------- | :---------- | :---------------- |
| 1          | FP8          | False       | 11.547      | 1.540             |
| 1          | FP8          | True        | 5.363       | 1.601             |
| 4          | FP8          | False       | 11.548      | 5.109             |
| 4          | FP8          | True        | 5.364       | 5.141             |

**Stable Diffusion 3のテキストエンコーダ量子化組み合わせによるメモリ/レイテンシ比較 (Diffusion Transformerは常に量子化)**

| Batch Size | Quantization | Quantize TE 1 | Quantize TE 2 | Quantize TE 3 | Memory (GB) | Latency (Seconds) |
| :--------- | :----------- | :------------ | :------------ | :------------ | :---------- | :---------------- |
| 1          | FP8          | 1             | 1             | 1             | 8.200       | 2.858             |
| 1 ✅        | FP8          | 0             | 0             | 1             | 8.294       | 2.781             |
| 1          | FP8          | 1             | 1             | 0             | 14.384      | 2.833             |
| 1          | FP8          | 0             | 1             | 0             | 14.475      | 2.818             |
| 1 ✅        | FP8          | 1             | 0             | 0             | 14.384      | 2.730             |
| 1          | FP8          | 0             | 1             | 1             | 8.325       | 2.875             |
| 1 ✅        | FP8          | 1             | 0             | 1             | 8.204       | 2.789             |
| 1          | None         | -             | -             | -             | 16.403      | 2.118             |
*✅は推奨される組み合わせ*

**PixArt-Sigmaのbfloat16とINT8/FP8の比較 (TE量子化済み)**

| Batch Size | Precision | Quantization | Memory (GB) | Latency (Seconds) | Quantize TE |
| :--------- | :-------- | :----------- | :---------- | :---------------- | :---------- |
| 1          | FP16      | INT8         | 5.363       | 1.538             | True        |
| 1          | BF16      | INT8         | 5.364       | 1.454             | True        |
| 1          | FP16      | FP8          | 5.363       | 1.601             | True        |
| 1          | BF16      | FP8          | 5.363       | 1.495             | True        |

**PixArt-Sigmaのqint8とQKVプロジェクション融合の比較 (TE量子化済み)**

| Batch Size | Quantization | Memory (GB) | Latency (Seconds) | Quantize TE | QKV Projection |
| :--------- | :----------- | :---------- | :---------------- | :---------- | :------------- |
| 1          | INT8         | 5.363       | 1.538             | True        | False          |
| 1          | INT8         | 5.536       | 1.504             | True        | True           |
| 4          | INT8         | 5.365       | 5.129             | True        | False          |
| 4          | INT8         | 5.538       | 4.989             | True        | True           |

**PixArt-SigmaのINT4量子化によるメモリ/レイテンシ比較 (bfloat16, H100)**

| Batch Size | Quantize TE | Memory (GB) | Latency (Seconds) |
| :--------- | :---------- | :---------- | :---------------- |
| 1          | No          | 9.380       | 7.431             |
| 1          | Yes         | 3.058       | 7.604             |

## 引用（Notable quotes）

「これらの高いメモリ要件は、コンシューマーGPUでこれらのモデルを使用することを困難にし、採用を遅らせ、実験をより難しくする可能性があります。」

## リスクと課題

*   **画質劣化**: INT4のような積極的な量子化は、画質に影響を与える可能性があります。特に最終層の量子化は避けるか、量子化認識学習（QAT）が必要となる場合があります。
*   **レイテンシ増加**: 量子化は一般的に推論レイテンシをわずかに増加させます。INT4の場合、ネイティブハードウェアサポートがないため、レイテンシ増加が顕著になります。
*   **Stable Diffusion 3の特殊性**: 複数のテキストエンコーダを持つSD3では、一部のエンコーダ（TE2）の量子化がうまく機能しない場合があるため、推奨される組み合わせに従う必要があります。
*   **ハードウェアサポートの制限**: INT4量子化は、現時点ではbfloat16とH100のような特定のGPUアーキテクチャの組み合わせでのみサポートされています。

## 今後の見通し/アクション

*   **QuantoとDiffusersの連携強化**: 将来的には、量子化されたTransformerモデルをDiffusersパイプラインに直接渡せるようになる予定です。
*   **さらなるモデルサポート**: Quantoでの保存・ロードに対応するDiffusersモデルの拡大が期待されます。ユーザーはHugging FaceにIssueを開いて要望を伝えることができます。
*   **ユーザーへの推奨**:
    *   メモリ要件に応じて、異なるパイプラインモジュールに異なる量子化タイプを適用する柔軟なアプローチを推奨します。
    *   `enable_model_cpu_offload()`など、Diffusersの他のメモリ最適化技術と量子化を組み合わせることを推奨します。
    *   画質回復のための強力な手段として、量子化認識学習（QAT）の利用も検討できます。

## Source URL（必須）
https://huggingface.co/blog/quanto-diffusers
