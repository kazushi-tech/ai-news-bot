---
title: >-
  Google Cloud C4 Brings a 70% TCO improvement on GPT OSS with Intel and Hugging
  Face
title_ja: Google Cloud C4、Intel・Hugging Face協力でGPT OSSのTCO 7割減
source_url: 'https://huggingface.co/blog/gpt-oss-on-intel-xeon'
date: '2025-11-04'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - Google Cloudの最新C4 VMインスタンス（Intel Xeon 6プロセッサ搭載）が、前世代のC3 VM（第4世代Intel
    Xeonプロセッサ搭載）と比較し、OpenAI GPT OSS LLMの推論において、総所有コスト（T
  - '- ## 重要ポイント'
  - >-
    - *   **TCOの劇的な改善**: Google Cloud C4 VMは、前世代のC3 VMと比較して、GPT OSS
    LLMの推論におけるTCOを1.7倍（70%）改善しました。
  - >-
    - *   **スループットの向上**: C4 VMは、vCPUあたりスループットがC3
    VMの1.4倍から1.7倍に向上し、特にバッチサイズ64では1.7倍の性能差を記録しました。
  - >-
    - *   **Intel Xeon 6プロセッサの性能**: 最新のIntel Xeon 6プロセッサ（Granite
    Rapids）が、LLM推論において優れた性能とコスト効率を提供することを実証しました。
---
## 概要 (TL;DR)

Google Cloudの最新C4 VMインスタンス（Intel Xeon 6プロセッサ搭載）が、前世代のC3 VM（第4世代Intel Xeonプロセッサ搭載）と比較し、OpenAI GPT OSS LLMの推論において、総所有コスト（TCO）を1.7倍（70%）改善し、vCPUあたりスループットも最大1.7倍向上することをIntelとHugging Faceの共同ベンチマークが示しました。この結果は、大規模なMixture of Experts (MoE) モデルが次世代汎用CPUで効率的に運用可能であることを裏付けています。

## 重要ポイント

*   **TCOの劇的な改善**: Google Cloud C4 VMは、前世代のC3 VMと比較して、GPT OSS LLMの推論におけるTCOを1.7倍（70%）改善しました。
*   **スループットの向上**: C4 VMは、vCPUあたりスループットがC3 VMの1.4倍から1.7倍に向上し、特にバッチサイズ64では1.7倍の性能差を記録しました。
*   **Intel Xeon 6プロセッサの性能**: 最新のIntel Xeon 6プロセッサ（Granite Rapids）が、LLM推論において優れた性能とコスト効率を提供することを実証しました。
*   **MoEモデルの最適化**: IntelとHugging Faceは、TransformersライブラリにMoE実行最適化をマージし、冗長な計算を排除することで、CPU上でのMoEモデルの効率的な推論を可能にしました。

## 詳細レポート

### What happened
IntelとHugging Faceは、Google Cloudの最新C4 VMインスタンス（Intel Xeon 6プロセッサ搭載）と前世代のC3 VMインスタンス（第4世代Intel Xeonプロセッサ搭載）を比較するベンチマークを実施しました。このベンチマークは、OpenAI GPT OSS Large Language Model (LLM) のテキスト生成性能と総所有コスト (TCO) の改善を評価することを目的としていました。結果として、C4 VMはC3 VMに対してTCOを1.7倍改善し、vCPUあたりスループットも最大1.7倍向上することが示されました。

