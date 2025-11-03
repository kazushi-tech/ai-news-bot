---
title: "Expert Support case study: Bolstering a RAG app with LLM-as-a-Judge"
title_ja: "LLM評価でRAGアプリを強化 Digital Greenの農業支援事例"
source_url: "https://huggingface.co/blog/digital-green-llm-judge"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Digital GreenはHugging FaceのExpert Supportを受け、小規模農家向けRAGチャットボット「Farmer.chat」を開発しました。このチャットボットの性能評価に「LLM-as-a-Judge」手法を導入し、RAGの精度、プロンプトの明確さなどを客観的に評価。主要LLMをベンチマークした結果、Gemini-1.5-Flashを最適なモデルとして選定しました。これにより、2万以上の農家を支援し、34万以上の質問に回答、高い精度と低いバイアスを達成し、農業支援におけるAIの有効性を実証しました。

## 重要ポイント

*   **小規模農家向けRAGチャットボット「Farmer.chat」の開発**: 世界の小規模農家（約5億人）への農業支援を目的とし、CGIARの46,000件の農業研究論文を基盤に構築。
*   **「LLM-as-a-Judge」評価手法の導入**: 多様な言語、地域、作物に対応するチャットボットの性能（プロンプトの明確さ、質問タイプ、回答率、RAG精度など）を客観的かつスケーラブルに評価するために採用。
*   **主要LLMのベンチマークと選定**: GPT-4-Turbo、Llama-3-70B、Gemini-1.5-Pro/Flashを比較し、未回答率の低さと高い忠実性のトレードオフからGemini-1.5-Flashを最適なモデルとして選定。
*   **顕著な成果**: 過去1年で2万以上の農家、34万以上の質問に対応。6言語、50作物でサービスを提供し、バイアスや有害な応答がほぼゼロを達成。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Digital Greenは、Hugging FaceのExpert Supportプログラムの支援を受け、小規模農家向けのRetrieval-Augmented Generation (RAG) チャットボット「Farmer.chat」を開発しました。このチャットボットの性能を評価するため、Hugging Faceの助言に基づき「LLM-as-a-Judge」システムを導入。プロンプトの明確さ、質問タイプ、回答率、RAG精度といった複数の指標をLLM自身に評価させることで、客観的かつスケーラブルな評価を実現しました。この評価システムを用いて、GPT-4-Turbo、Llama-3-70B、Gemini-1.5-Pro、Gemini-1.5-Flashといった主要LLMのベンチマークを行い、未回答率が低く、かつ回答の忠実性が高いGemini-1.5-Flashを最適なモデルとして選定しました。

**背景:**
世界には約5億人の小規模農家が存在し、食料安全保障に不可欠ですが、農業普及員の数は需要に追いついていません（インドでは農家1000人に対し1人の割合）。CGIAR主導のGAIAプロジェクトは、GARDIANポータルに蓄積された約46,000件の農業研究論文を農家に届けることを目指しています。Digital Greenは、この膨大な知識を活用し、パーソナライズされた信頼性の高い農業アドバイスを提供するRAGチャットボット「Farmer.chat」の開発に着手しました。しかし、多様な言語、地域、作物、ユースケースに対応し、文脈に沿った正確な情報を提供するチャットボットの性能を評価することが大きな課題でした。

**影響:**
LLM-as-a-Judgeの導入により、チャットボットの品質を客観的かつ大規模に評価できるようになりました。これにより、ユーザー体験の改善点特定、知識ベースのギャップ特定と最適化、そして特定のタスクや文脈に最適なLLMの選定が可能になりました。Farmer.chatは、過去1年間で20,000人以上の農家、340,000件以上の質問に対応し、6言語、50種類の作物に関する情報を提供。回答のバイアスや有害な応答をほぼゼロに抑えることに成功し、農業分野におけるAI支援ツールの有効性と実用性を示しました。

**関係者:**
*   **Digital Green**: Farmer.chatの開発と運用を主導。
*   **CGIAR**: GAIAプロジェクトを主導し、農業知識ベース（GARDIAN）を提供。
*   **Hugging Face**: Expert Supportプログラムを通じてDigital Greenを支援し、LLM-as-a-Judge手法を提案。
*   **Scio**: 知識ベース構築のためのAPIを提供。
*   **OpenAI**: GPT-4o (User-facing Agent) および GPT-4-Turbo (ベンチマーク対象LLM) を提供。
*   **Google**: Gemini-1.5-Pro/Flash (ベンチマーク対象LLM) を提供。
*   **Meta**: Llama-3-70B-Instruct (ベンチマーク対象LLM) を提供。

**データ:**
*   **小規模農家数**: 世界で約5億人。
*   **農業普及員対農家比率**: インドで1:1000。
*   **GARDIAN知識ベース**: 約46,000件の農業研究論文とレポート。
*   **Farmer.chat利用状況（過去1年）**:
    *   サービス提供農家数: 20,000人以上
    *   処理クエリ数: 340,000件以上
    *   対応言語数: 6言語以上
    *   対応作物バリューチェーン: 50種類
    *   バイアス/有害応答: ほぼゼロ
*   **LLMベンチマーク結果（700以上のユーザー質問データセット）**:

| LLM             | Faithful | Relevant | Answered * Relevant | Answered * Faithful | Unanswered |
| :-------------- | :------- | :------- | :------------------ | :------------------ | :--------- |
| GPT-4-turbo     | 88%      | 75%      | 59%                 | 69%                 | 21.9%      |
| Llama-3-70B     | 78%      | 76%      | 76%                 | 78%                 | 0.3%       |
| Gemini-1.5-Pro  | 91%      | 88%      | 71%                 | 73%                 | 19.4%      |
| Gemini-1.5-Flash| 89%      | 78%      | 74 %                | 85%                 | 4.5%       |

*   **選定理由**: Gemini-1.5-Flashは、未回答率の低さ（4.5%）と高い忠実性（89%）の優れたトレードオフにより選定されました。

## 引用（Notable quotes）

*   "The ability of LLMs to act as judges in evaluating the performance of AI systems is a game-changer."
*   "LLM answers are found to actually do a great job and have high correlation with human evaluations!"
*   "The immense advantage is that the metric can be anything: LLM-as-a-Judge is extremely versatile."

## リスクと課題

*   **農業普及員の不足**: 農業普及員の数が需要に追いつかず、農家への情報提供が限定的。
*   **チャットボット開発の複雑性**: 多様な言語、地域、作物、ユースケースに対応し、文脈に沿った正確な情報を提供するチャットボットの開発は非常に困難。
*   **回答品質評価の難しさ**: チャットボットの回答の品質（簡潔さ、精度など）を客観的かつ決定論的に評価する指標が不足。

## 今後の見通し/アクション

LLM-as-a-Judgeによるデータ駆動型アプローチは、今後もユーザー体験の改善、知識ベースの最適化、そして特定のタスクや文脈に最適なLLMの選定に不可欠です。この手法を活用し、より堅牢で効果的、ユーザーフレンドリーな農業向けAIツールの開発を継続していく方針です。Hugging FaceのExpert Supportプログラムへの参加を検討している企業は、問い合わせが推奨されています。

## Source URL
https://huggingface.co/blog/digital-green-llm-judge
