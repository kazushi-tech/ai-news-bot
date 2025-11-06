---
title: "Trace & Evaluate your Agent with Arize Phoenix"
title_ja: "AIエージェントの挙動把握・性能評価にArize Phoenix"
source_url: "https://huggingface.co/blog/smolagents-phoenix"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

本記事は、Hugging FaceのSmolAgentsで構築したAIエージェントの内部動作を、Arize Phoenix、OpenTelemetry、OpenInferenceを用いてトレースし、OpenAIのGPT-4oを「LLM-as-a-judge」として利用してその性能を評価・デバッグする実践的なガイドです。エージェントのブラックボックスを解消し、その振る舞いを理解し、最適化するための具体的な手順が示されています。

## 重要ポイント

*   **エージェントの透明性向上**: SmolAgentsで構築したAIエージェントの意思決定プロセスをステップバイステップで可視化（トレース）できます。
*   **Arize Phoenixの一元化プラットフォーム**: エージェントのトレース、評価、デバッグをリアルタイムで一元的に管理するプラットフォームとしてArize Phoenixを活用します。
*   **標準化された計測**: OpenTelemetryとOpenInferenceを統合することで、エージェントの動作計測が標準化され、Phoenixへのデータ送信が容易になります。
*   **LLM-as-a-judgeによる評価**: OpenAIのGPT-4oなどの大規模言語モデルを評価者として使用し、エージェントの出力（例：検索結果の関連性）を自動的に分類・スコアリングする手法を導入します。
*   **多様な評価テンプレート**: Phoenixは、RAG関連性、ハルシネーション検出、コード生成など、様々なエージェントタイプに対応する豊富な評価テンプレートを提供します。

## 詳細レポート

### What happened/背景/影響/関係者/データ

AIエージェントの構築は進む一方で、その内部動作の理解や性能の客観的な測定が大きな課題となっていました。エージェントがどのように入力を受け取り、情報を処理し、最終的な出力に至るのかを「X線写真」のように可視化し、その効果を測定する必要性が高まっていました。

本記事では、この課題に対し、SmolAgentsで作成したツール呼び出しエージェント（例：DuckDuckGoSearchTool, VisitWebpageToolを使用）の動作を、Arize Phoenixを介して可視化・分析する方法が示されました。具体的には、`smolagents[telemetry]`をインストールし、OpenTelemetryとOpenInferenceを統合することで、エージェントの各ステップ（ツール呼び出し、入力処理、応答生成）を自動的にトレースし、Phoenixに送信します。

さらに、エージェントの性能評価のため、OpenAIのGPT-4oを「LLM-as-a-judge」として利用し、DuckDuckGoSearchToolの検索結果の関連性を評価する具体的な手順が解説されました。PhoenixのSpanQueryで特定のツール実行スパンを抽出し、RAG Relevancy Prompt Templateを用いて評価を実行し、その結果をPhoenixにログとして送信します。これにより、開発者はエージェントのブラックボックス的な動作を解消し、問題のデバッグ、性能の最適化、信頼性の向上を実現できます。特にLLM-as-a-judgeを用いることで、人間による手動評価のコストを削減し、スケーラブルな評価が可能になります。

**関係者:**

*   **SmolAgents**: AIエージェントを構築するためのライブラリ。
*   **Arize Phoenix**: エージェントのトレース、評価、デバッグを一元的に行うプラットフォーム。
*   **OpenTelemetry**: 計測データ（トレース、メトリクス、ログ）を収集・エクスポートするための標準。
*   **OpenInference**: AI/MLアプリケーションの推論を計測するためのOpenTelemetryベースの仕様。
*   **OpenAI (GPT-4o)**: LLM-as-a-judgeとして評価タスクに使用される大規模言語モデル。
*   **Hugging Face Hub Serverless API**: エージェントの基盤モデルを提供するプラットフォーム。

**データ:**

記事では、以下の評価テンプレートがPhoenixによって提供されることが示されています。

| Evaluation Template          | Applicable Agent Type                                     |
| :--------------------------- | :-------------------------------------------------------- |
| Hallucination Detection      | RAG agents, General chatbots, Knowledge-based assistants  |
| Q&A on Retrieved Data        | RAG agents, Research Assistants, Document Search Tools    |
| RAG Relevance                | RAG agents, Search-based AI assistants                    |
| Summarization                | Summarization tools, Document digesters, Meeting note generators |
| Code Generation              | Code assistants, AI programming bots                      |
| Toxicity Detection           | Moderation bots, Content filtering AI                     |
| AI vs Human (Ground Truth)   | Evaluation & benchmarking tools, AI-generated content validators |
| Reference (Citation) Link    | Research assistants, Citation tools, Academic writing aids |
| SQL Generation Evaluation    | Database query agents, SQL automation tools               |
| Agent Function Calling Evaluation | Multi-step reasoning agents, API-calling AI, Task automation bots |

## 引用（Notable quotes）

*   "Building an agent is one thing; understanding its behavior is another."
*   "Tracing allows you to see exactly what your agent is doing step by step—what inputs it receives, how it processes information, and how it arrives at its final output. Think of it like having an X-ray for your agent’s decision-making process."
*   "Arize Phoenix provides a centralized platform to trace, evaluate, and debug your agent's decisions in real time—all in one place."
*   "Because building is just the beginning—true intelligence comes from knowing exactly what’s happening under the hood."

## リスクと課題

*   **LLM-as-a-judgeの限界**: LLMによる評価は便利ですが、評価バイアス、一貫性の欠如、特定のニュアンスの理解不足といった課題が存在する可能性があります。
*   **評価コスト**: 大規模な評価を実行する場合、LLM APIの利用料（特にGPT-4oのような高性能モデル）が高額になる可能性があります。
*   **トレースデータの複雑性**: 複雑なエージェントや多数のインタラクションがある場合、生成されるトレースデータが膨大になり、その解析や管理が困難になる可能性があります。
*   **プライバシーとセキュリティ**: 本番環境でエージェントの動作をトレースする際、機密データがトレースに含まれる可能性があり、プライバシー保護とセキュリティ対策が重要になります。

## 今後の見通し/アクション

*   AIエージェント開発者は、本記事で紹介されたSmolAgents、Arize Phoenix、OpenTelemetry、OpenInferenceの統合ワークフローを積極的に導入し、エージェントの透明性と信頼性を高めるべきです。
*   Arize Phoenixが提供する多様な評価テンプレートを活用し、エージェントの性能を多角的に測定・改善することが推奨されます。特に、LLM-as-a-judge手法は、スケーラブルな自動評価の強力なツールとして、今後さらに普及するでしょう。
*   エージェントのデバッグと最適化は、単なる構築フェーズを超えた継続的なプロセスであり、MMLOps（Machine Learning Operations for LLMs）の実践が不可欠となります。

## Source URL

https://huggingface.co/blog/smolagents-phoenix
