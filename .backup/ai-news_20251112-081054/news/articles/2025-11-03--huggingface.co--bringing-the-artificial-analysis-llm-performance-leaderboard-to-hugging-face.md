---
title: Bringing the Artificial Analysis LLM Performance Leaderboard to Hugging Face
title_ja: ''
source_url: 'https://huggingface.co/blog/leaderboard-artificial-analysis'
date: '2025-11-03'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/leaderboard-artificial-analysis'
summarized_at: '2025-11-05T10:59:50.356Z'
tldr: '# Bringing the Artificial Analysis LLM Performance Leaderboard to Hugging Face'
key_points:
  - '- ## TL;DR'
  - '- - Artificial AnalysisのLLMパフォーマンスリーダーボードがHugging Faceに公開されました。'
  - '- - LLM選定において、品質だけでなく速度と価格が同等かそれ以上に重要であるという考えに基づいています。'
  - '- - 100以上のサーバーレスLLM APIエンドポイントを、品質、価格、スループット、レイテンシなどの多角的指標で評価します。'
  - '- - さまざまなプロンプト長と並列クエリ数のワークロード条件下で、継続的にテストを実施し最新データを提供します。'
---
# Bringing the Artificial Analysis LLM Performance Leaderboard to Hugging Face

## TL;DR
- Artificial AnalysisのLLMパフォーマンスリーダーボードがHugging Faceに公開されました。
- LLM選定において、品質だけでなく速度と価格が同等かそれ以上に重要であるという考えに基づいています。
- 100以上のサーバーレスLLM APIエンドポイントを、品質、価格、スループット、レイテンシなどの多角的指標で評価します。
- さまざまなプロンプト長と並列クエリ数のワークロード条件下で、継続的にテストを実施し最新データを提供します。
- このリーダーボードは、AIエンジニアがユースケースに応じた最適なLLMを包括的に選択するのに役立ちます。

## 重要ポイント
- リーダーボードは、オープンおよびプロプライエタリなLLMとAPIプロバイダの選択において、AIエンジニアを支援することを目的に提供されています。
- 評価指標には、品質（MMLU、MT-Bench、Chatbot Arenaなどに基づく）、コンテキストウィンドウ、価格（入力/出力トークン単価およびブレンド価格）、スループット（TPS）、レイテンシ（TTFT）が含まれます。
- テストは、プロンプト長（約100、1k、10kトークン）と並列クエリ数（1、10）を変化させる計6種類のワークロードで実施されます。
- リーダーボードの数値は、過去14日間のメディアン測定値に基づいており、各APIエンドポイントは毎日8回テストされます。
- 2024年5月のハイライトでは、LLM市場の急速な複雑化と、モデルおよびプロバイダ間で価格と速度に最大300倍もの大きな差があることが指摘されています。
- ユースケースによっては、高速で安価なモデルを複数組み合わせることで、単一の高品質モデルよりもコスト効率が良く、全体的なシステム品質が向上する可能性があります。

## 概要
Artificial Analysisが開発したLLMパフォーマンスリーダーボードがHugging Faceに登場しました。このリーダーボードは、LLMアプリケーション開発において品質だけでなく速度と価格も極めて重要であるとの認識に基づき、100以上のサーバーレスLLM APIエンドポイントを評価します。品質、コンテキストウィンドウ、価格、スループット、レイテンシといった多角的な指標を、様々なプロンプト長と並列クエリ数のワークロードで継続的に測定し、最新の評価データを提供します。これにより、AIエンジニアは自身のユースケースに最適なパフォーマンスとコストバランスを持つLLMを効率的に特定し、意思決定を下すことが可能になります。
