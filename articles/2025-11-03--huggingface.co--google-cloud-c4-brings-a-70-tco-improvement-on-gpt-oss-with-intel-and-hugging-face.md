---
title: "Google Cloud C4 Brings a 70% TCO improvement on GPT OSS with Intel and Hugging Face"
title_ja: "Google Cloud C4、Intel・Hugging FaceがGPT OSSのTCOを70%削減"
source_url: "https://huggingface.co/blog/gpt-oss-on-intel-xeon"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Google Cloud C4 VM（Intel Xeon 6プロセッサ搭載）が、前世代のC3 VM（4th Gen Intel Xeonプロセッサ搭載）と比較して、OpenAI GPT OSS大規模言語モデル（LLM）のテキスト生成において、総所有コスト（TCO）を最大1.7倍改善し、性能とコスト効率を大幅に向上させた。IntelとHugging Faceの共同によるフレームワーク最適化がこの成果に貢献している。

## 重要ポイント
*   **TCOの劇的な改善:** Google Cloud C4 VMは、GPT OSS LLMの推論において、前世代のC3 VMと比較してTCOを最大1.7倍改善。
*   **性能向上:** C4 VMは、vCPUあたりのスループットでC3 VMを1.4倍から1.7倍上回る性能を発揮。
*   **コスト効率:** C4 VMはC3 VMよりも時間あたりの価格が低く、同等の生成トークン量に対して必要な費用が大幅に削減される。
*   **MoEモデルのCPU推論効率化:** IntelとHugging Faceによるエキスパート実行最適化（PR #40304）により、MoEモデルのCPU上での推論がより効率的に。
*   **次世代CPUの優位性:** Intel Xeon 6プロセッサ（Granite Rapids）を搭載したC4 VMが、4th Gen Intel Xeonプロセッサ（Sapphire Rapids）を搭載したC3 VMを性能とコストの両面で凌駕。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
IntelとHugging Faceは共同で、Google Cloudの最新C4仮想マシン（Intel Xeon 6プロセッサ搭載）が、前世代のC3仮想マシンと比較して、OpenAI GPT OSS大規模言語モデル（LLM）のテキスト生成性能と総所有コスト（TCO）をどれだけ改善するかをベンチマークした。その結果、C4 VMがTCOを最大1.7倍改善し、vCPUあたりのスループットも大幅に向上することが実証された。

**背景:**
GPT OSSは、OpenAIがリリースしたオープンソースのMixture of Experts（MoE）モデルの一般的な名称。MoEモデルは、計算コストを線形に増加させることなくモデル容量を効率的にスケールできる特徴を持つ。大規模なパラメータを持つMoEモデルでも、トークンごとにアクティブ化されるエキスパートは一部であるため、CPU推論が実用的である。IntelとHugging Faceは、transformersライブラリにエキスパートがルーティングされたトークンのみを処理する最適化（PR #40304）をマージし、冗長な計算を排除して利用率を向上させた。

**影響:**
*   **性能とコスト効率の向上:** C4 VMは、GPT OSS MoE推論において、C3 VMよりも高いスループット、低いレイテンシ、および低いコストを実現し、ユーザーはより少ない費用でより多くの処理が可能になる。
*   **大規模MoEモデルのCPU展開の実現可能性:** ターゲットを絞ったフレームワーク最適化により、大規模MoEモデルが次世代汎用CPU上で効率的に提供可能であることを実証し、GPUに依存しない新たな展開オプションを提示。
*   **クラウドインフラの選択肢の明確化:** LLMワークロードにおいて、最新のCPUアーキテクチャとVMインスタンスが大幅なコスト削減と性能向上をもたらすことを示し、クラウド利用戦略に影響を与える。

**関係者:**
*   **Intel:** Intel Xeon 6プロセッサ（Granite Rapids）を提供し、Hugging Faceと共同でフレームワーク最適化を実施。
*   **Hugging Face:** transformersライブラリのエキスパート実行最適化（PR #40304）を共同で開発・マージし、ベンチマークを実施。
*   **Google Cloud:** 最新のC4 VMインスタンスを提供。

