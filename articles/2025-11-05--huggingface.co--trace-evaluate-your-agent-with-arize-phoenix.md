---
title: "Trace & Evaluate your Agent with Arize Phoenix"
title_ja: "Arize Phoenixがエージェントの挙動を解明、性能を評価"
source_url: "https://huggingface.co/blog/smolagents-phoenix"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

本記事は、AIエージェントの動作を可視化（トレース）し、その性能を評価する実践的な方法をArize Phoenixを用いて解説しています。`smolagents`ライブラリで構築したエージェントを例に、OpenTelemetryとOpenInferenceによるリアルタイムトレース、およびGPT-4oのようなLLMを評価者（LLM-as-a-judge）として活用したツール実行の関連性評価の手順を具体的に示し、エージェントの透明性と効果性を高めるための手法を提供します。

## 重要ポイント

*   **エージェントの「理解」の重要性**: エージェントを構築するだけでなく、その内部動作を理解し、効果性を測定することが不可欠です。
*   **Arize Phoenixの一元化プラットフォーム**: エージェントの意思決定をリアルタイムでトレース、評価、デバッグするための中央プラットフォームを提供します。
*   **自動トレース機能**: `smolagents[telemetry]`とOpenTelemetry、OpenInferenceを組み合わせることで、エージェントの各ステップ（ツール呼び出し、入力処理、応答生成）を自動的に追跡・可視化できます。
*   **LLM-as-a-judgeによる評価**: GPT-4oなどの大規模言語モデルを評価者として利用し、エージェントが使用するツールの検索結果の関連性などを客観的に測定する手法を紹介します。
*   **多様な評価テンプレート**: Phoenixは、RAG関連性、ハルシネーション検出、コード生成、毒性検出など、様々なユースケースに対応する豊富な評価テンプレートを提供します。

## 詳細レポート

### What happened
Hugging Faceのブログ記事が、AIエージェントの構築、トレース、評価のプロセスをArize Phoenixを用いて詳細に解説しました。具体的には、`smolagents`ライブラリで作成したツール呼び出し型エージェント（DuckDuckGoSearchToolとVisitWebpageToolを使用）を例に、その実行過程をOpenTelemetryとOpenInferenceを介してArize Phoenixでリアルタイムにトレースする方法、さらにOpenAIのGPT-4oを「LLM-as-a-judge」として利用し、エージェントが使用する検索ツールの結果の関連性を評価する手順が示されました。

### 背景
AIエージェントは自律的に意思決定を行い、タスクを実行しますが、その内部動作はブラックボックスになりがちです。エージェントが期待通りに機能しているか、なぜ特定の決定を下したのかを理解し、性能を客観的に測定することは、デバッグ、最適化、そして信頼性の高いAIシステムの開発において不可欠な課題です。

### 影響
*   **透明性の向上**: エージェントの複雑な意思決定プロセスが可視化され、開発者がその動作を深く理解できるようになります。
*   **デバッグの効率化**: 問題発生時に、どのステップで何が起こったかを正確に特定し、迅速にデバッグできます。
*   **性能の客観的評価**: LLM-as-a-judgeなどの手法により、エージェントの出力やツールの利用効果を客観的に測定し、改善点を特定できます。
*   **信頼性の高いAI開発**: 継続的なトレースと評価を通じて、エージェントの信頼性と効果性を高め、より堅牢なAIアプリケーションを構築できます。

### 関係者
*   **Arize Phoenix**: エージェントのトレース、評価、デバッグを一元的に行うプラットフォーム。
*   **smolagents**: AIエージェントを構築するためのPythonライブラリ。
*   **OpenTelemetry**: 計測データ（トレース、メトリクス、ログ）を収集・エクスポートするためのオープンスタンダード。
*   **OpenInference**: LLMアプリケーションの推論を計測するためのOpenTelemetryベースの標準。
*   **OpenAI (GPT-4o)**: LLM-as-a-judgeとして評価タスクを実行する大規模言語モデル。
*   **DuckDuckGoSearchTool, VisitWebpageTool**: `smolagents`のエージェントが情報収集のために使用するツール。

### データ
**エージェント構築と実行例:**
```python
# 必要なライブラリのインストール
pip install -q smolagents

# エージェントの作成と実行
from smolagents import CodeAgent, DuckDuckGoSearchTool, VisitWebpageTool, HfApiModel
hf_model = HfApiModel()
agent = CodeAgent(
    tools=[DuckDuckGoSearchTool(), VisitWebpageTool()],
    model=hf_model,
    add_base_tools=True
)
agent.run("fetch the share price of google from 2020 to 2024, and create a line graph from it?")
```

