---
title: "Open-R1: a fully open reproduction of DeepSeek-R1"
title_ja: "**Open-R1 DeepSeek-R1を完全オープン再現**"
source_url: "https://huggingface.co/blog/open-r1"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、DeepSeek-R1のデータとトレーニングパイプラインを完全にオープンソースで再現する「Open-R1」プロジェクトを発表しました。DeepSeek-R1は、OpenAIのo1モデルと同等以上の推論能力を持ち、純粋な強化学習（RL）を人間による監視なしで適用した画期的なモデルですが、そのデータセットやトレーニングコードは未公開です。Open-R1は、これらの「欠けているピース」を再構築し、推論モデルの透明性を高め、オープンソースコミュニティに再現可能な知見と基盤を提供することを目指します。

## 重要ポイント
*   **DeepSeek-R1の登場**: DeepSeek-R1は、OpenAIのo1モデルに匹敵する推論能力を持ち、純粋な強化学習（RL）を適用した初のモデルとして注目を集めました。
*   **未公開の要素**: DeepSeek-R1のモデルウェイトは公開されたものの、データ収集方法、トレーニングコード、ハイパーパラメータ、スケーリング法則などの詳細は未公開です。
*   **Open-R1の目的**: DeepSeek-R1のデータとトレーニングパイプラインを体系的に再構築し、その主張を検証し、オープンな推論モデルの限界を押し広げることを目指します。
*   **主要な計画**: DeepSeek-R1からのデータ蒸留、純粋なRLパイプラインの再現、多段階トレーニング（ベースモデル→SFT→RL）の実現を3つのステップで進めます。
*   **コミュニティへの貢献**: 合成データセットとRLトレーニングレシピを公開し、研究者や開発者が推論モデルを構築・改善するための基盤を提供します。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**DeepSeek-R1とは？**
DeepSeek-R1は、DeepSeekが発表した推論モデルで、OpenAIのo1モデルと同等以上の性能を発揮します。特に、人間による監視なしで純粋な強化学習（RL）を適用してベース言語モデルに推論能力を学習させた点が革新的です。このモデルは、DeepSeek-V3（671B MoEモデル）を基盤としており、DeepSeek-V3はSonnet 3.5やGPT-4oに匹敵する性能をわずか550万ドルという低コストで達成しています。

**DeepSeek-R1のトレーニングアプローチ**
DeepSeekは、DeepSeek-R1-ZeroとDeepSeek-R1の2つのモデルを公開しました。

| モデル名       | ベースモデル     | SFTの有無 | RLの有無 | RL手法 | 特徴                                                                                             |
| :------------- | :--------------- | :-------- | :------- | :----- | :----------------------------------------------------------------------------------------------- |
| DeepSeek-R1-Zero | DeepSeek-V3 (671B MoE) | なし      | あり     | GRPO   | 純粋なRL（Group Relative Policy Optimization）のみで訓練。推論スキルは高いが、応答の明瞭さに欠ける。 |
| DeepSeek-R1    | DeepSeek-V3 (671B MoE) | あり      | あり     | GRPO   | 「コールドスタート」SFTで明瞭さを改善後、RLと低品質出力の拒否（人間選好・検証可能報酬）で洗練。高品質な応答。 |

**Open-R1プロジェクトの背景と目的**
DeepSeek-R1の公開は画期的でしたが、データ収集方法、トレーニングコード、最適なハイパーパラメータ、スケーリング法則など、多くの詳細が未公開のままでした。これらの「欠けているピース」が、オープンソースコミュニティが同様のモデルを構築・改善する上での障壁となっています。
Open-R1プロジェクトは、これらの未公開部分を体系的に再構築し、DeepSeek-R1の主張を検証し、オープンな推論モデルの限界を押し広げることを目的としています。透明性の提供、再現可能な知見の共有、将来のモデルの基盤構築を目指します。

**Open-R1の計画**
Open-R1は以下の3つのステップでDeepSeek-R1の再現を目指します。

1.  **R1-Distillモデルの複製**: DeepSeek-R1から高品質な推論データセットを蒸留し、R1-Distillモデルを再現します。
2.  **純粋なRLパイプラインの複製**: DeepSeek-R1-Zeroの作成に使用された純粋なRLパイプラインを再現します。これには、数学、推論、コードに関する新しい大規模データセットのキュレーションが含まれます。
3.  **多段階トレーニングの実現**: ベースモデルからSFT（教師ありファインチューニング）を経てRLに至る多段階トレーニングを実証します。

これらの取り組みを通じて、合成データセットとRLトレーニングレシピをオープンソース化し、コミュニティが既存または新規のLLMを推論モデルにファインチューニングしたり、ゼロから同様のモデルを構築したりするための基盤を提供します。

## 引用（Notable quotes）
*   「However, the recipe behind OpenAI’s reasoning models has been a well kept secret. That is, until last week, when DeepSeek released their DeepSeek-R1 model and promptly broke the internet (and the stock market!).」
*   「The goal of Open-R1 is to build these last missing pieces so that the whole research and industry community can build similar or better models using these recipes and datasets.」
*   「This initiative isn’t just about replicating results—it’s about sharing insights with the community. By documenting what works, what doesn’t, and why, we hope to save others from wasting time and compute on unproductive paths.」

## リスクと課題
*   **データ収集方法の再現**: DeepSeek-R1で使用された推論特化型データセットのキュレーション方法が不明であり、その再現は大きな課題です。
*   **トレーニングコードとハイパーパラメータの特定**: DeepSeekからトレーニングコードが公開されていないため、最適なハイパーパラメータやモデルファミリー・スケールごとの違いを特定する必要があります。
*   **スケーリング法則の解明**: 推論モデルのトレーニングにおける計算資源とデータのトレードオフに関するスケーリング法則が不明であり、効率的な再現にはその解明が不可欠です。
*   **大規模な計算資源とデータセットのキュレーション**: プロジェクトの目標達成には、大規模な計算資源と、数学、推論、コードなどの分野における高品質なデータセットのキュレーションが必要です。

## 今後の見通し/アクション
Open-R1プロジェクトは、DeepSeek-R1の再現を通じて、推論モデルの透明性を高め、オープンソースコミュニティに貴重な知見を提供することを目指します。数学だけでなく、コードや医学といった科学分野への推論モデルの応用も視野に入れています。
プロジェクトは、成功例と失敗例の両方を文書化し、他の研究者や開発者が非生産的なパスで時間と計算資源を浪費するのを防ぐことを目標としています。
コミュニティからの貢献を積極的に募っており、コード提供、Hugging Faceでの議論参加など、様々な形でプロジェクトへの参加を呼びかけています。

## Source URL（必須）
https://huggingface.co/blog/open-r1
