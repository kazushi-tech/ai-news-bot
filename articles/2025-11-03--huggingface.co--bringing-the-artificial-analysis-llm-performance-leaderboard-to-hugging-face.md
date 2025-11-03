---
title: "Bringing the Artificial Analysis LLM Performance Leaderboard to Hugging Face"
title_ja: "Artificial Analysis、LLMの品質・速度・価格評価リーダーボードをHugging Faceで公開"
source_url: "https://huggingface.co/blog/leaderboard-artificial-analysis"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Artificial Analysisが開発したLLMパフォーマンスリーダーボードがHugging Faceに導入されました。このリーダーボードは、LLMアプリケーション開発において品質だけでなく、速度と価格も考慮した総合的なモデル選定を支援するため、100以上のサーバーレスLLM APIエンドポイントの品質、価格、速度（スループット、レイテンシ）を評価・比較します。

## 重要ポイント
*   **総合的な評価**: LLMの選定において、品質だけでなく速度と価格が同等かそれ以上に重要であるという認識に基づき、これら3つの主要メトリクスを統合して評価します。
*   **広範なカバレッジ**: 100以上のサーバーレスLLM APIエンドポイント（オープンソースおよびプロプライエタリモデル）を対象としています。
*   **詳細なメトリクス**: 品質（MMLU、MT-Benchなど）、コンテキストウィンドウ、価格（入力/出力トークン、ブレンド）、スループット（TPS）、レイテンシ（TTFT）を詳細に測定・報告します。
*   **市場の複雑性に対応**: 急速に進化し、多様なモデルが登場するLLM市場において、エンジニアが最適なモデルを選択するための意思決定ツールを提供します。
*   **ユースケース例**: 速度と価格を重視した複数の小型モデルを組み合わせることで、単一の大型モデルよりもコスト効率が良く、高品質な結果を得られる可能性があることを示唆しています。

## 詳細レポート
### What happened
Artificial Analysisが開発したLLMパフォーマンスリーダーボードがHugging Faceのプラットフォームに導入されました。これにより、AIエンジニアはLLMの選定において、品質、速度、価格を包括的に比較検討できるようになります。

### 背景
LLMを利用したアプリケーション開発では、ユーザーエンゲージメントやシステム全体の能力において、応答速度とコストが品質と同等、あるいはそれ以上に重要となるケースが増えています。特に、消費者向けアプリケーションやエージェントシステムでは、遅延がユーザー体験やシステム性能のボトルネックとなるため、これらの要素を総合的に評価できるツールが求められていました。

### 影響
*   AIエンジニアは、アプリケーションの特定の要件（例：高速応答、低コスト、高精度）に基づいて、最適なLLMとAPIプロバイダーを効率的に選択できるようになります。
*   LLM市場の透明性が向上し、プロバイダー間の競争が促進される可能性があります。
*   開発者は、単一の大型モデルに依存するのではなく、速度と価格の異なる複数のモデルを組み合わせるなど、より洗練された設計パターンを検討できるようになります。

### 関係者
*   **Artificial Analysis (@ArtificialAnlys)**: LLMパフォーマンスリーダーボードの開発元。
*   **Hugging Face**: リーダーボードをプラットフォームに導入し、公開するホスティング元。
*   **LLMプロバイダー**: リーダーボードで評価される100以上のサーバーレスLLM APIエンドポイントを提供する企業。
*   **AIエンジニア**: リーダーボードの主要な利用者であり、LLM選定の意思決定を行う開発者。

### データ
**メトリクス:**
*   **品質**: MMLU、MT-Bench、HumanEvalスコア、Chatbot Arenaランキングに基づく簡略化された指標。
*   **コンテキストウィンドウ**: LLMが一度に処理できる最大トークン数（入力+出力）。
*   **価格**: プロバイダーが課金する入力/出力トークンごとの価格。ブレンド価格（入力:出力=3:1）も提供。
*   **スループット**: 推論時のトークン出力速度（tokens/s）。過去14日間のメディアン、P5、P25、P75、P95を報告。
*   **レイテンシ**: リクエスト送信から最初のトークン応答までの時間（TTFT）。過去14日間のメディアン、P5、P25、P75、P95を報告。

**テストワークロード:**
以下の組み合わせでパフォーマンスを測定します（合計6種類）。
*   **プロンプト長**: 約100トークン、約1kトークン、約10kトークン。
*   **並列クエリ**: 1クエリ、10並列クエリ。

**方法論:**
*   各APIエンドポイントは1日8回テストされ、リーダーボードの数値は過去14日間のメディアン値を反映。
*   品質メトリクスは現在、モデル作者による報告値に基づいているが、今後は独立した品質評価結果も共有予定。

**2024年5月のハイライト:**
*   **市場の複雑化**: Anthropic Claude 3、Databricks DBRX、Cohere Command R Plus、Google Gemma、Microsoft Phi-3、Mistral Mixtral 8x22B、Meta Llama 3など、過去2ヶ月で多数の新規モデルが登場。
*   **価格と速度の大きなばらつき**: Claude 3 OpusからLlama 3 8Bまで、価格に300倍以上の開きがある。
*   **APIプロバイダーの迅速な対応**: Llama 3モデルのリリース後48時間以内に7社のプロバイダーが提供を開始し、オープンソースモデルへの高い需要とプロバイダー間の競争を示唆。
*   **主要モデルの分類**:

| 品質カテゴリ | モデル例                                          | 特徴 (価格/速度) |
| :----------- | :------------------------------------------------ | :--------------- |
| 高品質       | GPT-4 Turbo, Claude 3 Opus                        | 高価格、低速     |
| 中品質       | Llama 3 70B, Mixtral 8x22B, Command R+, Gemini 1.5 Pro, DBRX | 中価格、中速     |
| 低品質       | Llama 3 8B, Claude 3 Haiku, Mixtral 8x7B          | 低価格、高速     |

## 引用（Notable quotes）
*   "Building applications with LLMs requires considering more than just quality: for many use-cases, speed and price are equally or more important."
    （LLMでアプリケーションを構築するには、品質だけでなく、多くのユースケースで速度と価格が同等かそれ以上に重要であることを考慮する必要があります。）
*   "From Claude 3 Opus to Llama 3 8B, there is a 300x pricing spread - that's more than two orders of magnitude!"
    （Claude 3 OpusからLlama 3 8Bまで、価格には300倍もの開きがあり、これは2桁以上の差です！）
*   "Within 48 hours, 7 providers were offering the Llama 3 models. Speaking to the demand for new, open-source models and the competitive dynamics between API providers."
    （Llama 3モデルは48時間以内に7社のプロバイダーから提供されました。これは新しいオープンソースモデルへの需要とAPIプロバイダー間の競争力学を示しています。）

## リスクと課題
*   **市場の急速な変化**: LLM市場は非常に急速に進化しており、新しいモデルやプロバイダーが継続的に登場するため、リーダーボードの情報を常に最新に保つことが課題となります。
*   **品質評価の独立性**: 現在、品質メトリクスはモデル作者による報告値に依存している部分があり、より客観的で独立した品質評価の確立が今後の課題として挙げられています。

## 今後の見通し/アクション
*   リーダーボードは継続的に更新され、最新のLLMパフォーマンスデータを提供し続けます。
*   Artificial Analysisは、各エンドポイントにおける独立した品質評価の結果を今後共有していく予定です。
*   ユーザーはTwitterやLinkedInを通じて最新情報を受け取ることができ、問い合わせも可能です。

## Source URL
https://huggingface.co/blog/leaderboard-artificial-analysis
