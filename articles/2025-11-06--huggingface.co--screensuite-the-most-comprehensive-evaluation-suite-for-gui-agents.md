---
title: "ScreenSuite - The most comprehensive evaluation suite for GUI Agents!"
title_ja: "ScreenSuite、GUIエージェント向け総合評価スイート発表"
source_url: "https://huggingface.co/blog/screensuite"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、GUIエージェントの性能を評価するための最も包括的なベンチマークスイート「ScreenSuite」をリリースしました。これは、GUIエージェントをよりオープンでアクセスしやすく、統合しやすいものにするための取り組みの一環として開発されました。ScreenSuiteは、Vision Language Models (VLMs) の多様なエージェント能力を評価するための、最大規模かつ最も容易な方法を提供します。

## 重要ポイント

*   **GUIエージェントの定義**: 仮想世界で行動するAIエージェントで、デスクトップやスマートフォン上でクリック、入力、ナビゲーションなどの操作を行うことができます。
*   **ScreenSuiteの目的**: GUIエージェントの評価を標準化し、コミュニティがモデルの性能を比較・改善できるようにすることで、この分野の進歩を加速させます。
*   **包括的な評価**: 知覚、グラウンディング、単一ステップアクション、複数ステップエージェント能力を網羅する13のベンチマークを統合しています。
*   **独自のアプローチ**: 評価は意図的に「視覚情報のみ」に依存し、アクセシビリティツリーやDOMなどのメタデータを使用しません。これにより、人間がGUIを認識・操作する方法をより忠実に反映した、現実的で挑戦的な設定を提供します。
*   **技術的サポート**: E2Bデスクトップリモートサンドボックスに加え、DockerでUbuntuやAndroidの仮想マシンを簡単に起動できる新オプションを提供し、複数ステップの評価環境を整備しています。
*   **評価対象VLM**: Qwen-2.5-VLシリーズ、UI-Tars-1.5-7B、Holo1-7B、GPT-4oなど、主要なVLMが評価されています。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、GUIエージェントの性能を評価するための包括的なベンチマークスイート「ScreenSuite」を発表しました。これは、GUIエージェントをよりオープンでアクセスしやすく、統合しやすいものにするという目標を掲げ、数週間にわたる開発の末にリリースされました。

**背景:**
AIエージェント、特にGUIエージェントは、仮想環境（デスクトップやモバイルGUI）で人間のように操作（クリック、入力、スクロールなど）を行う能力を持つモデルです。これらのエージェントは、Googleマップの操作、ファイルの編集、オンラインショッピングなど、あらゆるコンピュータータスクを自動化する可能性を秘めています。しかし、その知覚、グラウンディング、単一ステップ、複数ステップといった多様な能力を正確に評価することは困難であり、特に複数ステップのタスクには仮想マシン環境が必要です。ScreenSuiteは、これらの評価の課題に対処するために開発されました。

**影響:**
ScreenSuiteのリリースは、GUIエージェント分野におけるモデル開発と研究に大きな影響を与えると期待されます。一貫性のある意味のある評価を容易にすることで、コミュニティは迅速に反復し、より高性能なオープンモデルの開発を加速させることができます。これは、Eleuther LM評価ハーネスやOpen LLM Leaderboard、Chatbot ArenaがLLM分野にもたらした進歩と同様の効果をもたらすでしょう。

**関係者:**
*   **開発元**: Hugging Face
*   **評価対象**: Qwen-2.5-VLシリーズ、UI-Tars-1.5-7B、Holo1-7B、GPT-4oなどの主要なVision Language Models (VLMs)。

**データ:**
*   **ベンチマークの数**: 13のベンチマークを統合。
*   **評価カテゴリ**:
    *   Perception (画面情報の正確な知覚)
    *   Grounding (要素の位置の理解)
    *   Single step actions (単一アクションでの指示解決)
    *   Multi-step agents (複数アクションでの高レベル目標解決)
*   **実装詳細**:
    *   モジュール性と一貫性を重視した設計。
    *   オンラインベンチマークにはsmolagentsフレームワークを活用。
    *   再現性と使いやすさのため、DockerizedコンテナでUbuntu DesktopまたはAndroid環境のローカルデプロイをサポート。
    *   **評価設定の独自性**: 視覚情報のみを使用し、アクセシビリティツリーやDOMなどのメタデータは一切使用しない。これにより、Mind2Webなどの既存ベンチマークよりもタスクの難易度が高く、より現実的な評価設定となっている。

## 引用（Notable quotes）

*   "ScreenSuite is the most comprehensive and easiest way to evaluate Vision Language Models (VLMs) across many agentic capabilities!"
*   "a “GUI Agent” is an agent that lives in a GUI. Think “an agent that can do clicks and navigate on my desktop or my phone”, à la Claude Computer Use."
*   "our stack is intentionally vision-only. While this can result in different scores on some established leaderboards, we deem that it creates a more realistic and challenging setup, one that better reflects how humans perceive and interact with graphical interfaces."

## リスクと課題

*   **既存ベンチマークとのスコアの非互換性**: ScreenSuiteの評価設定は意図的に「視覚情報のみ」に限定されており、アクセシビリティツリーやDOMなどのメタデータを使用しません。このため、Mind2Webなどの他のベンチマークで報告されているスコアとは異なる結果が生じる可能性があり、直接的な比較は困難です。これは、ScreenSuiteの評価がより現実的で挑戦的であるため、タスクの難易度が大幅に増加するためです。
*   **複数ステップベンチマークの実行要件**: 複数ステップのベンチマークを実行するには、デスクトップ/モバイル環境エミュレータをデプロイするためのベアメタルマシンが必要となる場合があります。

## 今後の見通し/アクション

Hugging Faceは、ScreenSuiteがGUIエージェント分野におけるコミュニティの迅速な反復と進歩を可能にすることを期待しています。今後数ヶ月で、より高性能で信頼性の高いオープンモデルが登場し、ローカルで幅広いタスクを実行できるようになることを目指しています。

コミュニティへの呼びかけとして、以下の行動が推奨されています。

*   ScreenSuiteのリポジトリにスターを付け、GitHubのissueやPRを通じてフィードバックを提供する。
*   smolagents組織をフォローし、最新情報を得る。

## Source URL
https://huggingface.co/blog/screensuite
