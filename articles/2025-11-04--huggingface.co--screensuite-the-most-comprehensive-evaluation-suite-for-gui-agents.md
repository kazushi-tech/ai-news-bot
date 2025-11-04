---
title: "ScreenSuite - The most comprehensive evaluation suite for GUI Agents!"
title_ja: ""
source_url: "https://huggingface.co/blog/screensuite"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、GUIエージェント向けの最も包括的で使いやすい評価スイート「ScreenSuite」をリリースしました。これは、Vision Language Models (VLMs) の多様なエージェント能力（知覚、グラウンディング、単一ステップ、マルチステップアクション）を評価するために設計されており、特に視覚情報のみに依存する現実的で挑戦的な評価設定が特徴です。ScreenSuiteは、GUIエージェントのオープン化、アクセシビリティ向上、統合の容易化を目指す取り組みの一環として開発されました。

## 重要ポイント

*   **包括的な評価スイート**: GUIエージェントの知覚、グラウンディング、単一ステップ、マルチステップアクションといった全範囲の能力をカバーする13のベンチマークを統合。
*   **視覚情報のみの評価**: 多くの既存ベンチマークと異なり、アクセシビリティツリーやDOMなどのメタデータに依存せず、視覚情報のみで評価。これにより、より現実的で挑戦的な設定を実現。
*   **マルチステップ評価のサポート**: 複雑なマルチステップエージェントの評価のため、E2Bデスクトップリモートサンドボックスに加え、DockerでUbuntu/Android仮想マシンを簡単に起動できる新オプションを提供。
*   **主要VLMのベンチマーク**: Qwen-2.5-VLシリーズ、UI-Tars-1.5-7B、Holo1-7B、GPT-4oなど、主要なVLMがScreenSuiteで評価され、その性能が比較されました。
*   **コミュニティによる利用促進**: 開発者は、ScreenSuiteのリポジトリをクローンして、わずか30秒でカスタム評価を開始できます。

## 詳細レポート

**What happened:**
Hugging Faceは、GUIエージェントの性能を評価するための包括的なベンチマークスイート「ScreenSuite」をリリースしました。これは、GUIエージェントをよりオープンでアクセスしやすく、統合しやすいものにするための継続的な取り組みの一環です。

**背景:**
AIエージェント、特にGUIエージェント（デスクトップやスマートフォン上でクリックやナビゲーションを行うAI）は、画面キャプチャとタスク指示に基づいてシステム上でアクションを実行します。これらのエージェントは、Googleマップの操作、ファイルの編集、オンラインショッピングなど、あらゆるコンピュータータスクを自動化する可能性を秘めていますが、その多様な能力を正確に評価することは困難でした。既存の評価手法は、アクセシビリティツリーやDOMなどのメタデータに依存することが多く、人間の視覚ベースのインタラクションとは異なる設定でした。ScreenSuiteは、これらの課題に対処し、より現実的で統一された評価フレームワークを提供します。

**影響:**
ScreenSuiteのリリースは、GUIエージェント分野における研究開発を加速させることが期待されます。一貫性のある意味のある評価ツールが利用可能になることで、コミュニティは迅速に反復し、より高性能なオープンモデルを開発できるようになります。これにより、最終的には、より幅広いタスクを信頼性高く実行できるAIエージェントの普及に貢献します。

**関係者:**
*   **開発元**: Hugging Face
*   **評価対象VLM**:
    *   Qwen-2.5-VLシリーズ (3B～72B): 優れたローカライゼーション能力で知られる。
    *   UI-Tars-1.5-7B: ByteDanceによるオールラウンダーモデル。
    *   Holo1-7B: H社による最新モデル、サイズに対して非常に高性能なローカライゼーションを示す。
    *   GPT-4o

**データ:**
ScreenSuiteは、GUIエージェントの以下の4つの主要能力を評価する13のベンチマークで構成されています。

| 能力カテゴリ        | 説明                                                              |
| :------------------ | :---------------------------------------------------------------- |
| **Perception**      | 画面に表示される情報を正しく知覚する能力                          |
| **Grounding**       | 要素の位置を理解し、正確なクリックを行う能力                      |
| **Single step actions** | 1つのアクションで指示を正しく解決する能力                         |
| **Multi-step agents** | GUI環境で複数のアクションを通じて高レベルな目標を解決する能力 |

評価された主要VLMは以下の通りです。

| モデル名           | 開発元/特徴                                                              |
| :----------------- | :----------------------------------------------------------------------- |
| Qwen-2.5-VLシリーズ | Hugging Face (Qwen) / 3Bから72Bまで、優れたローカライゼーション能力      |
| UI-Tars-1.5-7B     | ByteDance / オールラウンダーモデル                                       |
| Holo1-7B           | H社 / サイズに対して非常に高性能なローカライゼーション                   |
| GPT-4o             | OpenAI / 最新のマルチモーダルモデル                                      |

## 引用（Notable quotes）

*   「ScreenSuite is the most comprehensive and easiest way to evaluate Vision Language Models (VLMs) across many agentic capabilities!」
*   「Unlike many existing GUI benchmarks that rely on accessibility trees or other metadata alongside visual input, our stack is intentionally vision-only. While this can result in different scores on some established leaderboards, we deem that it creates a more realistic and challenging setup, one that better reflects how humans perceive and interact with graphical interfaces.」

## リスクと課題

*   **既存ベンチマークとのスコア差異**: ScreenSuiteは視覚情報のみに依存するため、アクセシビリティツリーやDOMなどのメタデータを使用する他のベンチマークとは異なるスコアになる可能性があります。特にMind2Webのようなベンチマークでは、ScreenSuiteの評価設定がより難しいため、スコアが低くなる傾向があります。
*   **マルチステップベンチマークの実行要件**: マルチステップベンチマークを実行するには、デスクトップ/モバイル環境エミュレータを展開するためのベアメタルマシンが必要となる場合があります。

## 今後の見通し/アクション

Hugging Faceは、ScreenSuiteがEleuther LM評価ハーネス、Open LLM Leaderboard、Chatbot Arenaのように、コミュニティがGUIエージェント分野で迅速に進化するための重要なツールとなることを期待しています。これにより、将来的には、より高性能で幅広いタスクを信頼性高く、さらにはローカルで実行できるオープンモデルの登場を促進することを目指しています。

**ユーザーへのアクション:**
*   ScreenSuiteのGitHubリポジトリにスターを付け、IssueやPRでフィードバックを提供する。
*   smolagents組織をフォローして最新情報を得る。

## Source URL
https://huggingface.co/blog/screensuite
