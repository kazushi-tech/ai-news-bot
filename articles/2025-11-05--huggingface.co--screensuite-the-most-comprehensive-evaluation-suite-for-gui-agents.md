---
title: "ScreenSuite - The most comprehensive evaluation suite for GUI Agents!"
title_ja: "ScreenSuite、GUIエージェントの総合評価スイートを発表"
source_url: "https://huggingface.co/blog/screensuite"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、GUIエージェント向けの最も包括的な評価スイート「ScreenSuite」をリリースしました。これは、GUIエージェントのオープン化、アクセシビリティ向上、統合の容易化を目指す中で開発され、Vision Language Models (VLMs)の多様なエージェント能力を評価する最も包括的で簡単な方法を提供します。

## 重要ポイント
*   **包括的な評価スイート:** ScreenSuiteは、GUIエージェントの性能を評価するための最大級のベンチマークスイートであり、知覚、グラウンディング、単一ステップアクション、複数ステップエージェント能力を網羅する13のベンチマークを統合しています。
*   **現実的な評価設定:** 評価は「視覚のみ」に特化しており、アクセシビリティツリーやDOMなどのメタデータを使用しません。これにより、人間がGUIを認識・操作する方法をより反映した、現実的で挑戦的な評価が可能になります。
*   **多様な環境サポート:** 複数ステップエージェントの評価の課題に対応するため、E2Bデスクトップリモートサンドボックスに加え、DockerでUbuntuやAndroid仮想マシンを簡単に起動できる新オプションを提供します。
*   **主要VLMの評価:** Qwen-2.5-VLシリーズ、UI-Tars-1.5-7B、Holo1-7B、GPT-4oといった主要なVLMがScreenSuiteで評価されており、そのGUIエージェント能力に関する知見を提供します。
*   **コミュニティの進歩を促進:** ScreenSuiteは、Eleuther LM評価ハーネスやOpen LLM Leaderboardのように、コミュニティがGUIエージェント分野で迅速に反復し、進歩を遂げるための基盤となることを目指しています。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened:** Hugging Faceは、GUIエージェントの性能を評価するための包括的なベンチマークスイート「ScreenSuite」を発表しました。
*   **背景:** 近年、GUIエージェントのオープン化、アクセシビリティ向上、統合の容易化が求められていました。GUIエージェントは、画面キャプチャからタスク（例：「Excelのこの列を埋める」）を理解し、クリックやタイピング、スクロールなどのアクションを実行することで、人間のようにコンピューターを操作するAIエージェントです。その能力は多岐にわたり、特に複数ステップの複雑なタスクを評価するには、仮想マシン環境の構築など、困難な課題がありました。
*   **影響:**
    *   GUIエージェントの評価が標準化され、研究者や開発者がモデルの性能を客観的に比較しやすくなります。
    *   「視覚のみ」という評価設定により、より現実世界に近い、挑戦的な環境でのモデル開発が促進されます。
    *   コミュニティ全体でGUIエージェントのモデル開発が加速し、より高性能で汎用的なオープンモデルの登場が期待されます。
    *   既存のベンチマークとは異なる評価設定のため、特定のモデルの性能に関する新たな視点を提供します。
*   **関係者:**
    *   **開発元:** Hugging Face
    *   **対象ユーザー:** GUIエージェント開発者、VLM開発者、AI研究者、AIエージェントに関心のあるコミュニティ
*   **データ:**
    *   **ベンチマーク数:** 13のベンチマークを統合。これらは知覚、グラウンディング、単一ステップアクション、複数ステップエージェント能力をカバーします。
    *   **評価されたVLM:**
        *   Qwen-2.5-VLシリーズ (3Bから72B)
        *   UI-Tars-1.5-7B (ByteDance)
        *   Holo1-7B (H company)
        *   GPT-4o
    *   **評価設定:** 意図的に「視覚のみ」に特化しており、アクセシビリティツリーやDOMなどのメタデータは使用しません。これにより、Mind2Webなどの一部の既存ベンチマークと比較して、評価設定がより困難になっています。
    *   **環境サポート:** E2Bデスクトップリモートサンドボックス、およびDockerized Ubuntu/Android仮想環境をサポート。オンラインベンチマークにはsmolagentsフレームワークを活用しています。

## 引用（Notable quotes）
*   「ScreenSuite is the most comprehensive and easiest way to evaluate Vision Language Models (VLMs) across many agentic capabilities!」
*   「our stack is intentionally vision-only. While this can result in different scores on some established leaderboards, we deem that it creates a more realistic and challenging setup, one that better reflects how humans perceive and interact with graphical interfaces.」

## リスクと課題
*   **既存ベンチマークとの比較困難性:** ScreenSuiteの「視覚のみ」という評価設定は、アクセシビリティツリーやDOMを使用する他のベンチマークとは異なるスコアをもたらすため、直接的な比較が難しい場合があります。これは、より現実的な設定を目指す意図的な選択ですが、業界全体のリーダーボードにおける位置付けを複雑にする可能性があります。
*   **複数ステップベンチマークの環境要件:** 複数ステップベンチマークの実行には、ベアメタルマシンでのデスクトップ/モバイル環境エミュレータのデプロイが必要となる場合があり、ユーザーによっては環境構築に手間がかかる可能性があります。

## 今後の見通し/アクション
*   **コミュニティ主導の進歩:** ScreenSuiteは、GUIエージェント分野におけるモデルの評価と開発を加速するためのオープンなツールとして、コミュニティからの貢献とフィードバックを期待しています。
*   **より高性能なオープンモデルの登場:** ScreenSuiteの活用により、より広範囲のタスクを確実に実行できる、高性能なオープンモデル、さらにはローカルで実行可能なモデルの登場が促進されることを目指しています。
*   **ユーザーへの呼びかけ:**
    *   ScreenSuiteのリポジトリにスターを付け、issueやPRを通じてフィードバックを提供してください。
    *   smolagents組織をフォローして、最新情報を入手してください。

## Source URL（必須）
https://huggingface.co/blog/screensuite
