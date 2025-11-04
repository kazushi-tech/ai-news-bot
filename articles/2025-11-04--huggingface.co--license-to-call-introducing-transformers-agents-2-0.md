---
title: "License to Call: Introducing Transformers Agents 2.0"
title_ja: "Transformers Agents 2.0公開 複雑なタスクを自在に解く高性能エージェント"
source_url: "https://huggingface.co/blog/agents"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging FaceはTransformers Agents 2.0をリリースしました。既存のエージェントに加え、過去の観測に基づいて複雑なタスクを反復的に解決できる2つの新しいエージェントタイプを導入。コードの明瞭性、モジュール性、プロンプトとツールの透明性を重視し、コミュニティエージェントの共有オプションも追加されました。この新しいフレームワークは非常に高性能で、Llama-3-70B-InstructベースのエージェントがGAIAリーダーボードでGPT-4ベースのエージェントを上回る結果を出しています。なお、`transformers.agents`ライブラリはスタンドアロンの`smolagents`ライブラリにアップグレードされました。

## 重要ポイント

*   **Transformers Agents 2.0のリリース**: 複雑なタスク解決のための新しいエージェントタイプを導入。
*   **反復型エージェント**: 過去の観測に基づいて思考・行動・観測を繰り返すReActエージェント（ReactCodeAgent, ReactJsonAgent）が追加され、自己修正能力が向上。
*   **設計思想**: 明瞭性、モジュール性、共有機能を重視し、開発者がエージェントシステムを容易に構築・検査・共有できることを目指す。
*   **高性能なオープンソースモデル**: Llama-3-70B-InstructベースのエージェントがGAIAリーダーボードで4位にランクインし、多くのGPT-4ベースのエージェントを凌駕。オープンソースカテゴリでトップの座を獲得。
*   **マルチモーダル対応**: ウェブブラウジング、テキスト解析、音声認識、画像解析などのマルチモーダルツールを統合したエージェントでGAIAベンチマークを攻略。
*   **ライブラリの移行**: `transformers.agents`がスタンドアロンライブラリ`smolagents`にアップグレード。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、大規模言語モデル（LLM）の弱点を克服し、より複雑なタスクを解決するためのエージェントフレームワーク「Transformers Agents 2.0」を発表しました。これにより、既存のエージェント機能に加え、過去の観測に基づいて反復的に思考・行動・観測を行う新しいエージェントタイプが導入されました。また、既存の`transformers.agents`ライブラリは、スタンドアロンの`smolagents`ライブラリとしてアップグレードされました。

### 背景
LLMは幅広いタスクに対応できますが、論理、計算、検索といった特定の領域ではしばしば課題を抱え、正確な回答を生成できないことがあります。エージェントは、LLMを核としつつ、特定のスキルを持つツールを活用することで、これらのLLMの弱点を補完し、複雑な問題解決を可能にするプログラムです。Transformers Agentsは、エージェントワークフローの構築における「明瞭性」と「モジュール性」を重視し、開発者が容易にシステムを検査・カスタマイズできることを目指しています。

### エージェントの主要要素
*   **Tool**: 特定のアクションを実行するクラス。名前、説明、入力、出力タイプを持つ。
*   **Toolbox**: エージェントに提供されるツールの集合。
*   **CodeAgent**: 単一のPythonコードブロックとしてアクションを生成するシンプルなエージェント（反復機能なし）。
*   **ReactAgent**: Thought ⇒ Action ⇒ Observationのサイクルでタスクを解決するエージェント。
    *   **ReactCodeAgent**: アクションをPythonコードとして生成。
    *   **ReactJsonAgent**: アクションをJSONとして生成。

### ユースケース例
1.  **自己修正型RAG**: ユーザーのクエリに応じて、検索する情報源やドキュメント数を動的に調整するRAGシステムをエージェントで構築。エージェントが検索ツールを呼び出し、必要に応じて検索条件を自己修正する例が示されました。
2.  **効率的なウェブブラウジングのためのマルチエージェント設定**: GAIAベンチマークのような複雑なタスクに対応するため、ウェブブラウジングに特化した「websurfer_agent」を構築し、これを上位のタスク解決エージェントのツールとして組み込むマルチエージェント構成が紹介されました。

