---
title: ScreenSuite - The most comprehensive evaluation suite for GUI Agents!
title_ja: ScreenSuite、GUIエージェント評価の決定版スイートを公開
source_url: 'https://huggingface.co/blog/screensuite'
date: '2025-11-04'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - Hugging
    Faceは、GUIエージェント向けの最も包括的な評価スイート「ScreenSuite」をリリースしました。これは、GUIエージェントをよりオープンでアクセスしやすく、統合しやすくするための取り組みの一環として開発され、Vis
  - '- ## 重要ポイント'
  - >-
    - *   **包括的な評価スイート**:
    GUIエージェントの性能を評価するための最大級のベンチマークスイートであり、13のベンチマークを統合しています。
  - >-
    - *   **多岐にわたる能力評価**: 知覚 (Perception)、グラウンディング (Grounding)、単一ステップアクション
    (Single step actions)、複数ステップエージェント (Multi-step agen
  - >-
    - *   **Vision-only評価**:
    既存の多くのベンチマークと異なり、アクセシビリティツリーやDOMなどのメタデータに依存せず、視覚情報のみで評価を行うため、より現実的で挑戦的な設定を提供します。
---
## 概要 (TL;DR)
Hugging Faceは、GUIエージェント向けの最も包括的な評価スイート「ScreenSuite」をリリースしました。これは、GUIエージェントをよりオープンでアクセスしやすく、統合しやすくするための取り組みの一環として開発され、Vision Language Models (VLMs)の多様なエージェント能力を評価するための、最も包括的で簡単な方法を提供します。

## 重要ポイント
*   **包括的な評価スイート**: GUIエージェントの性能を評価するための最大級のベンチマークスイートであり、13のベンチマークを統合しています。
*   **多岐にわたる能力評価**: 知覚 (Perception)、グラウンディング (Grounding)、単一ステップアクション (Single step actions)、複数ステップエージェント (Multi-step agents)といったGUIエージェントの主要な能力をカバーします。
*   **Vision-only評価**: 既存の多くのベンチマークと異なり、アクセシビリティツリーやDOMなどのメタデータに依存せず、視覚情報のみで評価を行うため、より現実的で挑戦的な設定を提供します。
*   **容易な環境構築**: UbuntuやAndroidの仮想マシンをDockerで簡単に起動できる機能を提供し、複数ステップの評価環境構築を簡素化します。
*   **主要VLMの評価**: Qwen-2.5-VLシリーズ、UI-Tars-1.5-7B、Holo1-7B、GPT-4oといった主要なVLMがScreenSuiteで評価されています。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened**:
Hugging Faceは、GUIエージェントの性能を評価するための包括的なスイート「ScreenSuite」を公開しました。これは、GUIエージェントをよりオープンでアクセスしやすく、統合しやすくするための継続的な取り組みの中で開発されたものです。

**背景**:
GUIエージェントは、デスクトップやスマートフォンなどのグラフィカルユーザーインターフェース（GUI）環境で、人間のようにクリックやナビゲーションを行うAIエージェントです。例えば、「Excelのこの列を埋める」といったタスクを与えられ、画面キャプチャを基にシステム上でアクション（クリック、タイプ、スクロールなど）を実行します。これらのエージェントは、Googleマップの操作、ファイルの編集、オンラインショッピングなど、あらゆるコンピュータタスクを自動化する可能性を秘めていますが、その多様な能力（知覚、グラウンディング、単一ステップ、複数ステップのアクション）を包括的かつ一貫して評価することは困難でした。特に、複数ステップの評価には、Windows、Android、Ubuntuなどの仮想環境が必要となります。

**影響**:
ScreenSuiteは、GUIエージェントの評価を標準化し、再現性のある形で提供することで、この分野の研究開発を加速させます。コミュニティは、モデルの性能を容易に比較し、改善点を特定できるようになり、より高性能で信頼性の高いオープンモデルの開発が促進されることが期待されます。

**関係者**:
*   **開発元**: Hugging Face
*   **評価対象モデル**:
    *   Qwen-2.5-VLシリーズ (3Bから72B) - 優れたローカリゼーション能力で知られる。
    *   UI-Tars-1.5-7B (ByteDance) - オールラウンダーモデル。
    *   Holo1-7B (H company) - サイズに対する高性能なローカリゼーション能力。
    *   GPT-4o
*   **関連技術/フレームワーク**:
    *   smolagents: エージェントの実行とオーケストレーションのためのフレームワーク層。
    *   E2B desktop remote sandboxes: 評価環境としてサポート。
    *   Docker: Ubuntu DesktopやAndroid環境をローカルでデプロイするためのカスタムコンテナ。
*   **既存ベンチマーク**: Android World, OSWorld, GAIAWeb, Mind2Web (これらをScreenSuiteのvision-only設定に適合させて評価)。

**データ**:
ScreenSuiteは、以下の4つの主要カテゴリにわたる13のベンチマークを統合しています。
*   **Perception**: 画面に表示される情報を正しく知覚する能力。
*   **Grounding**: 要素の位置を理解し、正確にクリックする能力。
*   **Single step actions**: 1つのアクションで指示を正しく解決する能力。
*   **Multi-step agents**: GUI環境で複数のアクションを通じて高レベルの目標を解決する能力。

評価されたVLMのスコアは、vision-onlyの評価設定のため、既存のアクセシビリティツリーやDOM情報を使用するベンチマークとは異なる場合があります。特にMind2Webでは、視覚情報のみでのクリック精度評価に調整されたことで、タスクの難易度が大幅に増加しています。

## 引用（Notable quotes）
*   "ScreenSuite is the most comprehensive and easiest way to evaluate Vision Language Models (VLMs) across many agentic capabilities!"
*   "Unlike many existing GUI benchmarks that rely on accessibility trees or other metadata alongside visual input, our stack is intentionally vision-only."
*   "we deem that it creates a more realistic and challenging setup, one that better reflects how humans perceive and interact with graphical interfaces."

## リスクと課題
*   **Vision-only評価の難易度**: ScreenSuiteのvision-only評価設定は、アクセシビリティツリーやDOMなどの追加情報を使用する既存のベンチマークと比較して、タスクの難易度を大幅に高めます。これにより、他のソースで報告されているモデルのスコアと異なる結果が生じる可能性があります。
*   **複数ステップベンチマークの実行環境**: 複数ステップのベンチマークを実行するには、デスクトップ/モバイル環境エミュレータを展開するためのベアメタルマシンが必要となる場合があります。

## 今後の見通し/アクション
ScreenSuiteは、Eleuther LM評価ハーネスやOpen LLM Leaderboard、Chatbot Arenaのように、コミュニティがGUIエージェント分野で迅速に反復し、進歩を遂げることを可能にすると期待されています。Hugging Faceは、今後数ヶ月で、より広範なタスクを確実に実行でき、ローカルでも動作する、さらに高性能なオープンモデルが登場することを期待しています。

**ユーザーへのアクション**:
*   ScreenSuiteのリポジトリにスターを付け、GitHubのissueやプルリクエストを通じてフィードバックを提供してください。
*   smolagents組織をフォローして、最新情報を入手してください。
*   カスタム評価は、リポジトリをクローンし、パッケージをインストールしてスクリプトを実行するだけで、約30秒で開始できます。

## Source URL
https://huggingface.co/blog/screensuite
