---
title: "Open-source LLMs as LangChain Agents"
title_ja: "オープンソースLLM、LangChainエージェントに活用 性能向上"
source_url: "https://huggingface.co/blog/open-source-llms-as-agents"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

オープンソースLLMはエージェントワークフローの推論エンジンとして十分な性能レベルに達しました。特にMixtral-8x7Bは、ベンチマークでGPT-3.5を上回り、ファインチューニングによってさらに性能向上が期待されます。Hugging Faceは、最もシンプルなエージェントライブラリ「smolagents」もリリースしました。

## 重要ポイント

*   **オープンソースLLMの性能向上**: Mixtral-8x7Bは、汎用推論エージェントとしてのベンチマークでGPT-3.5を凌駕する性能を示しました。
*   **エージェントシステムの重要性**: LLMが苦手とする論理、計算、検索といったタスクを、ツール呼び出しを通じて克服するためにエージェントシステムが不可欠です。
*   **LangChainとの統合**: Hugging FaceはLangChainにChatHuggingFaceラッパーを統合し、オープンソースモデルを使ったReActエージェントの構築を容易にしました。
*   **ファインチューニングの可能性**: オープンソースLLMはエージェントワークフロー向けに特化してファインチューニングされていないため、適切なファインチューニングによりさらなる性能向上が見込まれます。特にMixtralのファインチューニングが推奨されています。

## 詳細レポート

### What happened
Hugging Faceは、オープンソースLLMがLangChainエージェントとして機能する能力を評価するベンチマークを実施しました。その結果、Mixtral-8x7B-Instruct-v0.1がGPT-3.5を上回る性能を示し、オープンソースLLMがエージェントワークフローの強力な推論エンジンとして利用可能であることが実証されました。また、LangChainにChatHuggingFaceラッパーが統合され、オープンソースモデルを用いたエージェントの構築が容易になりました。

### 背景
大規模言語モデル（LLM）は幅広いタスクに対応できますが、論理、計算、検索といった基本的なタスクでしばしば困難に直面します。この弱点を克服するため、LLMが外部ツールを呼び出してアクションを実行できる「LLMエージェント」システムが開発されました。本記事では、特に「Reasoning」と「Acting」を組み合わせたReActエージェントの仕組みに焦点を当て、その構築方法と性能評価を行いました。

### 影響
オープンソースLLMの性能向上は、AI開発における選択肢を広げ、特定のタスクに特化したエージェントの構築を加速させます。特にMixtralの優れた性能は、オープンソースコミュニティがGPT-4のような最先端モデルに挑戦するための強力な基盤を提供します。エージェントワークフローは、LLM単体では達成困難な複雑なタスク解決能力を向上させることが示されました。

### 関係者
*   **Hugging Face**: 本記事の執筆者であり、オープンソースLLMの開発と普及を推進。LangChainへのChatHuggingFaceラッパー統合、およびシンプルなエージェントライブラリ「smolagents」をリリース。
*   **LangChain**: LLMアプリケーション開発フレームワーク。Hugging Faceのオープンソースモデルをエージェントとして利用するための統合を提供。
*   **OpenAI**: GPT-3.5およびGPT-4の開発元。ベンチマークの比較対象として使用され、その性能はオープンソースモデルの目標とされています。

### データ
**評価データセット:**
*   **HotpotQA**: インターネット検索能力をテスト。複数の情報源からの情報結合が必要な質問。
*   **GSM8K**: 小学校レベルの算数能力をテスト。計算機ツールで解決可能。
*   **GAIA**: 汎用AIアシスタント向けの難易度の高いベンチマーク。検索と計算機のみで解決可能な質問を厳選。

**評価方法:**
*   GPT-4-as-a-judgeを使用し、Prometheusプロンプト形式に基づき5点リッカート尺度で評価。結果は0-100%に変換。

**評価モデル:**
*   **オープンソース**: Llama2-70b-chat, Mixtral-8x7B-Instruct-v0.1, OpenHermes-2.5-Mistral-7B, Zephyr-7b-beta, SOLAR-10.7B-Instruct-v1.0
*   **比較対象**: GPT-3.5, GPT-4 (OpenAI固有の関数呼び出しテンプレートでファインチューニング済み)

**ベンチマーク結果:**

| モデル名                     | スコア (%) |
| :--------------------------- | :--------- |
| GPT-4                        | 95         |
| Mixtral-8x7B-Instruct-v0.1   | 73         |
| GPT-3.5                      | 69         |
| OpenHermes-2.5-Mistral-7B    | 65         |
| SOLAR-10.7B-Instruct-v1.0    | 58         |
| Llama2-70b-chat              | 40         |
| Zephyr-7b-beta               | 30         |

*   Mixtral-8x7BはGPT-3.5を上回る性能を示しました。
*   Llama2-70b-chatは予想外に低い性能でした。
*   オープンソースモデルは、関数呼び出し形式でのファインチューニングが不足しているため、OpenAIモデルに比べて不利な状況での評価でした。

## 引用（Notable quotes）

*   "Open-source LLMs have now reached a performance level that makes them suitable reasoning engines for powering agent workflows: Mixtral even surpasses GPT-3.5 on our benchmark, and its performance could easily be further enhanced with fine-tuning."
    （オープンソースLLMは、エージェントワークフローを動かす推論エンジンとして適した性能レベルに達しました。Mixtralは私たちのベンチマークでGPT-3.5さえも上回り、その性能はファインチューニングによって容易にさらに向上させることができます。）
*   "But Mixtral-8x7B performs really well: it even beats GPT-3.5! 🏆"
    （しかし、Mixtral-8x7Bは本当に優れた性能を発揮します。GPT-3.5さえも打ち負かします！🏆）
*   "We strongly recommend open-source builders to start fine-tuning Mixtral for agents, to surpass the next challenger: GPT-4! 🚀"
    （オープンソース開発者には、次の挑戦者であるGPT-4を超えるために、Mixtralをエージェント向けにファインチューニングし始めることを強く推奨します！🚀）

## リスクと課題

*   **ツール選択とフォーマットの厳密性**: エージェントシステムは、適切なツールの選択と、厳密な引数フォーマットでのツール呼び出しに課題を抱えています。ツール名のスペルミスや引数フォーマットの不正確さが、タスク失敗の原因となることがあります。
*   **過去情報の利用効率**: 過去の観測情報（初期コンテキストやツール使用後の結果）を効率的に取り込み、利用する能力も課題です。
*   **ファインチューニングの不足**: オープンソースLLMは、エージェントワークフローや特定の関数呼び出し形式向けに特化してファインチューニングされていないため、その性能が十分に発揮されていない可能性があります。

## 今後の見通し/アクション

*   **Mixtralのファインチューニング**: オープンソースコミュニティに対し、Mixtralをエージェントワークフロー向けに積極的にファインチューニングし、関数呼び出しとタスク計画のスキルを向上させることを強く推奨します。これにより、GPT-4を超える性能達成が期待されます。
*   **エージェントワークフローの普及**: エージェントワークフローは、LLMの推論能力を大幅に向上させることが示されており、より複雑な問題解決への応用が期待されます。
*   **GAIAベンチマークの活用**: GAIAベンチマークは、エージェントワークフローにおけるモデルの全体的な性能を評価するための堅牢な指標として、今後の開発で活用されるでしょう。

## Source URL
https://huggingface.co/blog/open-source-llms-as-agents
