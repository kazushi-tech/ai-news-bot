---
title: "Open-R1: a fully open reproduction of DeepSeek-R1"
title_ja: "Open-R1、DeepSeek-R1の全貌を完全オープン再現"
source_url: "https://huggingface.co/blog/open-r1"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

DeepSeekが、OpenAIのo1モデルと同等以上の推論性能を持つ「DeepSeek-R1」モデルをリリースしました。これは、人間による監視なしに純粋な強化学習（RL）を用いて基盤モデルに推論能力を付与した画期的なモデルです。しかし、DeepSeek-R1のトレーニングに使用されたデータセットとコードは非公開でした。これを受け、Hugging Faceは「Open-R1」プロジェクトを立ち上げ、DeepSeek-R1のデータとトレーニングパイプラインを体系的に再現し、オープンソースコミュニティに提供することを目指します。

## 重要ポイント

*   **DeepSeek-R1の登場**: DeepSeek-R1は、OpenAIのo1モデルと同等またはそれ以上の推論性能を発揮し、数学、コーディング、論理などの推論タスクで優れた能力を示しました。
*   **純粋な強化学習の採用**: DeepSeek-R1は、人間による監視なしに純粋な強化学習（RL）を適用して、基盤言語モデルに推論能力を教えるという革新的なアプローチを採用しました。
*   **「欠けているピース」**: DeepSeek-R1の技術レポートは詳細でしたが、トレーニングに使用されたデータセットとコードは公開されず、データ収集方法やハイパーパラメータ、スケーリング法則に関する疑問が残りました。
*   **Open-R1プロジェクトの立ち上げ**: Hugging Faceは、DeepSeek-R1のデータとトレーニングパイプラインを再現し、その主張を検証し、オープンな推論モデルの限界を押し広げることを目的としたOpen-R1プロジェクトを開始しました。
*   **オープンソース化への貢献**: Open-R1は、RLが推論をどのように強化するかについての透明性を提供し、再現可能な知見をオープンソースコミュニティと共有し、将来のモデルがこれらの技術を活用するための基盤を構築することを目指します。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
DeepSeekは、OpenAIのo1モデルに匹敵する、またはそれを上回る推論能力を持つ「DeepSeek-R1」モデルを発表しました。このモデルは、純粋な強化学習（RL）を適用して、人間による監視なしに推論能力を向上させた点で注目されました。しかし、モデルの重みは公開されたものの、トレーニングに使用されたデータセットとコードは非公開でした。これに対し、Hugging Faceは、DeepSeek-R1のデータとトレーニングパイプラインを再現し、オープンソースコミュニティに提供するための「Open-R1」プロジェクトを立ち上げました。

**背景:**
OpenAIのo1モデルは、推論時に計算リソースを増やすことでLLMの推論タスク解決能力が大幅に向上することを示しましたが、そのトレーニングレシピは秘密でした。DeepSeek-R1のリリースは、この秘密の一部を明らかにし、特に純粋なRLが推論モデルの構築に有効であることを示しました。しかし、データ収集、モデルトレーニングのハイパーパラメータ、スケーリング法則に関する具体的な情報は不足していました。

**影響:**
DeepSeek-R1の登場は、推論モデル開発における強化学習の可能性を強く示唆しました。Open-R1プロジェクトは、DeepSeek-R1の成功要因をオープンソースコミュニティが理解し、再現し、さらに発展させるための重要な一歩となります。これにより、推論モデルの研究と開発が加速されることが期待されます。

**関係者:**
*   **DeepSeek**: DeepSeek-R1モデルの開発元。基盤モデルDeepSeek-V3（671B MoE）をベースに、DeepSeek-R1-Zero（純粋RL）とDeepSeek-R1（SFT+RL）を開発。
*   **OpenAI**: o1モデルの開発元。LLMの推論能力向上における先駆者。
*   **Hugging Face**: Open-R1プロジェクトの主導者。DeepSeek-R1の再現とオープンソース化を目指し、コミュニティの貢献を募る。

**データ:**
*   **DeepSeek-R1の基盤**: DeepSeek-V3 (671B Mixture of Expertsモデル)。Sonnet 3.5やGPT-4oと同等の性能を持ち、Multi Token Prediction (MTP) や Multi-Head Latent Attention (MLA) などのアーキテクチャ変更により、550万ドルの低コストでトレーニングされた。
*   **DeepSeek-R1のトレーニングアプローチ**:
    *   **DeepSeek-R1-Zero**: 教師ありファインチューニングをスキップし、Group Relative Policy Optimization (GRPO) を用いた純粋な強化学習に完全に依存。シンプルな報酬システムでモデルをガイドし、問題分解や自己検証スキルを開発したが、応答の明瞭さに課題があった。
    *   **DeepSeek-R1**: 「コールドスタート」フェーズで少数の厳選された例でファインチューニングを行い、明瞭さと可読性を向上。その後、人間の好みや検証可能な報酬に基づく低品質出力の拒否を含む、さらなるRLと洗練ステップを経て、高品質な推論と一貫した応答を生成するモデルを構築。
*   **Open-R1のデータ計画**: DeepSeek-R1から高品質な推論データセットを蒸留し、数学、推論、コード向けの大規模な新規データセットをキュレーションする予定。

## 引用（Notable quotes）

*   「Besides performing as well or better than o1, the DeepSeek-R1 release was accompanied by a detailed tech report that outlined the key steps of their training recipe.」
*   「This recipe involved several innovations, most notably the application of pure reinforcement learning to teach a base language model how to reason without any human supervision.」
*   「The goal of Open-R1 is to build these last missing pieces so that the whole research and industry community can build similar or better models using these recipes and datasets.」

## リスクと課題

*   **情報不足**: DeepSeek-R1のデータ収集方法、最適なハイパーパラメータ、異なるモデルファミリーやスケールでの違い、計算とデータのトレードオフに関する詳細が不明なままです。
*   **再現の難しさ**: DeepSeek-R1のトレーニングパイプライン、特に純粋な強化学習の部分を正確に再現するには、高品質なデータセットのキュレーションと複雑なRLアルゴリズムの実装に大きな技術的課題が伴います。
*   **リソースの制約**: 大規模なデータセットのキュレーションやモデルのトレーニングには、多大な計算リソースと時間が必要です。
*   **コミュニティの協力**: Open-R1プロジェクトの成功は、オープンソースコミュニティからのコード貢献、議論への参加、知見の共有にかかっています。

## 今後の見通し/アクション

Open-R1プロジェクトは、DeepSeek-R1のデータとトレーニングパイプラインを再現し、オープンソース化することを目指します。具体的な計画は以下の3段階です。

1.  **R1-Distillモデルの再現**: DeepSeek-R1から高品質な推論データセットを蒸留し、既存または新規のLLMを推論モデルにファインチューニングできるようにします。
2.  **純粋なRLパイプラインの再現**: DeepSeek-R1-Zeroの作成に使用された純粋な強化学習パイプラインを再現します。これには、数学、推論、コード向けの大規模な新規データセットのキュレーションが含まれます。
3.  **多段階トレーニングの実現**: ベースモデルから教師ありファインチューニング（SFT）を経て強化学習（RL）に至る多段階トレーニングのプロセスを実証します。

プロジェクトは数学データセットに留まらず、コードや医学などの科学分野への応用も探求する予定です。Hugging Faceは、コード貢献やHugging Face上での議論への参加など、コミュニティからの積極的な協力を呼びかけています。これにより、知見を共有し、研究開発における無駄な労力を削減することを目指します。

## Source URL（必須）
https://huggingface.co/blog/open-r1
