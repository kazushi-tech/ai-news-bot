---
title: "Gaia2 and ARE: Empowering the community to study agents"
title_ja: "Gaia2とARE、AIエージェント研究をコミュニティに開放"
source_url: "https://huggingface.co/blog/gaia2"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、より複雑で現実世界に近いAIエージェントの評価・開発を可能にする新ベンチマーク「Gaia2」と、その実行・デバッグ・評価フレームワーク「ARE (Agent Research Environments)」をリリースしました。Gaia2は、GAIAの次世代版として、インタラクティブな振る舞いや複雑性管理、ノイズ耐性、時間制約のあるタスクなどを評価し、既存のモデルが直面する課題を浮き彫りにします。AREは、カスタマイズ可能なシミュレーション環境を提供し、エージェントの行動を詳細に分析できるトレース機能を備えています。

## 重要ポイント

*   **新ベンチマークGaia2**: 既存のGAIAベンチマークの限界を超え、より複雑な現実世界のアシスタントタスク（読み書き、インタラクティブな振る舞い、曖昧さ処理、適応性、時間制約、ノイズ耐性など）を評価します。
*   **オープンフレームワークARE**: Gaia2の実行環境であり、エージェントのデバッグ、評価、研究を可能にするオープンソースのシミュレーションフレームワークです。スマートフォンモックアップ環境や、エージェントの全インタラクションを記録する構造化トレース機能を提供します。
*   **モデル評価結果**: 2025年9月時点でGPT-5 (高推論モード) が総合最高スコア、オープンソースではKimi K2が最高。単純な実行や検索タスクは解決に近づいているものの、曖昧さ、適応性、ノイズ耐性、特に時間制約のあるタスクは全てのモデルにとって依然として大きな課題です。
*   **コスト効率の重視**: 単純な正答率だけでなく、LLM呼び出し回数や出力トークン数といったコストも考慮した評価の重要性を強調しています。
*   **コミュニティへの貢献**: Gaia2データセットはCC by 4.0、AREはMITライセンスで公開され、開発者が自身のモデルを評価し、エージェント研究を深めるためのツールを提供します。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、AIエージェントの評価と研究のための新しいベンチマーク「Gaia2」と、オープンソースの実行・デバッグ・評価フレームワーク「ARE (Agent Research Environments)」を発表しました。これらは、より複雑で現実世界に近いエージェントの振る舞いを分析し、開発を加速させることを目的としています。

**背景:**
理想的なAIエージェントは、曖昧な指示の管理、計画の構築、リソースの特定、計画の実行、予期せぬイベントへの適応、正確性の維持、幻覚の回避を容易に行うべきです。しかし、既存のエージェント評価環境は、タスクと密接に結合しており、現実世界の柔軟性に欠け、シミュレートされた環境が現実の「ごちゃごちゃした」状況（ページの読み込み失敗、予期せぬイベント、非同期の混乱など）を反映していませんでした。2023年に発表されたGAIAベンチマークは、その簡単なレベルがモデルにとって容易になり、最も難しい問題も解決に近づいていたため、より新しく、より困難なエージェントベンチマークが必要とされていました。

**影響:**
Gaia2とAREのリリースにより、開発者は以下のことが可能になります。
*   **現実世界に近い評価**: 読み書き、インタラクティブな振る舞い、曖昧さ処理、適応性、時間制約、ノイズ耐性といった、より複雑なエージェントの能力を評価できます。
*   **エージェントの深い理解**: AREの構造化されたトレース機能により、エージェントの思考プロセス、ツール呼び出し、API応答、タイミングメトリクスなどを詳細に分析し、デバッグを容易にします。
*   **研究と開発の加速**: オープンソースのフレームワークとデータセットにより、コミュニティ全体がより信頼性が高く、適応性の高いAIエージェントの構築に貢献できるようになります。
*   **コスト効率の考慮**: 評価において、単なる正答率だけでなく、LLMの呼び出し回数や出力トークン数といったコストパフォーマンスも考慮する新たな視点を提供します。

**関係者:**
*   **Hugging Face**: Gaia2ベンチマークとAREフレームワークの発表元。
*   **Meta**: AREフレームワークの開発元（Meta Agents Research Environments）。
*   **コミュニティ**: Gaia2とAREを活用してエージェントの研究、開発、評価を行う開発者や研究者。