**トレース設定例:**
```python
# テレメトリーモジュールのインストール
pip install -q 'smolagents[telemetry]'

# Phoenixサーバーの起動（ローカル）
python -m phoenix.server.main serve

# トレーサープロバイダーの登録とsmolagentsの計測
from phoenix.otel import register
from openinference.instrumentation.smolagents import SmolagentsInstrumentor
tracer_provider = register(project_name="my-smolagents-app")
SmolagentsInstrumentor().instrument(tracer_provider=tracer_provider)
```

**評価設定と実行例 (LLM-as-a-judge):**
```python
# OpenAIライブラリのインストール
pip install -q openai

# ツール実行スパンの取得
from phoenix.trace.dsl import SpanQuery
import phoenix as px
query = SpanQuery().where("name == 'DuckDuckGoSearchTool'").select(input="input.value", reference="output.value")
tool_spans = px.Client().query_spans(query, project_name="my-smolagents-app")

# 評価の実行 (GPT-4oを使用)
from phoenix.evals import llm_classify, OpenAIModel, RAG_RELEVANCY_PROMPT_TEMPLATE
eval_model = OpenAIModel(model="gpt-4o")
eval_results = llm_classify(
    dataframe=tool_spans,
    model=eval_model,
    template=RAG_RELEVANCY_PROMPT_TEMPLATE,
    rails=["relevant", "unrelated"],
    concurrency=10,
    provide_explanation=True,
)
eval_results["score"] = eval_results["explanation"].apply(lambda x: 1 if "relevant" in x else 0)

# 評価結果をPhoenixに送信
from phoenix.trace import SpanEvaluations
px.Client().log_evaluations(SpanEvaluations(eval_name="DuckDuckGoSearchTool Relevancy", dataframe=eval_results))
```

**Phoenixが提供する評価テンプレートの例:**

| 評価テンプレート           | 適用可能なエージェントタイプ                               |
| :----------------------- | :--------------------------------------------------------- |
| Hallucination Detection  | RAGエージェント、汎用チャットボット、知識ベースアシスタント |
| Q&A on Retrieved Data    | RAGエージェント、リサーチアシスタント、文書検索ツール      |
| RAG Relevance            | RAGエージェント、検索ベースAIアシスタント                  |
| Summarization            | 要約ツール、文書ダイジェスター、会議メモ生成器             |
| Code Generation          | コードアシスタント、AIプログラミングボット                 |
| Toxicity Detection       | モデレーションボット、コンテンツフィルタリングAI           |
| AI vs Human (Ground Truth) | 評価＆ベンチマークツール、AI生成コンテンツバリデーター     |
| Reference (Citation) Link | リサーチアシスタント、引用ツール、学術論文作成補助         |
| SQL Generation Evaluation | データベースクエリエージェント、SQL自動化ツール            |
| Agent Function Calling Evaluation | マルチステップ推論エージェント、API呼び出しAI、タスク自動化ボット |

## 引用（Notable quotes）

*   "Building an agent is one thing; understanding its behavior is another."
*   "Think of it like having an X-ray for your agent’s decision-making process."
*   "true intelligence comes from knowing exactly what’s happening under the hood."

## リスクと課題

*   **LLM-as-a-judgeの限界**: LLMによる評価は強力ですが、評価モデル自体のバイアスや、複雑なニュアンスの解釈における限界が存在する可能性があります。
*   **評価設定の複雑さ**: 適切な評価テンプレートの選択、プロンプトの設計、評価基準の設定は、エージェントの目的やドメインに合わせて慎重に行う必要があります。
*   **トレースのオーバーヘッド**: リアルタイムトレースはシステムのパフォーマンスにわずかなオーバーヘッドをもたらす可能性があり、大規模な運用では考慮が必要です。
*   **Phoenixのホスティングと管理**: Phoenixのローカル、オンライン、セルフホスト、Hugging Face Spacesなど多様なホスティングオプションから最適なものを選択し、管理する手間が発生します。

## 今後の見通し/アクション

*   **継続的な最適化**: エージェント開発者は、Arize Phoenixを活用してエージェントの動作を深く理解し、トレースと評価の結果に基づいて継続的に性能を最適化することが推奨されます。
*   **多様な評価の導入**: Phoenixが提供する豊富な評価テンプレートを活用し、エージェントのハルシネーション、応答の一貫性、事実の正確性など、多角的な側面から評価を行うことで、より堅牢で信頼性の高いエージェントを構築できます。
*   **先進的な評価手法の活用**: LLM-as-a-judgeのような先進的な評価手法を積極的に取り入れ、人間の評価コストを削減しつつ、高品質な評価を実現することが期待されます。
*   **コミュニティとの連携**: `smolagents`やPhoenixのようなオープンソースツールを活用し、コミュニティと連携しながらエージェント開発と評価のベストプラクティスを共有・発展させていくことが重要です。

## Source URL

https://huggingface.co/blog/smolagents-phoenix