**データ:**
*   **ベンチマーク対象モデル:** unsloth/gpt-oss-120b-BF16 (bfloat16精度)
*   **タスク:** テキスト生成 (入力長1024トークン、出力長1024トークン)
*   **ベンチマーク環境:**
    *   C3 VM: 4th Gen Intel Xeon processor (SPR), 172 vCPUs
    *   C4 VM: Intel Xeon 6 processor (GNR), 144 vCPUs
*   **主な結果:**
    *   **正規化されたスループット/vCPU:** C4はC3を1.4倍から1.7倍上回る。
    *   **TCO改善:** バッチサイズ64において、C4はC3の1.7倍のvCPUあたりスループットを提供し、vCPUあたりの価格がほぼ同等であるため、TCOで1.7倍の優位性。
    *   **価格:** C4 VMはC3 VMよりも時間あたりの価格が低い。

**ベンチマーク結果サマリー**

| 指標                       | C3 VM (4th Gen Intel Xeon) | C4 VM (Intel Xeon 6) | 改善率 (C4 vs C3) |
| :------------------------- | :------------------------- | :------------------- | :---------------- |
| vCPUs                      | 172                        | 144                  | -                 |
| スループット/vCPU          | 基準                       | 1.4x - 1.7x          | 1.4x - 1.7x       |
| TCO (総所有コスト)         | 基準                       | 1/1.7x               | 1.7x 改善         |
| 時間あたりの価格           | 基準                       | 低い                 | -                 |

## 引用（Notable quotes）
*   「The results are in, and they are impressive, demonstrating a 1.7x improvement in Total Cost of Ownership(TCO) over the previous-generation Google C3 VM instances.」
*   「Google Cloud C4 VMs powered by Intel Xeon 6 processors (GNR) provide both impressive performance gains and better cost efficiency for large MoE inference over previous generation Google Cloud C3 VM (powered by 4th Gen Intel Xeon processors).」
*   「These results underline that thanks to targeted framework optimizations from Intel and Hugging Face, large MoE models can be efficiently served on next-generation general-purpose CPUs.」

## リスクと課題
*   **特定のモデルとタスクへの限定:** ベンチマークはGPT OSSモデルのテキスト生成に特化しており、他のLLMモデルや異なるタスク（例：ファインチューニング、推論以外のワークロード）での性能は異なる可能性がある。
*   **ハードウェア構成の依存性:** 結果は特定のvCPU数と構成に依存しており、異なるインスタンスタイプやvCPU数での性能は再評価が必要となる。
*   **最適化の継続性:** フレームワークの最適化は継続的に行われるため、将来のバージョンで性能特性が変化する可能性がある。
*   **クラウドプロバイダーの価格変動:** クラウドインスタンスの価格は変動する可能性があり、TCOの優位性が常に維持されるとは限らない。

## 今後の見通し/アクション
*   **MoEモデルのCPU展開の加速:** 今回の結果は、大規模MoEモデルをGPUだけでなく、最新の高性能CPU上でもコスト効率良く展開できる可能性を示唆しており、より幅広い企業や開発者がMoEモデルを利用できるようになる。
*   **継続的な最適化とコラボレーション:** IntelとHugging Faceは、LLMの性能と効率をさらに向上させるために、ハードウェアとソフトウェアの両面で継続的な最適化とコラボレーションを進めることが期待される。
*   **クラウドプロバイダーの提供強化:** Google Cloudのようなクラウドプロバイダーは、Intel Xeon 6プロセッサを搭載したC4 VMのような高性能・高効率なインスタンスの提供をさらに強化し、LLMワークロードの需要に応えることが予想される。
*   **他のLLMやワークロードへの適用:** 今回の最適化手法やベンチマーク結果を、他のオープンソースLLMや異なるAIワークロードにも適用し、CPU上での効率的な実行を追求する動きが広がる可能性がある。

## Source URL（必須）
https://huggingface.co/blog/gpt-oss-on-intel-xeon
