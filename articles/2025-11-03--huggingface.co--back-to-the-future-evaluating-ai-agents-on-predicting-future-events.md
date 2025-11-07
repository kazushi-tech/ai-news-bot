---
title: 'Back to The Future: Evaluating AI Agents on Predicting Future Events'
title_ja: ''
source_url: 'https://huggingface.co/blog/futurebench'
date: '2025-11-03'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/futurebench'
summarized_at: '2025-11-05T10:59:31.008Z'
tldr: '# Back to The Future: Evaluating AI Agents on Predicting Future Events'
key_points:
  - '- ## TL;DR'
  - '- - AIの未来予測能力を評価する新しいベンチマーク「FutureBench」が提案されました。'
  - '- - FutureBenchは、ニュースと予測市場から現実世界の未来イベントに関する質問を生成し、データ汚染を排除します。'
  - '- - エージェントフレームワーク、ツール、LLMの3つのレベルでAIの性能を体系的に評価します。'
  - '- - 初期結果では、エージェントモデルが単純なLLMより優れた予測能力を示し、モデルごとの情報収集戦略に違いが見られました。'
---
# Back to The Future: Evaluating AI Agents on Predicting Future Events

## TL;DR
- AIの未来予測能力を評価する新しいベンチマーク「FutureBench」が提案されました。
- FutureBenchは、ニュースと予測市場から現実世界の未来イベントに関する質問を生成し、データ汚染を排除します。
- エージェントフレームワーク、ツール、LLMの3つのレベルでAIの性能を体系的に評価します。
- 初期結果では、エージェントモデルが単純なLLMより優れた予測能力を示し、モデルごとの情報収集戦略に違いが見られました。

## 重要ポイント
- 既存のAIベンチマークが過去の知識に焦点を当て、データ汚染やリーダーボード不正操作の課題を抱える中、「FutureBench」は未来予測能力を評価する新アプローチを導入。
- FutureBenchは、AIエージェントが主要ニュースサイトをスクレイピングして質問を生成する方法と、予測市場プラットフォームPolymarketから質問を収集する方法の2つで、検証可能な未来予測タスクを構築。
- このベンチマークは、エージェントフレームワーク（レベル1）、使用ツール（レベル2）、基盤となるLLM（レベル3）の3つの異なるレベルでAIの性能を体系的に評価し、各要素が予測能力に与える影響を特定。
- 初期結果では、エージェントモデルがインターネットアクセスを持たない単純なLLMよりも優れた予測能力を示し、特に強力なモデルで安定した品質が確認されました。
- 各モデル（GPT-4.1、Claude3.7、DeepSeekV3など）は情報収集や推論において異なる戦略（検索への依存、詳細なWebスクレイピング、データ制約への対応など）を示し、これはAIの多様なアプローチを浮き彫りにしました。

## 概要
「FutureBench」は、既存のAIベンチマークが抱える過去データへの依存とデータ汚染の問題を克服するため、AIエージェントの未来予測能力を評価する新しいベンチマークを提案します。ニュースと予測市場から現実世界の未来イベントに関する質問を生成し、エージェントフレームワーク、ツール、基盤LLMという3つのレベルで体系的に評価します。初期結果では、エージェントモデルが優れた予測能力を示し、モデルごとに情報収集と推論戦略に顕著な違いがあることが明らかになりました。これは、より価値のあるAI（AGI）の開発に不可欠な、複雑な推論と真の理解を促すことを目指しています。