### 影響
Transformers Agents 2.0の導入により、LLMはより複雑で多段階のタスクを効率的に解決できるようになりました。特に、Llama-3-70B-Instructのようなオープンソースモデルが、GAIAリーダーボードでGPT-4ベースのエージェントを上回る性能を発揮したことは、オープンソースAIの能力向上と普及に大きな影響を与えます。

### 関係者
*   **Hugging Face**: Transformers Agents 2.0およびsmolagentsの開発・提供元。
*   **LLM開発者/研究者**: エージェントフレームワークを利用して、LLMの能力を拡張し、より高度なAIアプリケーションを構築するユーザー。
*   **AIコミュニティ**: オープンソースのエージェント技術の進化と共有の恩恵を受ける。

### データ
#### agents_reasoning_benchmark (平均スコア)

| LLM Engine (Agent Type) | HotpotQA (検索) | GSM8K (計算) | GAIA (2ツール) | 平均 |
| :---------------------- | :-------------- | :----------- | :------------- | :--- |
| Mixtral-8x7B (JSON)     | 70.0            | 55.0         | 30.0           | 51.7 |
| Mixtral-8x7B (Code)     | 60.0            | 45.0         | 20.0           | 41.7 |
| Llama-3-70B-Instruct (JSON) | 80.0            | 80.0         | 45.0           | 68.3 |
| Llama-3-70B-Instruct (Code) | 85.0            | 85.0         | 50.0           | 73.3 |
| GPT-4 Turbo (JSON)      | 85.0            | 80.0         | 45.0           | 70.0 |
| GPT-4 Turbo (Code)      | 80.0            | 85.0         | 50.0           | 71.7 |

*   **Llama-3-70B-Instruct (Code)** がオープンソースモデルの中で最高性能を示し、GPT-4ベースのエージェントに匹敵または上回る結果を達成。
*   強力なLLMでは、JSONベースよりもCodeベースのエージェントが優れた性能を発揮する傾向が見られました。

#### GAIA Leaderboardでの順位
Llama-3-70B-InstructをLLMエンジンとするマルチモーダルReactCodeAgentは、GAIAリーダーボードで**4位**を獲得。多くのGPT-4ベースのエージェントを打ち破り、オープンソースカテゴリでトップの座を確立しました。このエージェントは、SearchTool (ウェブブラウザ)、TextInspectorTool、SpeechToTextTool、VisualQATool (Idefics2-8b-chattyベース) などのツールを組み合わせて使用しました。

## 引用（Notable quotes）

*   "We are releasing Transformers Agents 2.0!"
*   "Extremely performant new agent framework, allowing a Llama-3-70B-Instruct agent to outperform GPT-4 based agents in the GAIA Leaderboard!"
*   "Our agent ranks 4th: it beats many GPT-4-based agents, and is now the reigning contender for the Open-Source category!"
*   "transformers.agents has now been upgraded to the stand-alone library smolagents!"

## リスクと課題

記事中で直接的なリスクは言及されていませんが、今後の開発ロードマップが現在の課題と改善点を示唆しています。これらは、エージェントシステムのさらなる実用化に向けた課題と捉えられます。

*   **エージェント共有のオプション不足**: 現在はツールのみHubからプッシュ/ロード可能だが、エージェント自体の共有機能は未実装。
*   **ツールの品質と多様性**: 特に画像処理など、より優れたツールの開発が必要。
*   **長期記憶管理**: 複雑なタスクや継続的な対話において、エージェントが過去の情報を効果的に利用するための長期記憶管理の改善。
*   **マルチエージェントコラボレーション**: 複数のエージェントが連携してより複雑な問題を解決するためのフレームワークの確立。

## 今後の見通し/アクション

Hugging Faceは、今後数ヶ月でTransformers Agentsパッケージ（smolagents）の改善を継続する予定です。

*   **エージェント共有オプションの拡充**: Hugging Face Hubからツールだけでなく、エージェント自体をプッシュ/ロードできる機能を実装予定。
*   **ツール機能の強化**: 特に画像処理を含む、より高性能で多様なツールの開発を進める。
*   **長期記憶管理の改善**: エージェントがより効果的に過去の情報を利用できるよう、長期記憶管理機能を強化する。
*   **マルチエージェントコラボレーションの実現**: 複数のエージェントが連携して複雑なタスクを解決する機能の開発を目指す。

Hugging Faceは、コミュニティからのフィードバックやアイデアを積極的に募り、オープンソースモデルがリーダーボードのトップを占めることを目指しています。

## Source URL
https://huggingface.co/blog/agents
