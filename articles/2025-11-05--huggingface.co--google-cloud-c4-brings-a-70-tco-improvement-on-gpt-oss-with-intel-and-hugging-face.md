---
title: "Google Cloud C4 Brings a 70% TCO improvement on GPT OSS with Intel and Hugging Face"
title_ja: "Google Cloud C4、IntelとHugging FaceでGPT OSSのTCOを70%削減"
source_url: "https://huggingface.co/blog/gpt-oss-on-intel-xeon"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Google Cloud C4 VM（Intel Xeon 6プロセッサ搭載）が、旧世代のC3 VM（第4世代Intel Xeonプロセッサ搭載）と比較して、GPT OSS大規模言語モデル（LLM）の推論において、総所有コスト（TCO）を1.7倍（70%）改善し、vCPUあたりのスループットも1.4倍から1.7倍向上させた。これは、IntelとHugging FaceによるMoEモデル向けフレームワーク最適化の成果であり、大規模MoEモデルが次世代汎用CPU上で効率的に運用可能であることを示している。

## 重要ポイント
*   **TCOの劇的改善**: Google Cloud C4 VMは、GPT OSS LLM推論において、C3 VMと比較してTCOを1.7倍（70%）改善。
*   **スループット向上**: vCPUあたりの正規化スループットがC3 VMより1.4倍から1.7倍向上。
*   **Intel Xeon 6の性能**: Intel Xeon 6プロセッサ（Granite Rapids）が、LLM推論ワークロードで優れた性能を発揮。
*   **MoEモデル最適化**: IntelとHugging FaceがTransformersライブラリにエキスパート実行最適化をマージし、MoEモデルのCPU推論効率を大幅に改善。
*   **汎用CPUの可能性**: 大規模MoEモデルが、GPUだけでなく次世代汎用CPUでも効率的に提供できることを実証。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
IntelとHugging Faceは共同で、Google Cloudの最新C4 VM（Intel Xeon 6プロセッサ搭載）が、旧世代のC3 VM（第4世代Intel Xeonプロセッサ搭載）と比較して、OpenAI GPT OSS大規模言語モデル（LLM）のテキスト生成性能とコスト効率を大幅に向上させることを実証しました。具体的には、TCOが1.7倍改善され、vCPUあたりのスループットも1.4倍から1.7倍向上しました。

**背景:**
GPT OSSは、OpenAIが公開したオープンソースのMixture of Experts (MoE) モデルの通称です。MoEモデルは、特定の入力に対して専門的なサブネットワーク（エキスパート）を選択的に使用することで、計算コストを線形に増やすことなくモデル容量を効率的に拡張できます。IntelとHugging Faceは、Transformersライブラリにエキスパート実行最適化（PR #40304）を統合し、各エキスパートがルーティングされたトークンのみを処理するようにすることで、冗長な計算を排除し、FLOPsの無駄を削減してCPU利用率を向上させました。この最適化が、Intel Xeon 6プロセッサの性能と相まって、C4 VMでの推論効率向上に繋がりました。

**影響:**
この結果は、大規模なMoEモデルのCPU上での推論が、以前よりもはるかに費用対効果が高く、実用的であることを示しています。クラウドユーザーは、LLM推論ワークロードにおいて、より少ないコストで同等以上の性能を得られる可能性があり、インフラ選定の選択肢が広がります。

**関係者:**
*   **Google Cloud**: C3およびC4仮想マシンインスタンスの提供。
*   **Intel**: Xeon 6プロセッサ（GNR）および第4世代Xeonプロセッサ（SPR）の開発、Hugging Faceとの最適化協力。
*   **Hugging Face**: Transformersライブラリの開発、Intelとのエキスパート実行最適化の共同開発・マージ。
*   **OpenAI**: GPT OSS MoEモデルの元となる技術の提供。

**データ:**

**ベンチマーク設定概要:**

| 項目           | 詳細                                                              |
| :------------- | :---------------------------------------------------------------- |
| **モデル**     | unsloth/gpt-oss-120b-BF16 (MoEモデル)                             |
| **精度**       | bfloat16                                                          |
| **タスク**     | テキスト生成                                                      |
| **入力長**     | 1024トークン (左詰め)                                             |
| **出力長**     | 1024トークン                                                      |
| **バッチサイズ** | 1, 2, 4, 8, 16, 32, 64                                            |
| **有効機能**   | Static KV cache, SDPA attention backend                           |
| **測定指標**   | スループット (バッチ全体で生成された総トークン数/秒)              |

**テスト対象ハードウェア:**

| インスタンス | アーキテクチャ                 | vCPU数 |
| :----------- | :----------------------------- | :----- |
| C3           | 第4世代 Intel Xeon プロセッサ (SPR) | 172    |
| C4           | Intel Xeon 6 プロセッサ (GNR)  | 144    |

**主要結果:**

*   **vCPUあたりの正規化スループット**: C4はC3に対し、バッチサイズ64まで一貫して1.4倍から1.7倍の性能向上を示した。
*   **コストとTCO**: バッチサイズ64において、C4はC3の1.7倍のvCPUあたりスループットを提供。vCPUあたりの時間単価がほぼ同等であるため、C4はC3に対して約1.7倍のTCO優位性（同じトークン生成量に対してC3は1.7倍の費用が必要）をもたらす。

## 引用（Notable quotes）
*   「Google Cloud C4 VMは、GPT OSS MoE推論において、旧世代のGoogle Cloud C3 VMと比較して、目覚ましい性能向上と優れたコスト効率の両方を提供する。」
*   「これらの結果は、IntelとHugging Faceによる的を絞ったフレームワーク最適化のおかげで、大規模MoEモデルが次世代汎用CPU上で効率的に提供できることを強調している。」

## リスクと課題
記事本文には、直接的なリスクや課題に関する記述はありません。

## 今後の見通し/アクション
*   Intel Xeon 6プロセッサを搭載したGoogle Cloud C4 VMは、大規模LLM、特にMoEモデルのCPU推論において、費用対効果の高い強力な選択肢となる。
*   IntelとHugging Faceの継続的な協力によるフレームワーク最適化は、汎用CPU上でのLLM推論の適用範囲と効率をさらに拡大する可能性を秘めている。
*   企業や開発者は、LLM推論ワークロードのクラウドインフラストラクチャを検討する際、C4 VMの性能とコスト効率を積極的に評価すべきである。

## Source URL
https://huggingface.co/blog/gpt-oss-on-intel-xeon
