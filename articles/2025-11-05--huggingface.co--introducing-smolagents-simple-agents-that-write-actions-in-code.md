---
title: "Introducing smolagents: simple agents that write actions in code."
title_ja: "smolagents登場 コードでアクション生成 簡易エージェント"
source_url: "https://huggingface.co/blog/smolagents"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、言語モデル(LLM)にエージェント機能をもたらすシンプルなライブラリ「smolagents」を発表しました。本ライブラリは、特にアクションをコードで記述する「コードエージェント」を第一級サポートし、LLMが外部ツールを呼び出し、複雑な実世界タスクのワークフローを自律的に制御することを可能にします。これにより、開発者はより柔軟で強力なAIアプリケーションを構築できるようになり、オープンソースモデルも最先端のクローズドモデルに匹敵する性能を発揮することが示されています。

## 重要ポイント

*   **smolagentsの発表**: LLMにエージェント機能（外部ツール呼び出し、ワークフロー制御）を付与する、シンプルで軽量なライブラリ。
*   **コードエージェントの重視**: アクションをJSON形式ではなくPythonコードで記述するエージェントを推奨。構成可能性、オブジェクト管理、汎用性、LLM学習データとの親和性で優位。
*   **エージェントの必要性**: 事前定義されたワークフローでは対応できない、予測不能で複雑な実世界タスク（例：複雑な旅行計画）の解決に不可欠。
*   **シンプルさとセキュリティ**: コードベースは数千行に抑えられ、セキュリティのためにサンドボックス環境（E2B経由）でのコード実行をサポート。
*   **広範なLLMサポート**: Hugging Face Hubのモデル、Hugging Face Inference API、OpenAI、Anthropicなど、LiteLLM統合により100以上のLLMをサポート。
*   **オープンモデルの性能向上**: ベンチマークにより、オープンソースモデルがエージェントワークフローにおいて、クローズドモデルに匹敵する高い性能を示すことが確認された。

## 詳細レポート

### What happened

Hugging Faceは、LLMにエージェント機能（エージェンシー）を付与するための新しいPythonライブラリ「smolagents」をリリースしました。これは、LLMが外部ツールを呼び出し、タスク解決のためのプログラムワークフローを自律的に制御できるように設計されています。

### 背景

*   **エージェントの定義**: AIエージェントとは、LLMの出力がプログラムのワークフローを制御するシステムを指します。LLMに検索ツールへのアクセスやプログラム操作の能力を与えることで、「現実世界」との接点を提供します。
*   **エージェンシーのスペクトラム**: エージェンシーは0か1ではなく、LLMに与える制御の度合いによって連続的に変化します。
*   **エージェントの必要性**: 従来のプログラムは事前定義されたワークフローに限定されていましたが、多くの実世界タスクは予測不可能な要素を含み、柔軟なワークフローが必要です。エージェントシステムは、このような複雑なタスクに対応するために不可欠です。
*   **コードエージェントの優位性**: ツール呼び出しのアクションをJSONのような形式ではなく、コード（例：Python）で記述する方が、構成可能性、オブジェクト管理、汎用性、LLMの学習データとの親和性の点で優れていることが研究で示されています。smolagentsはこのアプローチを第一級サポートします。

### 影響

*   開発者は、LLMがより自律的に動作し、複雑なタスクを解決できるアプリケーションを、よりシンプルかつセキュアに構築できるようになります。
*   オープンソースモデルの性能向上が確認されたことで、エージェントベースのシステム開発において、より多様なモデル選択肢が提供されます。
*   smolagentsは、既存の`transformers.agents`の後継となり、Hugging Faceエコシステムにおけるエージェント開発の標準となる見込みです。

### 関係者

*   **Hugging Face**: smolagentsライブラリの開発・公開元。
*   **Anthropic, OpenAI**: エージェントやツール呼び出しの概念を推進し、その実装に影響を与えている企業。
*   **E2B**: smolagentsがセキュアなコード実行のために利用するサンドボックス環境プロバイダー。
*   **LiteLLM**: smolagentsがOpenAI、Anthropicなど100以上のクラウドLLMをサポートするために統合しているライブラリ。

### データ

*   **エージェンシーレベルの分類**:

| Agency Level | Description                                          | How that's called     | Example Pattern                                      |
| :----------- | :--------------------------------------------------- | :-------------------- | :--------------------------------------------------- |
| ☆☆☆          | LLM output has no impact on program flow             | Simple processor      | `process_llm_output(llm_response)`                   |
| ★☆☆          | LLM output determines basic control flow             | Router                | `if llm_decision(): path_a() else: path_b()`         |
| ★★☆          | LLM output determines function execution             | Tool call             | `run_function(llm_chosen_tool, llm_chosen_args)`     |
| ★★★          | LLM output controls iteration and program continuation | Multi-step Agent      | `while llm_should_continue(): execute_next_step()`   |
| ★★★          | One agentic workflow can start another agentic workflow | Multi-Agent           | `if llm_trigger(): execute_agent()`                  |

*   **コードでアクションを記述する利点**:
    *   **構成可能性 (Composability)**: JSONよりもコードの方が、アクションのネストや再利用が容易。
    *   **オブジェクト管理 (Object management)**: コードはアクションの出力をより柔軟に保存・管理できる。
    *   **汎用性 (Generality)**: コードはコンピューターが実行できるあらゆる操作をシンプルに表現できる。
    *   **LLM学習データでの表現 (Representation in LLM training data)**: LLMは高品質なコードアクションで既に豊富に学習されている。

*   **オープンモデルの性能**: ベンチマークの結果、オープンソースモデルがエージェントワークフローにおいて、最先端のクローズドモデルに匹敵する、あるいはそれ以上の性能を発揮することが示されています。

## 引用（Notable quotes）

*   "AI Agents are programs where LLM outputs control the workflow."
*   "The reason for this is simply that we crafted our code languages specifically to be the best possible way to express actions performed by a computer."
*   "This comparison shows that open source models can now take on the best closed models!"

## リスクと課題

*   **過剰な利用**: エージェントは柔軟性が必要な場合に非常に有用ですが、事前定義されたワークフローで十分なタスクに対してはオーバーキルとなる可能性があります。LLMの予測不可能性によるエラーのリスクを避けるため、シンプルさと堅牢性を優先し、エージェント的な振る舞いを避けるべき場合もあります。
*   **セキュリティ**: コードエージェントはLLMが生成したコードを実行するため、悪意のあるコードや予期せぬ動作を防ぐために、サンドボックス環境での実行が不可欠です。

## 今後の見通し/アクション

*   **smolagentsの普及**: `transformers.agents`の非推奨化に伴い、smolagentsがHugging Faceにおけるエージェント開発の主要ライブラリとなる予定です。
*   **ユーザーへの推奨アクション**:
    *   smolagentsのガイドツアーから始め、ライブラリに慣れる。
    *   ツールや一般的なベストプラクティスに関する詳細なチュートリアルを学習する。
    *   テキスト-to-SQL、エージェントRAG、マルチエージェントオーケストレーションなどの具体的なシステム設定例を参考に、実践的なシステムを構築する。
    *   エージェントに関するAnthropicのブログ記事や研究論文集を読み、さらに知識を深める。

## Source URL

https://huggingface.co/blog/smolagents
