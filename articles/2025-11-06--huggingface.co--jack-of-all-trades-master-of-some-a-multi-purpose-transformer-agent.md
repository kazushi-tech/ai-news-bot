---
title: "Jack of All Trades, Master of Some, a Multi-Purpose Transformer Agent"
title_ja: "JAT、汎用AIへ 多芸多才Transformerエージェント 得意分野も"
source_url: "https://huggingface.co/blog/jat"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
# Jack of All Trades, Master of Some, a Multi-Purpose Transformer Agent

## 概要 (TL;DR)
Hugging Faceは、汎用エージェント「Jack of All Trades (JAT)」プロジェクトを発表しました。これは、Google DeepMindのGatoのオープンな再現から始まり、複数の改善を加えて開発されたTransformerベースのモデルです。JATは、ビデオゲーム、ロボット制御、ナビゲーションなど多岐にわたるシーケンシャルな意思決定タスクを単一のネットワークでこなすことができ、NLPやCVタスクにおいても初歩的な能力を示します。プロジェクトでは、多数の専門家RLエージェント、汎用エージェント訓練用の初のデータセットであるJATデータセット、およびJATモデルが公開されました。

## 重要ポイント
*   **汎用エージェントJAT:** 単一のTransformerベースモデルで、多様なビジョン・言語および意思決定タスクに対応。Gatoのオープンな再現と改善版。
*   **JATデータセット:** 汎用エージェント訓練用に特化した初のデータセット。Atari、BabyAI、Meta-World、MuJoCoなどの環境でSOTA性能を達成した専門家エージェントによる数十万の軌跡と、テキストデータセットを含む。
*   **アーキテクチャ:** EleutherAIのGPT-Neoをベースとし、観測値、行動、報酬を交互に埋め込むことでシーケンシャルな意思決定タスクを効率的に処理。画像、連続値、離散値、テキストなど多様なデータタイプに対応するエンコーディング/デコーディング機構を持つ。
*   **性能:** 157の訓練タスクにおいて、専門家エージェントの平均65.8%の性能を達成。特にBabyAIで99.0%、MuJoCoで84.8%。Atariでは21ゲームで人間性能を上回る。
*   **観測予測の利点:** 補助タスクとして観測予測を組み込む際、適切な重み付け（κ=0.005付近）を行うことで、エージェントの学習効率が向上することが実験で示された。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Faceは、汎用AIエージェントの実現に向けた「Jack of All Trades (JAT)」プロジェクトを公開しました。これは、Google DeepMindのGatoのオープンな再現として始まり、シーケンシャルデータと連続値の処理においてGatoに対するいくつかの改善を導入しました。プロジェクトの成果として、多数の専門家RLエージェント、汎用エージェント訓練用のJATデータセット、およびJATモデルがリリースされました。JATモデルは、ビデオゲーム、ロボット制御、ナビゲーションなど、幅広いタスクを単一のTransformerネットワークで実行できます。

**背景:**
従来の強化学習（RL）エージェントは特定の環境に特化して訓練されることが一般的でした。しかし、ReedらによるGatoの研究は、ビジョン・言語と意思決定の両タスクをこなせる汎用Transformerの可能性を示しました。JATプロジェクトは、このGatoのコンセプトをオープンソースで再現し、さらに発展させることを目指して開始されました。

**影響:**
*   **汎用AI研究の推進:** JATは、単一のネットワークで多様なタスクを処理できる汎用エージェントの実現に向けた重要な一歩となります。
*   **オープンリソースの提供:** JATデータセット、モデル、専門家エージェントの公開により、研究コミュニティが汎用エージェントの訓練と研究を加速するための貴重なリソースが提供されます。
*   **学習効率の洞察:** 観測予測を補助タスクとして組み込むことの学習効率への影響に関する研究は、将来のRLエージェント設計に重要な示唆を与えます。

