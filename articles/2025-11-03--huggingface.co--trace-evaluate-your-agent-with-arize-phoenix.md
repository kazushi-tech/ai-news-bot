---
title: "Trace & Evaluate your Agent with Arize Phoenix"
title_ja: "Arize PhoenixがAIエージェントの追跡・評価を一元化"
source_url: "https://huggingface.co/blog/smolagents-phoenix"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
本記事は、Hugging FaceのSmolagentsで構築したAIエージェントの動作を、Arize Phoenixを用いてリアルタイムでトレースし、OpenAI GPT-4oをLLM-as-a-judgeとして活用して性能を評価する実践的な方法を解説しています。エージェントの構築だけでなく、その内部動作の理解、デバッグ、最適化に不可欠なプロセスを具体例とともに示し、より信頼性の高いエージェント開発を支援します。

## 重要ポイント
*   **エージェントの透明性と性能評価の重要性**: AIエージェントの構築は容易になったものの、その内部動作を理解し、性能を客観的に評価することが、デバッグと最適化に不可欠です。
*   **Arize Phoenixによる一元管理**: Phoenixは、エージェントの意思決定プロセスをリアルタイムでトレース、評価、デバッグできる集中プラットフォームを提供します。
*   **自動トレース機能**: OpenTelemetryとOpenInferenceをSmolagentsと連携させることで、エージェントの各ステップ（ツール呼び出し、入力処理、応答生成）を自動的にトレースし、Phoenixで可視化できます。
*   **LLM-as-a-judgeによる評価**: OpenAIのGPT-4oなどの大規模言語モデルを「LLM-as-a-judge」として活用し、エージェントが使用するツールの出力（例: 検索結果の関連性）や応答の品質を評価する具体的な手法が示されています。
*   **多様な評価テンプレート**: Phoenixは、RAG関連性、ハルシネーション検出、コード生成など、様々なエージェントタイプに対応する豊富な評価テンプレートを提供します。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**:
    記事は、まずSmolagentsライブラリを使用して、Hugging Face Hub Serverless APIをバックエンドとするツール呼び出しエージェント（`CodeAgent`）を構築する手順を示します。このエージェントは`DuckDuckGoSearchTool`や`VisitWebpageTool`を利用し、与えられたクエリ（例: Google株価の取得とグラフ作成）を実行します。

    次に、このエージェントの内部動作を可視化するため、Arize PhoenixとOpenTelemetry/OpenInferenceを導入し、エージェントの各ステップ（ツール呼び出し、入力処理、応答生成）をリアルタイムでトレースする方法を解説します。これにより、エージェントの意思決定プロセスを「X線写真」のように詳細に追跡できます。

    最後に、エージェントの性能を評価するため、OpenAI GPT-4oを「LLM-as-a-judge」として利用し、`DuckDuckGoSearchTool`の検索結果の関連性を評価する具体的な手順を示します。評価は`phoenix.evals`モジュールの`llm_classify`関数とRAG Relevancy Prompt Templateを用いて行われ、結果はPhoenixに送信され、分析・可視化されます。
*   **背景**:
    AIエージェントの能力が向上し、複雑なタスクを自律的に実行できるようになる一方で、その「ブラックボックス」的な動作が課題となっています。エージェントがどのように意思決定し、どのようなツールを呼び出し、最終的な出力を生成するのかを理解することは、デバッグ、性能最適化、そしてエージェントの信頼性を確保するために不可欠です。本記事は、この課題に対する実践的なソリューションを提供します。
*   **影響**:
    開発者は、エージェントの内部動作を明確に可視化し、問題点を迅速に特定してデバッグできるようになります。また、客観的な評価を通じてエージェントの性能を測定し、改善サイクルを回すことで、より効果的で信頼性の高いAIエージェントを構築できるようになります。これにより、エージェントの品質向上と開発効率の向上が期待されます。
