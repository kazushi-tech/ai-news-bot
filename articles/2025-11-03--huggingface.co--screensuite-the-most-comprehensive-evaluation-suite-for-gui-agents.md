---
title: "ScreenSuite - The most comprehensive evaluation suite for GUI Agents!"
title_ja: "GUIエージェント評価の決定版「ScreenSuite」登場"
source_url: "https://huggingface.co/blog/screensuite"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、GUIエージェント向けの最も包括的な評価スイート「ScreenSuite」をリリースしました。これは、Vision Language Models (VLMs) の多様なエージェント能力を評価するための最大かつ最も簡単な方法を提供し、GUIエージェントのオープン化、アクセシビリティ、統合の容易さを目指しています。

## 重要ポイント
*   **ScreenSuiteの目的**: GUIエージェントの性能を評価するための包括的かつ使いやすいスイートとして開発されました。
*   **GUIエージェントの定義**: 仮想世界でグラフィカルユーザーインターフェース（GUI）を操作するAIエージェント（例：クリック、入力、スクロールなど）。
*   **評価範囲**: 知覚（Perception）、グラウンディング（Grounding）、シングルステップアクション、マルチステップエージェントの4つの主要カテゴリにわたる13のベンチマークを統合しています。
*   **独自性「Vision-only」評価**: 多くの既存ベンチマークが利用するアクセシビリティツリーやDOMなどのメタデータを使用せず、視覚情報のみに依存して評価を行います。これにより、より現実的で挑戦的な設定を実現しています。
*   **環境サポート**: E2Bデスクトップリモートサンドボックスに加え、Dockerized Ubuntu/Android仮想マシンを簡単に起動できる新オプションを提供します。
*   **主要VLMの評価**: Qwen-2.5-VLシリーズ、UI-Tars-1.5-7B、Holo1-7B、GPT-4oといった主要なVLMがScreenSuiteで評価されました。

## 詳細レポート
### What happened
Hugging Faceは、GUIエージェントの性能を評価するための包括的なベンチマークスイート「ScreenSuite」を発表しました。これは、Vision Language Models (VLMs) のエージェント能力を多角的に評価し、GUIエージェントのオープン化、アクセシビリティ、統合の容易さを促進することを目的としています。

### 背景
GUIエージェント（デスクトップやスマートフォン上でクリックやナビゲーションを行うAI）の能力評価は、知覚、グラウンディング、シングルステップ、マルチステップといった多様な能力を必要とし、特にマルチステップタスクでは仮想環境の構築が課題でした。既存の多くのGUIベンチマークは、視覚入力に加え、アクセシビリティツリーやDOMなどのメタデータに依存しており、より現実的で挑戦的な評価設定が求められていました。ScreenSuiteは、これらの課題に対処し、視覚情報のみに基づく評価を通じて、人間のGUI操作に近い状況でのエージェント性能を測ることを目指しています。

### 影響
ScreenSuiteのリリースにより、GUIエージェントの性能評価が標準化され、コミュニティが迅速にモデルを反復・改善できるようになります。これにより、より高性能なオープンモデルの開発が加速され、幅広いタスクを確実に実行できるAIエージェントの登場が期待されます。

### 関係者
*   **開発元**: Hugging Face
*   **評価対象VLM**:
    *   Qwen-2.5-VLシリーズ (3Bから72B)
    *   UI-Tars-1.5-7B (ByteDance)
    *   Holo1-7B (H company)
    *   GPT-4o
*   **フレームワーク**: smolagents (エージェント実行・オーケストレーション)
*   **参照論文**: Xu et al. (2025), Qin et al. (2025)

### データ
*   **ベンチマーク数**: 13のベンチマークを統合。
*   **評価カテゴリ**:
    *   知覚 (Perception): 画面上の情報を正しく認識する能力。
    *   グラウンディング (Grounding): 要素の位置を理解し、正確にクリックする能力。
    *   シングルステップアクション (Single step actions): 1つのアクションで指示を解決する能力。
    *   マルチステップエージェント (Multi-step agents): 複数のアクションを通じて高レベルの目標を達成する能力。
*   **評価方法**: Vision-only（視覚情報のみを使用し、アクセシビリティツリーやDOMは不使用）。
*   **環境**: E2Bデスクトップリモートサンドボックス、Dockerized Ubuntu/Android仮想マシン。
*   **評価モデルのスコア**: 記事には具体的なスコア表はないが、評価結果は既存の様々な情報源のスコアと概ね一致すると述べられています。ただし、Vision-only評価のため、既存のベンチマークとはスコアが異なる場合があることが注意点として挙げられています。

## 引用（Notable quotes）
*   "ScreenSuite is the most comprehensive and easiest way to evaluate Vision Language Models (VLMs) across many agentic capabilities!"
*   "Unlike many existing GUI benchmarks that rely on accessibility trees or other metadata alongside visual input, our stack is intentionally vision-only."
*   "ScreenSuite does not intend to exactly reproduce benchmarks published in the industry: we evaluate models on GUI agentic capabilities based on vision."

## リスクと課題
*   **スコアの差異**: Vision-only評価を採用しているため、アクセシビリティツリーやDOMを利用する既存のベンチマークとは異なるスコアになる場合があります。特にMind2Webのようなベンチマークでは、ScreenSuiteの評価設定が「はるかに難しい」ため、既存のスコアと一致しない可能性があります。
*   **マルチステップベンチマークの実行環境**: マルチステップベンチマークの実行には、デスクトップ/モバイルエミュレータをデプロイするためのベアメタルマシンが必要となる場合があります。

## 今後の見通し/アクション
*   **コミュニティの進歩**: ScreenSuiteが、Eleuther LM evaluation harnessやOpen LLM Leaderboard、Chatbot Arenaのように、コミュニティがGUIエージェント分野で迅速に反復し進歩するための基盤となることを期待しています。
*   **オープンモデルの発展**: 今後数ヶ月で、より広範なタスクを確実に実行でき、ローカルでも動作する、より高性能なオープンモデルが登場することを期待しています。
*   **コミュニティへの呼びかけ**:
    *   ScreenSuiteリポジトリにスターを付け、IssueやPRでフィードバックを提供すること。
    *   smolagents組織をフォローして最新情報を入手すること。

## Source URL
https://huggingface.co/blog/screensuite