**関係者:**
*   **プロジェクト発表元:** Hugging Face
*   **論文著者:** Quentin Gallouédec, Edward Beeching, Clément Romac, Emmanuel Dellandréa
*   **技術協力:** EleutherAI (GPT-Neo実装の利用)

**データ:**
*   **JATデータセット:**
    *   汎用エージェント訓練用の初のデータセット。
    *   数百数千の専門家軌跡を含む。
    *   **収集環境:** Atari、BabyAI、Meta-World、MuJoCoなど、多様な性質と難易度の環境。
    *   **データ内容:** `continuous_observations`, `continuous_actions`, `rewards`など。
    *   **追加データ:** RLデータに加え、Wikipedia、Oscar、OK-VQA、Conceptual-Captionsなどのテキストデータセットも含む。
*   **実験結果（専門家正規化スコア）:**
    *   **全体平均:** 専門家エージェントの65.8% (4ドメイン平均)。
    *   **Atari 57:** 専門家の14.1% (人間性能の37.6%)、21ゲームで人間性能を超える。
    *   **BabyAI:** 専門家の99.0%。
    *   **Meta-World:** 専門家の65.5%。
    *   **MuJoCo:** 専門家の84.8%。
*   **観測予測実験:**
    *   観測損失と行動損失の重み付けパラメータ `κ` を使用。
    *   `κ=0.005` 付近で学習効率が最も向上することが確認された。

## 引用（Notable quotes）
*   "We're excited to share Jack of All Trades (JAT), a project that aims to move in the direction of a generalist agent."
*   "The JAT dataset, the first dataset for generalist agent training. It contains hundreds of thousands of expert trajectories collected with the expert agents"
*   "The JAT model, a transformer-based agent capable of playing video games, controlling a robot to perform a wide variety of tasks, understanding and executing commands in a simple navigation environment and much more!"
*   "If we were to summarize these results in one number, it would be 65.8%, the average performance compared to the JAT expert over the 4 domains."
*   "Our study suggests that adding observation prediction to the learning process can be beneficial, as long as it's balanced correctly."

## リスクと課題
*   **JATデータセットの改善:** 現在のデータセットは初期段階であり、各環境につき1つの専門家エージェントからの軌跡のみで、バイアスが生じる可能性。より多くのデータ収集と多様な専門家エージェントの訓練が必要。
*   **行動クローニングの限界:** JATエージェントは基本的な行動クローニングで訓練されているため、準最適軌跡を活用できず、専門家を超える性能は出せない。オフラインRLの導入が性能向上に寄与する可能性がある。
*   **マルチタスクサンプリング戦略の最適化:** 現在の均一なサンプリング戦略は学習を阻害する可能性があり、最も困難なタスクに焦点を当てる動的なサンプリング戦略の導入が求められる。
*   **テキストタスクの性能:** JATモデルはテキストタスクにおいて「初歩的な能力」しか示しておらず、この分野でのさらなる改善が必要。

## 今後の見通し/アクション
*   **データセットの拡充:** JATデータセットの質と量を向上させるため、より多くのデータと多様な専門家エージェントからの軌跡を収集する。
*   **オフラインRLの導入:** 行動クローニングからオフラインRLへの移行を検討し、準最適軌跡の活用と専門家を超える性能の達成を目指す。
*   **スマートなマルチタスクサンプリング戦略の開発:** 最も困難なタスクに焦点を当てる動的なサンプリング戦略を実装し、学習効率と性能を最大化する。
*   **研究コミュニティへの呼びかけ:** JATプロジェクトが汎用エージェント研究の新たな方向性を開いたと信じ、さらなる研究と貢献を奨励する。
*   **公開リソースの活用:** JATモデル、データセット、コード、論文はHugging Face Hubで公開されており、研究者や開発者がこれらを利用して、より汎用性の高いAIシステムの開発に貢献できる。

## Source URL
https://huggingface.co/blog/jat
