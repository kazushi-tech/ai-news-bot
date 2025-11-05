---
title: "An Introduction to AI Secure LLM Safety Leaderboard"
title_ja: "AIの安全なLLM評価「LLM Safety Leaderboard」公開"
source_url: "https://huggingface.co/blog/leaderboard-decodingtrust"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、LLMの安全性評価に特化した新しい「AI Secure LLM Safety Leaderboard」を発表しました。これは、NeurIPS 2023で優秀論文賞を受賞した包括的な信頼性評価プラットフォーム「DecodingTrust」を基盤としています。DecodingTrustは、毒性、ステレオタイプバイアス、プライバシーなど8つの多角的な観点からLLMの信頼性を評価し、各観点に特化したレッドチーミング手法を用いてストレステストを行います。初期の評価では、GPT-4がGPT-3.5よりも脆弱であること、単一のLLMが全ての観点で優れるわけではないこと、信頼性観点間にトレードオフが存在することなどが判明しています。開発者は自身のモデルをリーダーボードに提出し、評価を受けることができます。

## 重要ポイント
*   **背景と必要性:** LLMの広範な普及に伴い、米ホワイトハウスの大統領令やEU AI Actなどの規制強化が進む中、その安全性と信頼性の評価が喫緊の課題となっています。
*   **DecodingTrustプラットフォーム:** 2023年にSecure Learning Labが開発した、LLMの信頼性を評価する初の包括的かつ統一的なプラットフォーム。NeurIPS 2023で優秀論文賞を受賞。
*   **8つの信頼性評価観点:** 毒性、ステレオタイプバイアス、敵対的堅牢性、OOD堅牢性、敵対的デモンストレーションに対する堅牢性、プライバシー、機械倫理、公平性の8つの側面から多角的に評価します。
*   **レッドチーミング手法:** 各評価観点に特化した新しいレッドチーミングアルゴリズムと挑戦的なプロンプト設計により、LLMの弱点を深くテストします。
*   **主要な発見:**
    *   GPT-4はGPT-3.5よりも脆弱である。
    *   全ての信頼性観点において一貫して優れた性能を示す単一のLLMは存在しない。
    *   異なる信頼性観点間にはトレードオフが存在する。
    *   LLMは敵対的または誤解を招くプロンプト/指示に対して脆弱である。
    *   LLMはプライバシー関連の言葉（例：「in confidence」と「confidentially」）の理解度に違いがある。
*   **モデル提出:** 開発者は、safetensors形式への変換とAutoClassesでのロードが可能であれば、自身のモデルをリーダーボードに提出し評価を受けることができます。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、LLMの安全性評価に特化した新しい「AI Secure LLM Safety Leaderboard」を公開しました。このリーダーボードは、LLMの信頼性を多角的に評価する包括的なプラットフォーム「DecodingTrust」によって提供されています。

**背景:**
LLMの社会実装が進むにつれて、その安全性とリスクを事前に理解することの重要性が高まっています。米国ホワイトハウスのAIに関する大統領令や、EU AI Actにおける高リスクAIシステムへの義務的要件など、国際的なAI規制の動きが加速しており、これに対応するための技術的評価ソリューションが求められていました。Secure Learning Labは、このニーズに応える形で2023年にDecodingTrustを開発し、NeurIPS 2023で優秀論文賞を受賞しました。

**影響:**
このリーダーボードは、LLMの安全性と信頼性に関する透明な評価基準を提供し、開発者がより安全で堅牢なAIシステムを設計・構築するための指針となります。また、ユーザーがLLMの潜在的なリスクを理解し、より情報に基づいた意思決定を行うのに役立ちます。

**関係者:**
*   **Secure Learning Lab:** DecodingTrustプラットフォームの開発元。
*   **Hugging Face:** AI Secure LLM Safety Leaderboardのホストおよび提供元。

**データ/評価観点と手法:**
DecodingTrustは、以下の8つの信頼性観点に基づき、それぞれに特化したレッドチーミング手法を用いてLLMを評価します。

| 評価観点                               | 概要とレッドチーミング手法

---
## Source URL（必須）
https://huggingface.co/blog/leaderboard-decodingtrust