*   **関係者**:
    *   **Hugging Face**: Smolagentsライブラリの提供元。
    *   **Arize AI**: Phoenixプラットフォームの提供元。
    *   **OpenAI**: 評価モデル（GPT-4o）の提供元。
*   **データ**:
    記事中には、Smolagentsのインストール、エージェントの構築、Phoenixサーバーの起動、OpenTelemetryの計装、LLM-as-a-judgeによる評価実行、評価結果のPhoenixへの送信など、具体的なPythonコードスニペットとコマンドが多数含まれています。

    Phoenixが提供する主な評価テンプレートは以下の通りです。

| 評価テンプレート             | 適用可能なエージェントタイプ                                   |
| :--------------------------- | :------------------------------------------------------------- |
| Hallucination Detection      | RAG agents, General chatbots, Knowledge-based assistants       |
| Q&A on Retrieved Data        | RAG agents, Research Assistants, Document Search Tools         |
| RAG Relevance                | RAG agents, Search-based AI assistants                         |
| Summarization                | Summarization tools, Document digesters, Meeting note generators |
| Code Generation              | Code assistants, AI programming bots                           |
| Toxicity Detection           | Moderation bots, Content filtering AI                          |
| AI vs Human (Ground Truth)   | Evaluation & benchmarking tools, AI-generated content validators |
| Reference (Citation) Link    | Research assistants, Citation tools, Academic writing aids     |
| SQL Generation Evaluation    | Database query agents, SQL automation tools                    |
| Agent Function Calling Evaluation | Multi-step reasoning agents, API-calling AI, Task automation bots |

## 引用（Notable quotes）
*   "Building an agent is one thing; understanding its behavior is another." (エージェントを構築することと、その振る舞いを理解することは別物である。)
*   "Think of it like having an X-ray for your agent’s decision-making process." (エージェントの意思決定プロセスにX線写真を当てるようなものだと考えてください。)
*   "Arize Phoenix provides a centralized platform to trace, evaluate, and debug your agent's decisions in real time—all in one place." (Arize Phoenixは、エージェントの意思決定をリアルタイムでトレース、評価、デバッグするための一元化されたプラットフォームを提供します。)
*   "building is just the beginning—true intelligence comes from knowing exactly what’s happening under the hood." (構築は始まりに過ぎません。真のインテリジェンスは、内部で何が起こっているかを正確に知ることから生まれます。)

## リスクと課題
*   **エージェントの複雑性**: エージェントの内部動作を完全に理解し、デバッグすることは、特に多段階の推論や複数のツールを使用する場合、依然として複雑な課題です。
*   **評価の網羅性**: 記事ではRAG関連性評価に焦点を当てていますが、エージェントの全体的な性能を評価するには、応答の正確性、安全性、効率性など、多角的な評価指標と多様なテストケースが必要です。
*   **LLM-as-a-judgeの限界**: LLMによる評価は便利ですが、その判断の信頼性、一貫性、潜在的なバイアスを考慮し、必要に応じて人間のレビューや他の評価手法と組み合わせる必要があります。
*   **インフラ設定の複雑さ**: PhoenixサーバーのセットアップやOpenTelemetryの計装には、ある程度の技術的知識と手間が必要となる場合があります。

## 今後の見通し/アクション
*   **継続的な最適化**: 開発者は、本記事で紹介されたトレースと評価のワークフローを自身のAIエージェント開発に組み込むことで、継続的な監視、デバッグ、最適化を実現し、エージェントの性能と信頼性を向上させることができます。
*   **多様な評価の活用**: Phoenixが提供する豊富な評価テンプレートやカスタム評価機能を活用し、エージェントの特定のユースケースや要件に合わせた多角的な評価を実装することが推奨されます。
*   **透明性の向上**: エージェントの内部動作を可視化することで、その振る舞いに対する理解が深まり、より信頼性の高い、説明可能なAIシステムの構築に貢献します。

## Source URL
https://huggingface.co/blog/smolagents-phoenix