**データ:**
*   **Gaia2データセット**: 1000の人間が作成した新しいシナリオで構成され、CC by 4.0ライセンスで公開。
*   **AREフレームワーク**: MITライセンスで公開。
*   **評価対象モデル**: Llama 3.3-70B Instruct, Llama-4-Maverick, GPT-4o, Qwen3-235B-MoE, Grok-4, Kimi K2, Gemini 2.5 Pro, Claude 4 Sonnet, GPT-5 (全推論モード)。
*   **評価設定**: ReActループ、温度0.5、生成制限16Kトークン。モデル・アズ・ア・ジャッジ（Llama 3.3 Instruct 70B）と厳密一致評価の組み合わせ。101のツールと環境説明はシステムプロンプトで提供。
*   **評価タスクグループ**:
    *   **Execution**: 多段階の指示実行とツール使用。
    *   **Search**: 複数ソースからの情報収集。
    *   **Ambiguity Handling**: 矛盾する要求の明確化。
    *   **Adaptability**: シミュレーション内の変更への対応。
    *   **Time/temporal Reasoning**: 時間制約のあるアクション。
    *   **Agent-to-Agent Collaboration**: 直接APIアクセスなしでのエージェント間通信。
    *   **Noise Tolerance**: API障害や環境不安定性への堅牢性。

## 引用（Notable quotes）

*   "However, developing agents and testing these behaviors is no small feat: if you have ever tried to debug your own agent, you’ve probably observed how tedious and frustrating this can be."
*   "Where GAIA was read-only, Gaia2 is now a read-and-write benchmark, focusing on interactive behavior and complexity management."
*   "Among the evaluated models, the highest-scoring model overall as of September 2025 is GPT-5 with high reasoning, and the best open source model is Kimi K2."
*   "Last but not least, the hardest split for all models at the moment is the time one: it’s very hard at this moment for models to correctly handle time-sensitive actions..."
*   "Gaia2 and ARE are new research tools that we hope will empower anyone to easily build more reliable and adaptable AI agents - by allowing easy experiments, making real-world evaluation accessible to anyone, as well as improving trust through transparent, reproducible benchmarks and debuggable traces."

## リスクと課題

*   **既存評価環境の限界**: 従来のベンチマークは現実世界の複雑性やノイズを十分に反映しておらず、エージェントの真の能力を評価できていませんでした。
*   **エージェントのデバッグの困難さ**: エージェントの振る舞いを理解し、デバッグすることは非常に手間がかかり、フラストレーションのたまる作業です。
*   **モデルの未熟な能力**: 現在の最先端モデルであっても、「Ambiguity Handling（曖昧さ処理）」「Adaptability（適応性）」「Noise Tolerance（ノイズ耐性）」、特に「Time/temporal Reasoning（時間制約のあるアクション）」といったタスクは依然として大きな課題であり、解決には至っていません。
*   **外部接続時のセキュリティ**: AREはデフォルトで安全なJSONエージェントですが、外部アプリケーションや信頼できないMCP (Multi-Agent Communication Protocol) に接続する際には、セキュリティリスクに注意が必要です。

## 今後の見通し/アクション

*   **コミュニティによる活用**: Hugging Faceは、Gaia2とAREがコミュニティによって創造的に活用され、より信頼性が高く、適応性の高いAIエージェントの構築に貢献することを期待しています。
*   **モデル評価とリーダーボードへの参加**: 開発者は自身のモデルをGaia2で評価し、結果をHugging Face Hubにアップロードしてリーダーボードに参加することで、エージェント研究の進展に貢献できます。
*   **エージェント研究の深化**: AREのカスタマイズ機能（独自のツール接続、シナリオ実装、トリガーイベント定義など）を活用し、エージェントのツール呼び出し能力、オーケストレーション、ノイズ環境での限界、エージェント間インタラクションなどを詳細に研究することが推奨されます。
*   **透明性と再現性の向上**: Gaia2とAREは、透明で再現可能なベンチマークとデバッグ可能なトレースを提供することで、AIエージェントへの信頼性を高めることを目指しています。

## Source URL（必須）
https://huggingface.co/blog/gaia2
