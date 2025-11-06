---
title: "ScreenSuite - The most comprehensive evaluation suite for GUI Agents!"
title_ja: "GUI Agentsの性能を網羅的に評価「ScreenSuite」発表"
source_url: "https://huggingface.co/blog/screensuite"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、GUIエージェント向けの最も包括的な評価スイート「ScreenSuite」をリリースしました。これは、GUIエージェントのオープン化、アクセシビリティ向上、統合の容易化を目指す取り組みの一環として開発され、Vision Language Models (VLMs) の多様なエージェント能力を評価するための最大級のベンチマークスイートです。

## 重要ポイント
*   **GUIエージェントとは**: 仮想世界（デスクトップやスマートフォンなど）でGUIを操作するAIエージェントで、クリック、入力、スクロールなどのアクションを実行します。
*   **ScreenSuiteの目的**: GUIエージェントの知覚、グラウンディング、単一ステップアクション、マルチステップアクションといった多様な能力を包括的に評価します。
*   **包括的なベンチマーク**: 13のベンチマークを統合し、特にマルチステップエージェントの評価のためにDockerizedなUbuntu/Android仮想環境のサポートを提供します。
*   **視覚オンリー評価**: 既存の多くのベンチマークと異なり、アクセシビリティツリーやDOMなどのメタデータに依存せず、純粋に視覚情報のみで評価を行います。これにより、より現実的で挑戦的な評価設定を実現します。
*   **主要VLMの評価**: Qwen-2.5-VL、UI-Tars-1.5-7B、Holo1-7B、GPT-4oなどの主要なVLMがScreenSuiteで評価されました。
*   **コミュニティへの貢献**: 評価の標準化と容易化を通じて、GUIエージェント分野における研究開発の迅速な進歩を促進することを目指します。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Faceは、GUIエージェントの性能を評価するための包括的なベンチマークスイート「ScreenSuite」を公開しました。これは、GUIエージェントをよりオープンでアクセスしやすく、統合しやすいものにするための継続的な取り組みの一環です。

**背景:**
GUIエージェントは、人間のようにコンピューターを操作する能力を持ち、幅広いタスクを自動化する可能性を秘めています。しかし、その能力（画面情報の知覚、要素の位置特定、単一または複数ステップのアクション実行など）を包括的かつ一貫して評価することは困難でした。特に、マルチステップタスクの評価には、Windows、Android、Ubuntuなどの仮想環境の実行が必要であり、既存のベンチマークはアクセシビリティツリーやDOMなどのメタデータに依存することが多く、純粋な視覚ベースの評価が不足していました。

**影響:**
ScreenSuiteは、GUIエージェントの客観的かつ包括的な評価を可能にすることで、この分野の研究開発を加速させます。コミュニティが統一された基準でモデルを比較し、迅速に改善を繰り返すことを促進し、最終的にはより高性能で信頼性の高いオープンなGUIエージェントモデルの登場に貢献することが期待されます。

**関係者:**
*   **開発元**: Hugging Face
*   **評価されたVLM**: Qwen-2.5-VL (3B-72B), UI-Tars-1.5-7B, Holo1-7B, GPT-4o
*   **フレームワーク/ツール**: smolagents (エージェント実行・オーケストレーション), Docker (仮想環境)
*   **参照される研究**: Xu et al. (2025), Qin et al. (2025)
*   **既存ベンチマーク (ScreenSuiteで適応)**: Android World, OSWorld, GAIAWeb, Mind2Web

**データ:**
*   **ベンチマークスイート**: 13のベンチマークを統合し、GUIエージェントの以下の能力カテゴリを網羅しています。
    *   **Perception (知覚)**: 画面に表示される情報を正しく認識する能力。
    *   **Grounding (グラウンディング)**: 要素の配置を理解し、正確なクリック位置を特定する能力。
    *   **Single step actions (単一ステップアクション)**: 1つのアクションで指示を正しく解決する能力。
    *   **Multi-step agents (マルチステップエージェント)**: GUI環境で複数のアクションを通じて高レベルの目標を解決する能力。
*   **評価環境**: E2Bデスクトップリモートサンドボックス、およびカスタム構築されたDockerized Ubuntu/Android仮想マシンをサポート。
*   **評価モデルと特徴**:

| モデル名                 | 特徴                                                              |
| :----------------------- | :---------------------------------------------------------------- |
| Qwen-2.5-VL (3B-72B)     | 優れたローカライゼーション能力（正確な座標特定）                  |
| UI-Tars-1.5-7B           | ByteDanceによるオールラウンダーモデル                             |
| Holo1-7B                 | H社による、サイズに対する非常に高性能なローカライゼーション能力 |
| GPT-4o                   | -                                                                 |

*   **評価結果**: 記事には具体的なスコアは記載されていませんが、ScreenSuiteのスコアは既存の様々な情報源のスコアと概ね一致すると述べられています。ただし、視覚のみの評価設定により、Mind2Webのような一部のベンチマークでは他のソースと比較して難易度が高く、異なる（より低い）スコアになることが指摘されています。

## 引用（Notable quotes）
*   "ScreenSuite is the most comprehensive and easiest way to evaluate Vision Language Models (VLMs) across many agentic capabilities!"
*   "Unlike many existing GUI benchmarks that rely on accessibility trees or other metadata alongside visual input, our stack is intentionally vision-only."
*   "Running consistent and meaningful evaluations easily allows the community to quickly iterate and make progress in this field..."

## リスクと課題
*   **評価設定によるスコアの差異**: ScreenSuiteの「視覚オンリー」評価設定は、アクセシビリティツリーやDOM情報を使用する他のベンチマークと比較して難易度が高く、特にMind2Webのようなタスクではスコアが一致しない可能性があります。これは、より現実的な設定を目指す意図的な選択ですが、既存のリーダーボードとの直接比較には注意が必要です。
*   **マルチステップベンチマークの実行環境要件**: マルチステップベンチマークは、デスクトップ/モバイル環境エミュレータを実行するために、ベアメタルマシンを必要とする場合があります。

## 今後の見通し/アクション
*   **コミュニティによる進歩の加速**: ScreenSuiteがEleuther LM評価ハーネスやOpen LLM Leaderboard、Chatbot Arenaのように、コミュニティが迅速に反復し、GUIエージェント分野で進歩を遂げるための重要なツールとなることを期待しています。
*   **高性能なオープンモデルの登場**: 今後数ヶ月で、より広範なタスクを信頼性高く実行でき、さらにはローカルで動作する、より高性能なオープンモデルが登場することを期待しています。
*   **Hugging Faceからの呼びかけ**:
    *   ScreenSuiteリポジトリにスターを付け、issueやPRでフィードバックを提供すること。
    *   smolagents組織をフォローし、最新情報を入手すること。

## Source URL
https://huggingface.co/blog/screensuite