### 背景
*   **GPT OSSとMoEモデル**: GPT OSSはOpenAIが公開したオープンソースのMixture of Experts (MoE) モデルです。MoEモデルは、専門的なサブネットワーク（エキスパート）とゲーティングネットワークを使用し、入力に応じて最適なエキスパートを選択することで、計算コストを線形に増加させることなくモデル容量を効率的にスケールさせることができます。また、異なるエキスパートが異なるスキルを学習することで、多様なデータ分布に適応可能です。
*   **CPU推論の可能性**: MoEモデルは非常に大規模なパラメータを持つにもかかわらず、各トークンに対してアクティブになるエキスパートは一部であるため、CPUでの推論が実現可能です。
*   **共同最適化**: IntelとHugging Faceは、Transformersライブラリにエキスパート実行最適化 (PR #40304) をマージしました。これにより、各エキスパートがルーティングされたトークンのみを処理するようになり、冗長な計算（FLOPsの無駄）が排除され、CPU利用率が向上しました。

### 影響
*   **コスト効率の向上**: C4 VMは、C3 VMと比較して、同量のトークン生成にかかるコストを大幅に削減できるため、大規模LLM推論の運用コストを削減します。
*   **性能の向上**: vCPUあたりスループットの向上が、より高速なテキスト生成や、同じ時間でより多くの推論処理を可能にします。
*   **汎用CPUのLLM推論への適用**: この結果は、GPUだけでなく、次世代の汎用CPUでも大規模なMoEモデルを効率的に運用できる可能性を示し、LLM推論の選択肢を広げます。

### 関係者
*   **Google Cloud**: C3およびC4仮想マシンインスタンスの提供者。
*   **Intel**: Xeon 6プロセッサ（Granite Rapids）および第4世代Xeonプロセッサ（Sapphire Rapids）の開発元。Hugging Faceとの共同最適化を実施。
*   **Hugging Face**: Transformersライブラリの開発元。Intelとの共同最適化およびベンチマークを実施。
*   **OpenAI**: GPT OSS MoEモデルの元となる技術を提供。

### データ
**ベンチマーク設定:**
*   **モデル**: `unsloth/gpt-oss-120b-BF16`
*   **精度**: `bfloat16`
*   **タスク**: テキスト生成
*   **入出力長**: 1024トークン（左パディング）
*   **バッチサイズ**: 1, 2, 4, 8, 16, 32, 64
*   **有効機能**: Static KV cache, SDPA attention backend
*   **測定指標**: スループット (バッチ全体で1秒あたりに生成された総トークン数)

**ハードウェア比較:**

| インスタンス | アーキテクチャ                 | vCPU数 |
| :----------- | :----------------------------- | :----- |
| C3           | 4th Gen Intel Xeon processor (SPR) | 172    |
| C4           | Intel Xeon 6 processor (GNR)   | 144    |

**主要な結果:**

| 指標                                 | C4 vs C3 (改善率) |
| :----------------------------------- | :---------------- |
| TCO (Total Cost of Ownership)        | 1.7倍改善 (70%改善) |
| スループット/vCPU/ドル                | 1.4倍〜1.7倍向上  |
| vCPUあたりスループット (バッチサイズ64) | 1.7倍向上         |

## 引用（Notable quotes）

*   「The results are in, and they are impressive, demonstrating a 1.7x improvement in Total Cost of Ownership(TCO) over the previous-generation Google C3 VM instances.」
*   「These results underline that thanks to targeted framework optimizations from Intel and Hugging Face, large MoE models can be efficiently served on next-generation general-purpose CPUs.」

## リスクと課題

記事には明示的なリスクや課題の記載はありません。ただし、以下の点が考慮される可能性があります。
*   **特定のモデルと環境**: ベンチマークは特定のMoEモデル（GPT OSS）とGoogle Cloud環境に限定されており、他のLLMやクラウドプロバイダー、オンプレミス環境での性能は異なる可能性があります。
*   **最適化の依存性**: 性能向上はIntelとHugging Faceによる特定のフレームワーク最適化に大きく依存しており、将来的なモデルやフレームワークの変更によって再評価が必要となる可能性があります。

## 今後の見通し/アクション

*   **LLM推論の民主化**: Intel Xeon 6プロセッサを搭載したC4 VMのような次世代汎用CPUが、大規模MoEモデルの効率的な推論を可能にすることで、より多くの企業や開発者がコスト効率良くLLMを活用できるようになるでしょう。
*   **継続的な最適化**: IntelとHugging Faceによるフレームワークレベルでの最適化は、CPU上でのLLM性能をさらに向上させる可能性を秘めており、今後の進展が期待されます。
*   **クラウドプロバイダーの選択肢拡大**: 企業は、LLMワークロードの要件に応じて、GPUだけでなく、高性能なCPUベースのVMインスタンスも選択肢として検討できるようになります。

## Source URL
https://huggingface.co/blog/gpt-oss-on-intel-xeon
