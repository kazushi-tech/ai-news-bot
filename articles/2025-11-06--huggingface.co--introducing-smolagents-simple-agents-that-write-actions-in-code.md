---
title: "Introducing smolagents: simple agents that write actions in code."
title_ja: "smolagents登場 コードで動作生成するシンプルAIエージェント"
source_url: "https://huggingface.co/blog/smolagents"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、LLMにエージェント機能をもたらすシンプルなライブラリ「smolagents」を発表しました。本ライブラリは、アクションをコードで記述する「Code Agent」を第一級サポートし、サンドボックス環境での安全な実行、Hugging Face Hubとの統合、多様なLLM（オープンモデル含む）への対応を特徴とします。これにより、LLMが複雑な実世界タスクを柔軟に解決できるようになり、オープンソースモデルが最先端のクローズドモデルに匹敵する性能を発揮することが示されています。

## 重要ポイント

*   **smolagentsの発表**: LLMにエージェント機能を提供する、シンプルで軽量なライブラリ。
*   **Code Agentの重視**: アクションをJSONではなくコードで記述するエージェントを第一級サポート。これにより、構成可能性、オブジェクト管理、汎用性、LLMのトレーニングデータとの親和性が向上。
*   **エージェンシーの概念**: LLMの出力がプログラムのワークフローを制御する度合いを「エージェンシー」と定義し、その連続的なスペクトラムを提示。
*   **利用の判断基準**: ワークフローの柔軟性が求められる複雑なタスクにはエージェントが有用だが、事前に決定可能な固定ワークフローにはシンプルさと堅牢性のため避けるべき。
*   **幅広いLLMサポート**: Hugging Faceの推論APIを利用するオープンモデルに加え、LiteLLM統合によりOpenAIやAnthropicなど100以上のクラウドLLMに対応。
*   **Hugging Face Hubとの統合**: ツールをHubに共有・ロードできる機能を提供。
*   **オープンモデルの性能向上**: ベンチマークにより、オープンソースモデルがエージェントワークフローにおいて最先端のクローズドモデルに匹敵する性能を示すことが確認された。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、LLMにエージェント機能を持たせるための新しいPythonライブラリ「smolagents」を公開しました。このライブラリは、LLMが外部ツールを呼び出したり、プログラムの実行フローを制御したりする能力を簡素化することを目的としています。特に、アクションの記述にコードを使用する「Code Agent」を重視しており、これは従来のJSONベースのアクション記述よりも優れているとされています。

**背景:**
効率的なAIシステムは、LLMが検索ツールを呼び出したり、特定のプログラムを操作したりするなど、実世界にアクセスする能力を必要とします。このような「エージェンシー」を持つプログラムは、LLMが外部世界とインタラクトするためのゲートウェイとなります。従来のプログラムは事前に決定されたワークフローに限定されていましたが、エージェントシステムはより複雑で柔軟な実世界タスクへの対応を可能にします。また、アクションをJSONスニペットで記述する一般的なアプローチに対し、研究によりコードで記述する方が優れていることが示されています。smolagentsは、この知見に基づき、シンプルさとコードファーストのアプローチでエージェント開発を容易にすることを目指しています。

**影響:**
smolagentsの導入により、開発者はより少ないコードで堅牢かつ柔軟なLLMエージェントを構築できるようになります。サンドボックス環境（E2B経由）での安全なコード実行がサポートされるため、セキュリティ上の懸念が軽減されます。Hugging Face Hubとの統合により、ツールの共有と再利用が促進され、コミュニティによるエージェント開発が加速する可能性があります。また、オープンソースLLMがエージェントワークフローにおいてクローズドモデルに匹敵する性能を発揮することが示されたことで、オープンソースエコシステムのさらなる発展が期待されます。

**関係者:**
*   **Hugging Face**: smolagentsライブラリの開発元。
*   **Anthropic, OpenAI**: 既存のエージェントフレームワークやツール呼び出し機能を提供する主要なAI企業。
*   **E2B**: smolagentsがサンドボックス環境でのコード実行に利用するサービス。
*   **LiteLLM**: smolagentsが多様なクラウドLLM（OpenAI, Anthropicなど）をサポートするために統合しているライブラリ。

**データ:**

**エージェンシーレベルのスペクトラム**

| Agency Level | Description                                     | How that's called       | Example Pattern                                  |
| :----------: | :---------------------------------------------- | :---------------------- | :----------------------------------------------- |
| ☆☆☆          | LLM output has no impact on program flow        | Simple processor        | `process_llm_output(llm_response)`               |
| ★☆☆          | LLM output determines basic control flow        | Router                  | `if llm_decision(): path_a() else: path_b()`     |
| ★★☆          | LLM output determines function execution        | Tool call               | `run_function(llm_chosen_tool, llm_chosen_args)` |
| ★★★          | LLM output controls iteration and program continuation | Multi-step Agent        | `while llm_should_continue(): execute_next_step()` |
| ★★★          | One agentic workflow can start another agentic workflow | Multi-Agent             | `if llm_trigger(): execute_agent()`              |

**コードでアクションを記述する利点**

*   **構成可能性**: JSONでは困難なアクションのネストや再利用可能なセットの定義が容易。
*   **オブジェクト管理**: `generate_image`のようなアクションの出力をJSONで保存する際の課題を解決。
*   **汎用性**: コンピュータが行うあらゆることをシンプルに表現できるコードの能力。
*   **LLMトレーニングデータでの表現**: LLMのトレーニングデータには高品質なコードアクションが豊富に含まれており、LLMはこれに既に最適化されている。

**オープンモデルの性能比較:**
特定のベンチマークにおいて、smolagentsで構築されたオープンソースモデルが、最先端のクローズドモデルに匹敵する性能を示しました。また、コードエージェントがツール呼び出しエージェントよりも優れた結果を出すことが確認されています。

## 引用（Notable quotes）

*   "AI Agents are programs where LLM outputs control the workflow."
*   "The reason for this is simply that we crafted our code languages specifically to be the best possible way to express actions performed by a computer."
*   "This comparison shows that open source models can now take on the best closed models!"

## リスクと課題

*   **過剰な利用**: エージェントはワークフローの柔軟性が必要な場合に非常に有用ですが、常に必要とは限りません。事前に決定可能な固定ワークフローを持つタスクでは、エージェントを使用しない方がシンプルで堅牢なシステムを構築できます。
*   **予測不可能性**: LLMがワークフローに介入することで、予測できないエラーが発生するリスクがあります。シンプルさと堅牢性を優先する場合、エージェント的な振る舞いを避けることが推奨されます。

## 今後の見通し/アクション

*   smolagentsは、既存の`transformers.agents`ライブラリの後継となり、将来的には`transformers.agents`は非推奨となる予定です。
*   ユーザーは、smolagentsのガイドツアー、詳細なチュートリアル、およびtext-to-SQL、agentic RAG、マルチエージェントオーケストレーションなどの具体的な例を通じて、ライブラリの学習と活用を進めることができます。
*   Hugging Face Hubへのツールの共有機能は、コミュニティによるツールエコシステムの発展を促進します。

## Source URL（必須）
https://huggingface.co/blog/smolagents
