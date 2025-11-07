---
title: An Introduction to AI Secure LLM Safety Leaderboard
title_ja: ''
source_url: 'https://huggingface.co/blog/leaderboard-decodingtrust'
date: '2025-11-03'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/leaderboard-decodingtrust'
summarized_at: '2025-11-05T10:59:20.048Z'
tldr: '# An Introduction to AI Secure LLM Safety Leaderboard'
key_points:
  - '- ## TL;DR'
  - '- - LLMの安全性と信頼性評価の重要性に応える形で、包括的評価プラットフォーム「DecodingTrust」が開発されました。'
  - '- - DecodingTrustは、有害性、偏見、様々な堅牢性、プライバシーなど8つの信頼性視点を多角的に評価します。'
  - '- - 各評価視点には、最適化アルゴリズムやプロンプト生成モデルを駆使した独自の「レッドチーミング」手法が適用され、LLMを厳しくテストします。'
  - >-
    - - 現在、DecodingTrustの安全性評価に特化した「LLM Safety Leaderboard」がHugging
    Faceで公開されており、モデルの客観的な評価とランキングを提供しています。
---
# An Introduction to AI Secure LLM Safety Leaderboard

## TL;DR
- LLMの安全性と信頼性評価の重要性に応える形で、包括的評価プラットフォーム「DecodingTrust」が開発されました。
- DecodingTrustは、有害性、偏見、様々な堅牢性、プライバシーなど8つの信頼性視点を多角的に評価します。
- 各評価視点には、最適化アルゴリズムやプロンプト生成モデルを駆使した独自の「レッドチーミング」手法が適用され、LLMを厳しくテストします。
- 現在、DecodingTrustの安全性評価に特化した「LLM Safety Leaderboard」がHugging Faceで公開されており、モデルの客観的な評価とランキングを提供しています。
- 初期評価では、GPT-4がGPT-3.5より脆弱であること、単一モデルが全ての信頼性視点で一貫して優れるわけではないことなどが判明しています。

## 重要ポイント
- **DecodingTrustの導入**: LLMの安全性と信頼性評価のため、NeurIPS 2023で受賞した初の包括的プラットフォーム「DecodingTrust」が開発されました。
- **8つの評価視点**: 有害性、ステレオタイプバイアス、敵対的堅牢性、OOD堅牢性、敵対的デモンストレーションに対する堅牢性、プライバシー、機械倫理、公平性といった8つの多角的視点からLLMの信頼性を評価します。
- **Red-teaming手法**: 各評価視点に対し、最適化アルゴリズムやプロンプト生成モデルを駆使した独自のレッドチーミング手法で、LLMの潜在的な弱点を体系的にテストします。
- **LLM Safety Leaderboardの公開**: DecodingTrustの安全性評価に特化した「LLM Safety Leaderboard」がHugging Faceで公開され、オープン・クローズドモデルの客観的な評価とランキングを提供します。
- **主な発見**: 初期評価では、GPT-4がGPT-3.5よりも脆弱であること、単一モデルが全ての信頼性視点で一貫して優れるわけではないこと、信頼性視点間にトレードオフが存在することなどが明らかになりました。

## 概要
LLMの広範な普及に伴い、その安全性と信頼性の評価は不可欠です。本記事では、この課題に取り組むため、Secure Learning Labが開発した包括的な評価プラットフォーム「DecodingTrust」を紹介します。これは、有害性、バイアス、堅牢性、プライバシーを含む8つの主要な信頼性視点に基づき、独自のレッドチーミング手法を用いてLLMを詳細にテストします。この評価機能は「LLM Safety Leaderboard」としてHugging Face上で公開されており、オープン・クローズドモデルの客観的なランキングと詳細なレポートを提供しています。初期の評価では、GPT-4がGPT-3.5より脆弱であることや、モデル間で信頼性に関する性能にばらつきがあること、また信頼性視点間のトレードオフが存在することなどが明らかになりました。
