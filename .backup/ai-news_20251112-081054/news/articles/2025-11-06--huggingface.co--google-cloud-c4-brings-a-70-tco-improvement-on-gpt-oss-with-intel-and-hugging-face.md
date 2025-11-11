---
title: >-
  Google Cloud C4 Brings a 70% TCO improvement on GPT OSS with Intel and Hugging
  Face
title_ja: Google Cloud C4、GPT OSSのTCOを70%削減 IntelとHugging Face協力
source_url: 'https://huggingface.co/blog/gpt-oss-on-intel-xeon'
date: '2025-11-06'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - IntelとHugging Faceの共同ベンチマークにより、Google Cloud C4 VM（Intel Xeon
    6プロセッサ搭載）が、前世代のC3 VM（第4世代Intel Xeonプロセッサ搭載）と比較して、GPT OSS LL
  - '- ## 重要ポイント'
  - >-
    - *   **TCOの劇的な改善:** Google Cloud C4 VMは、GPT OSS LLM推論において、C3
    VMと比較してTCOを1.7倍改善。
  - '- *   **性能向上:** C4 VMは、vCPUあたりのスループットを1.4倍から1.7倍向上。'
  - >-
    - *   **最新プロセッサの採用:** C4 VMはIntel Xeon 6プロセッサ（Granite Rapids）を搭載し、C3
    VMの第4世代Intel Xeonプロセッサ（Sapphire Rapids）からのアップグレード。
---
## 概要 (TL;DR)

IntelとHugging Faceの共同ベンチマークにより、Google Cloud C4 VM（Intel Xeon 6プロセッサ搭載）が、前世代のC3 VM（第4世代Intel Xeonプロセッサ搭載）と比較して、GPT OSS LLMの推論においてTCO（総所有コスト）を1.7倍改善することが実証されました。C4 VMは、vCPUあたりのスループットも1.4倍から1.7倍向上し、大規模なMixture of Experts (MoE) モデルのCPU推論における性能とコスト効率の優位性を示しています。

## 重要ポイント

*   **TCOの劇的な改善:** Google Cloud C4 VMは、GPT OSS LLM推論において、C3 VMと比較してTCOを1.7倍改善。
*   **性能向上:** C4 VMは、vCPUあたりのスループットを1.4倍から1.7倍向上。
*   **最新プロセッサの採用:** C4 VMはIntel Xeon 6プロセッサ（Granite Rapids）を搭載し、C3 VMの第4世代Intel Xeonプロセッサ（Sapphire Rapids）からのアップグレード。
*   **MoEモデルの効率化:** IntelとHugging Faceは、MoEモデルの冗長計算を排除する最適化（PR #40304）を実装し、CPUでの大規模MoE推論の効率を大幅に向上。
*   **汎用CPUでのLLM推論:** 大規模MoEモデルが次世代汎用CPU上で効率的に提供可能であることを実証。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
IntelとHugging Faceは共同で、Google Cloudの最新C4仮想マシン（Intel Xeon 6プロセッサ搭載）が、GPT OSS大規模言語モデル（LLM）のテキスト生成性能において、前世代のC3 VMと比較してどれほどの価値向上をもたらすかをベンチマークしました。その結果、C4 VMがTCOで1.7倍、vCPUあたりのスループットで1.4倍から1.7倍の改善を達成したことが判明しました。

**背景:**
GPT OSSは、OpenAIが公開したオープンソースのMixture of Experts (MoE) モデルの通称です。MoEモデルは、専門化されたサブネットワークとゲーティングネットワークを使用し、入力に応じて特定のエキスパートのみを活性化することで、計算コストを線形に増加させることなくモデル容量を効率的にスケールできます。大規模なパラメータを持つMoEモデルでも、トークンごとにアクティブになるエキスパートはごく一部であるため、CPUでの推論が実現可能です。
IntelとHugging Faceは、MoEモデルの実行において、各エキスパートがルーティングされたトークンのみを処理するように最適化（PR #40304）を施し、冗長な計算を排除することで、FLOPsの無駄をなくし、利用率を向上させました。

**影響:**
このベンチマーク結果は、Google Cloud C4 VMが、大規模MoEモデルの推論において、性能とコスト効率の両面で前世代のC3 VMを大きく上回ることを示しています。特に、TCOの1.7倍改善は、運用コストの削減に直結し、企業や開発者にとって大きなメリットとなります。IntelとHugging Faceによるフレームワーク最適化が、次世代汎用CPU上での大規模MoEモデルの効率的な提供を可能にすることを裏付けています。

**関係者:**
*   **Intel:** Xeon 6プロセッサ（Granite Rapids）の開発元。
*   **Hugging Face:** Transformersライブラリの提供元であり、MoE実行最適化に貢献。
*   **Google Cloud:** C3およびC4仮想マシンの提供元。

**データ:**

| 項目             | C3 VM                               | C4 VM                               |
| :--------------- | :---------------------------------- | :---------------------------------- |
| プロセッサ       | 第4世代Intel Xeon (SPR)             | Intel Xeon 6 (GNR)                  |
| vCPU数           | 172                                 | 144                                 |
| モデル           | unsloth/gpt-oss-120b-BF16           | unsloth/gpt-oss-120b-BF16           |
| 精度             | bfloat16                            | bfloat16                            |
| タスク           | テキスト生成                        | テキスト生成                        |
| 入力長           | 1024トークン                        | 1024トークン                        |
| 出力長           | 1024トークン                        | 1024トークン                        |
| バッチサイズ     | 1, 2, 4, 8, 16, 32, 64              | 1, 2, 4, 8, 16, 32, 64              |
| **主要結果**     |                                     |                                     |
| TCO改善          | 基準                                | **1.7倍改善**                       |
| vCPUあたりスループット | 基準                                | **1.4倍〜1.7倍向上**                |
| 時間あたり価格   | C4より高い（vCPU数考慮）            | C3より低い（vCPU数考慮）            |

## 引用（Notable quotes）

*   「結果は出ており、目覚ましいもので、前世代のGoogle C3 VMインスタンスと比較して、総所有コスト（TCO）が1.7倍改善されたことを示しています。」
*   「Intel Xeon 6プロセッサ（GNR）を搭載したGoogle Cloud C4 VMは、前世代のGoogle Cloud C3 VM（第4世代Intel Xeonプロセッサ搭載）と比較して、大規模MoE推論において印象的な性能向上と優れたコスト効率の両方を提供します。」
*   「これらの結果は、IntelとHugging Faceによる的を絞ったフレームワーク最適化のおかげで、大規模MoEモデルが次世代汎用CPU上で効率的に提供できることを強調しています。」

## リスクと課題

本文中には、このベンチマーク結果に関する具体的なリスクや課題についての記述はありません。本記事は、C4 VMとIntel Xeon 6プロセッサの優位性を強調する成功事例の報告です。

## 今後の見通し/アクション

*   **C4 VMへの移行推奨:** 大規模なMoEモデル（GPT OSSなど）の推論ワークロードを持つユーザーは、Google Cloud C4 VMへのアップグレードを検討することで、大幅なコスト削減と性能向上を実現できる。
*   **CPUベースLLM推論の進化:** Intel Xeon 6プロセッサとHugging Faceのフレームワーク最適化の組み合わせにより、汎用CPU上での大規模LLM、特にMoEモデルの効率的な運用がさらに加速する。
*   **継続的な最適化:** IntelとHugging Faceは、今後もLLM推論の性能と効率を向上させるためのフレームワークレベルの最適化を継続していくと予想される。

## Source URL（必須）
https://huggingface.co/blog/gpt-oss-on-intel-xeon
