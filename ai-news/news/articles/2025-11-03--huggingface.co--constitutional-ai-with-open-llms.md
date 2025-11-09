---
title: Constitutional AI with Open LLMs
title_ja: ''
source_url: 'https://huggingface.co/blog/constitutional_ai'
date: '2025-11-03'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/constitutional_ai'
summarized_at: '2025-11-05T11:01:07.465Z'
tldr: '# Constitutional AI with Open LLMs'
key_points:
  - '- ## TL;DR'
  - >-
    - - Constitutional AI (CAI) をオープンLLM（Mistral 7B
    Instruct）で実装するエンドツーエンドの手法が紹介された。
  - '- - モデル自身が憲法（原則）に基づいて出力を批評・修正することで、望ましくない応答を抑制する。'
  - '- - 大規模な合成データ生成を可能にするSlurmクラスタ向けツール「llm-swarm」が開発・公開された。'
  - '- - Anthropicの憲法に基づいたCAIデータセットと、学習済みCAIモデルがHugging Face上で公開されている。'
---
# Constitutional AI with Open LLMs

## TL;DR
- Constitutional AI (CAI) をオープンLLM（Mistral 7B Instruct）で実装するエンドツーエンドの手法が紹介された。
- モデル自身が憲法（原則）に基づいて出力を批評・修正することで、望ましくない応答を抑制する。
- 大規模な合成データ生成を可能にするSlurmクラスタ向けツール「llm-swarm」が開発・公開された。
- Anthropicの憲法に基づいたCAIデータセットと、学習済みCAIモデルがHugging Face上で公開されている。

## 重要ポイント
- **Constitutional AI (CAI) の実装**: Anthropicが提案したCAI技術を、オープンソースのLLM（Mistral 7B Instruct）を使用して再現し、そのプロセスを公開した。
- **自己アライメントのメカニズム**: CAIは、モデルに望ましくない応答を批評させ、ユーザー定義の原則（憲法）に基づいて自己修正させることで、高コストな人手によるフィードバックなしにLLMをアライメントする。
- **スケーラブルなデータ生成ツール llm-swarm**: 大量の合成データを効率的に生成するため、Slurmクラスタ上で動作する分散型推論ツールllm-swarmを開発し、公開した。
- **公開されたリソース**: Anthropicの憲法に基づき生成されたCAIデータセット、およびそれらを学習したMistral 7BベースのCAIモデルがHugging Faceで利用可能。
- **有用性と安全性の両立**: CAIデータセットで学習することで、モデルの有用性（MT Benchスコア）が低下しないだけでなく、むしろ向上する可能性を示し、同時に望ましくない応答を抑制する効果も確認された。

## 概要
本記事は、Anthropicが提唱するConstitutional AI (CAI) をオープンソースのLLMであるMistral 7B Instructで実装する包括的な手法を紹介しています。CAIは、モデルが自ら定義された原則（憲法）に基づいて出力を批評・修正することで、望ましくない応答を抑制し、LLMのアライメントを効率化します。Hugging Faceは、このプロセスを支援するため、大規模な合成データ生成ツール「llm-swarm」と、Anthropicの憲法に基づくCAIデータセット、および学習済みCAIモデルを公開しました。評価結果からは、CAIによる学習がモデルの有用性を維持または向上させつつ、安全性を高める可能性が示されています。
