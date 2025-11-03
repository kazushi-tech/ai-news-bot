---
title: "Introducing smolagents: simple agents that write actions in code."
title_ja: "**smolagents登場：コードで動作生成するシンプルAIエージェント**"
source_url: "https://huggingface.co/blog/smolagents"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
# 概要 (TL;DR)

Hugging Faceは、LLMにエージェント機能（外部ツール利用、ワークフロー制御）を付与するシンプルなPythonライブラリ「smolagents」を発表しました。特に、アクションをコードで記述する「コードエージェント」を第一級サポートし、高い柔軟性と堅牢性を提供します。ベンチマークにより、オープンソースモデルでも高性能なエージェントを構築できることが示されています。

# 重要ポイント

*   **smolagentsの発表**: LLMにエージェント機能（外部ツール利用、ワークフロー制御）を付与するシンプルなライブラリ。
*   **エージェンシーの定義**: LLMの出力がプログラムのワークフローを制御する度合いを指し、連続的なスペクトラムで定義されます。
*   **コードエージェントの優位性**: アクションをJSONではなくコードで記述することで、構成可能性、オブジェクト管理、汎用性、LLMの学習データとの親和性が向上します。
*   **利用の判断**: 事前にワークフローを決定できない複雑なタスクにエージェントは有効ですが、単純なタスクではオーバーキルとなる可能性があります。
*   **smolagentsの主な特徴**:
    *   **シンプルさ**: 最小限の抽象化で数千行のコードに収まる設計。
    *   **コードエージェントの第一級サポート**: E2Bによるサンドボックス環境での安全な実行をサポート。
    *   **Hub統合**: ツールをHugging Face Hubで共有・ロード可能。
    *   **多様なLLMサポート**: Hugging Face Inference API、OpenAI、Anthropic、LiteLLM経由で100以上のモデルに対応。
*   **オープンモデルの性能向上**: ベンチマークにより、オープンソースモデルがエージェントワークフローにおいて、クローズドモデルと同等以上の性能を発揮することを示唆。

# 詳細レポート

### What happened

Hugging Faceは、LLMに「エージェンシー」（外部ツールへのアクセスやプログラムのワークフロー制御能力）を付与するための非常にシンプルなライブラリ「smolagents」を公開しました。このライブラリは、LLMがタスク解決のために外部ツールを呼び出し、その結果に基づいて次のアクションを決定する「エージェント」を簡単に構築できるように設計されています。特に、アクションをJSONのような形式ではなく、Pythonコードとして記述する「コードエージェント」を第一級でサポートしています。

### 背景

*   **LLMのエージェンシーの必要性**: LLMが現実世界と効率的に対話するには、検索ツールで情報を取得したり、プログラムを実行してタスクを解決したりする能力（エージェンシー）が不可欠です。
*   **エージェンシーのスペクトラム**: エージェンシーは、LLMの出力がプログラムのフローに与える影響の度合いによって、連続的なスペクトラムで定義されます。
    *   ☆☆☆: LLM出力がプログラムフローに影響なし（Simple processor）
    *   ★☆☆: LLM出力が基本的な制御フローを決定（Router）
    *   ★★☆: LLM出力が関数実行を決定（Tool call）
    *   ★★★: LLM出力が反復とプログラム継続を制御（Multi-step Agent）
    *   ★★★: エージェントワークフローが別のエージェントワークフローを開始（Multi-Agent）
*   **従来のワークフローの限界**: 従来のプログラムは事前に決定されたワークフローに限定され、複雑な実世界タスク（例：旅行計画）には不向きでした。エージェントシステムは、この限界を打破し、LLMが動的にワークフローを決定することで、より柔軟なタスク解決を可能にします。
*   **コードエージェントの利点**: 多くのエージェントシステムがアクションをJSON形式で記述する中、複数の研究論文が、アクションをコードで記述する方が優れていることを示しています。コードは、構成可能性、オブジェクト管理、汎用性、そしてLLMのトレーニングデータとの親和性において、JSONよりも優れています。

