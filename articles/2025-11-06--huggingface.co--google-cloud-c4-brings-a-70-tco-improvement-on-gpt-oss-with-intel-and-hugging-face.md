---
title: "Google Cloud C4 Brings a 70% TCO improvement on GPT OSS with Intel and Hugging Face"
title_ja: "Google Cloud C4、Intel・Hugging FaceとGPT OSSのTCOを70%改善"
source_url: "https://huggingface.co/blog/gpt-oss-on-intel-xeon"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Google Cloud C4 VM（Intel Xeon 6プロセッサ搭載）は、GPT OSS LLMの推論において、前世代のC3 VM（第4世代Intel Xeonプロセッサ搭載）と比較して、TCO（総所有コスト）を70%改善（1.7倍の効率化）しました。vCPUあたりのスループット/ドルも1.4倍から1.7倍向上し、IntelとHugging Faceによるフレームワーク最適化が大規模MoEモデルのCPU推論効率を大幅に高めることを実証しました。

## 重要ポイント
*   **TCOの劇的な改善**: Google Cloud C4 VMは、GPT OSS LLM推論においてC3 VMに対し、TCOを1.7倍改善しました。
*   **スループット/vCPU/ドルの向上**: C4 VMはC3 VMと比較して、vCPUあたりのスループット/ドルが1.4倍から1.7倍向上しました。
*   **MoEモデルのCPU推論最適化**: IntelとHugging Faceは、transformersライブラリにエキスパート実行の最適化（PR #40304）をマージ。これにより、各エキスパートがルーティングされたトークンのみを処理し、FLOPsの無駄を排除し利用率を向上させました。
*   **ベンチマーク対象**: unsloth/gpt-oss-120b-BF16モデルを使用し、テキスト生成タスクで性能を評価しました。
*   **ハードウェア比較**: C4 VMはIntel Xeon 6 (Granite Rapids) を搭載し、C3 VMは第4世代Intel Xeon (Sapphire Rapids) を搭載しています。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
IntelとHugging Faceは共同で、Google Cloudの最新C4 VM（Intel Xeon 6プロセッサ搭載）が、前世代のC3 VM（第4世代Intel Xeonプロセッサ搭載）と比較して、OpenAI GPT OSS大規模言語モデル（LLM）のテキスト生成性能とTCOをどれだけ改善するかをベンチマークしました。

**背景:**
GPT OSSは、オープンソースのMixture of Experts (MoE) モデルであり、大規模なパラメータ数を持つにもかかわらず、トークンごとにアクティブ化されるエキスパートのサブセットが小さいため、CPU推論が現実的です。IntelとHugging Faceは、transformersライブラリにエキスパート実行の最適化を導入し、冗長な計算を排除することで、MoEモデルのCPU推論効率をさらに向上させました。

**影響:**
このベンチマーク結果は、Intel Xeon 6プロセッサを搭載したC4 VMが、GPT OSS MoE推論において、より高いスループット、低いレイテンシ、および大幅なコスト削減を実現することを示しました。これにより、次世代の汎用CPU上で大規模なMoEモデルを効率的に提供できることが実証されました。

**関係者:**
*   **Google Cloud**: C3およびC4仮想マシンインスタンスを提供。
*   **Intel**: Xeon 6プロセッサ（Granite Rapids）および第4世代Xeonプロセッサ（Sapphire Rapids）を提供し、Hugging Faceとの最適化に協力。
*   **Hugging Face**: transformersライブラリの最適化（PR #40304）に貢献し、ベンチマークを実施。

**データ:**
*   **モデル**: unsloth/gpt-oss-120b-BF16
*   **精度**: bfloat16
*   **タスク**: テキスト生成
*   **入力/出力長**: 1024トークン
*   **バッチサイズ**: 1, 2, 4, 8, 16, 32, 64
*   **VM構成**:

| Instance | Architecture                     | vCPUs |
| :------- | :------------------------------- | :---- |
| C3       | 4th Gen Intel Xeon processor (SPR) | 172   |
| C4       | Intel Xeon 6 processor (GNR)     | 144   |

*   **主要結果**:
    *   C4はC3に対し、バッチサイズ64で1.7倍のvCPUあたりスループットを達成。
    *   これにより、C4はC3と比較してTCOを1.7倍改善（C3が同量のトークン生成に1.7倍のコストが必要）。
    *   正規化されたスループット/vCPUは1.4倍から1.7倍の範囲でC4がC3を上回った。

## 引用（Notable quotes）
*   "The results are in, and they are impressive, demonstrating a 1.7x improvement in Total Cost of Ownership(TCO) over the previous-generation Google C3 VM instances."
*   "These results underline that thanks to targeted framework optimizations from Intel and Hugging Face, large MoE models can be efficiently served on next-generation general-purpose CPUs."

## リスクと課題
記事では、特定のベンチマーク結果と成功事例が強調されており、直接的なリスクや課題は言及されていません。

## 今後の見通し/アクション
Intel Xeon 6プロセッサを搭載したGoogle Cloud C4 VMは、大規模なMoEモデルのCPU推論において、性能とコスト効率の両面で優れた選択肢となることが示されました。IntelとHugging Faceによる継続的なフレームワーク最適化は、次世代の汎用CPUがLLM、特にMoEモデルの効率的なデプロイメントにおいて重要な役割を果たすことを可能にします。これにより、より多くの企業がコスト効率良く大規模AIモデルを運用できるようになるでしょう。

## Source URL
https://huggingface.co/blog/gpt-oss-on-intel-xeon