### 影響

smolagentsは、エージェント開発を簡素化し、より複雑で現実世界に即したアプリケーションの構築を可能にします。特に、オープンソースLLMがエージェントワークフローにおいて、クローズドソースLLMと競争できることを実証し、AIエージェント分野の民主化を促進します。

### 関係者

*   **Hugging Face**: smolagentsの開発元。
*   **Anthropic, OpenAI**: エージェント技術やツール呼び出しの先行者。
*   **E2B**: コードエージェントの安全なサンドボックス実行環境を提供。
*   **LiteLLM**: 100以上のクラウドLLMとの統合を可能にする。

### データ

**エージェンシーレベルの表:**

| Agency Level | Description                                     | How that's called     | Example Pattern                                      |
| :----------- | :---------------------------------------------- | :-------------------- | :--------------------------------------------------- |
| ☆☆☆          | LLM output has no impact on program flow        | Simple processor      | `process_llm_output(llm_response)`                   |
| ★☆☆          | LLM output determines basic control flow        | Router                | `if llm_decision(): path_a() else: path_b()`         |
| ★★☆          | LLM output determines function execution        | Tool call             | `run_function(llm_chosen_tool, llm_chosen_args)`     |
| ★★★          | LLM output controls iteration and program continuation | Multi-step Agent      | `while llm_should_continue(): execute_next_step()`   |
| ★★★          | One agentic workflow can start another agentic workflow | Multi-Agent           | `if llm_trigger(): execute_agent()`                  |

**コードエージェントの利点:**
*   **構成可能性**: JSONアクションのネストや再利用が難しいのに対し、Python関数のように定義・再利用が可能。
*   **オブジェクト管理**: `generate_image`のようなアクションの出力をJSONで保存するのは困難だが、コードでは容易。
*   **汎用性**: コードはコンピュータが行うあらゆることを表現するために構築されている。
*   **LLMトレーニングデータでの表現**: LLMのトレーニングデータには高品質なコードアクションが豊富に含まれており、LLMは既にこれらに対応するよう訓練されている。

**ベンチマーク結果:**
smolagentsは、複数のベンチマークから集められた質問で構成されるベンチマークで、主要なモデルを比較しました。この比較は、オープンソースモデルがエージェントワークフローにおいて、クローズドモデルに匹敵する、あるいはそれ以上の性能を発揮できることを示しています。

# 引用（Notable quotes）

*   "AI Agents are programs where LLM outputs control the workflow."
*   "If the pre-determined workflow falls short too often, that means you need more flexibility."
*   "Multiple research papers have shown that having the tool calling LLMs in code is much better."
*   "This comparison shows that open source models can now take on the best closed models!"

# リスクと課題

*   **オーバーキル**: エージェントは柔軟なワークフローが必要な場合に非常に有用ですが、事前にワークフローが明確に定義できる単純なタスクでは、エージェントの導入は複雑さを増し、オーバーキルとなる可能性があります。
*   **予測不能なエラー**: LLMがワークフローに介入することで、従来の決定論的なプログラムにはない予測不能な動作やエラーが発生するリスクがあります。
*   **セキュリティ**: コードエージェントが任意のコードを実行する可能性があるため、E2Bのようなサンドボックス環境での実行が不可欠です。

# 今後の見通し/アクション

*   **transformers.agentsからの移行**: smolagentsは、将来的に非推奨となるtransformers.agentsの後継として位置づけられています。
*   **学習リソース**: ユーザーは、ガイドツアー、詳細なチュートリアル、およびtext-to-SQL、agentic RAG、マルチエージェントオーケストレーションなどの具体的なシステム設定例を通じて、smolagentsライブラリを学ぶことが推奨されます。
*   **研究の深化**: エージェントに関するAnthropicのブログ記事や、影響力のある研究論文のコレクションを読むことで、エージェント技術への理解を深めることが推奨されています。

# Source URL
https://huggingface.co/blog/smolagents
