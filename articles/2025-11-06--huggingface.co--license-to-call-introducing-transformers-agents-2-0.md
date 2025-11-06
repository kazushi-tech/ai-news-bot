---
title: "License to Call: Introducing Transformers Agents 2.0"
title_ja: "「Transformers Agents 2.0」解禁 GAIAでGPT-4凌駕の高性能"
source_url: "https://huggingface.co/blog/agents"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceはTransformers Agents 2.0をリリースしました。これは、過去の観測に基づいて反復し、複雑なタスクを解決できる2つの新しいエージェントタイプを導入するものです。コードの明瞭性、モジュール性、プロンプトとツールの透明性を重視し、コミュニティエージェントを促進する共有オプションも追加されています。この新しいフレームワークは非常に高性能で、Llama-3-70B-InstructエージェントがGAIAリーダーボードでGPT-4ベースのエージェントを上回る結果を出しました。なお、`transformers.agents`はスタンドアロンライブラリ`smolagents`にアップグレードされました。

## 重要ポイント
*   **新エージェントタイプの導入**: 既存のエージェントに加え、過去の観測に基づいて反復し、自己修正が可能な`ReactCodeAgent`と`ReactJsonAgent`が追加されました。
*   **設計目標の強化**: 明瞭性（シンプルな抽象化、容易なログ検査）、モジュール性（ビルディングブロックの提供）、共有機能（コミュニティによるツール共有）を重視しています。
*   **LLMの弱点克服**: LLMが苦手とする論理、計算、検索といったタスクを、ツールを活用するエージェントによって克服します。
*   **高性能なベンチマーク結果**:
    *   `agents_reasoning_benchmark`において、Llama-3-70B-Instructエージェントがオープンソースモデルをリードし、GPT-4に匹敵する性能を示しました。特に`ReactCodeAgent`でのコード生成能力が強みです。
    *   GAIAリーダーボードの完全セットにおいて、Llama-3-70B-Instructベースのマルチモーダルエージェントが4位を獲得し、多くのGPT-4ベースエージェントを上回りました。
*   **実用的なユースケース**: 自己修正型RAG（Retrieval-Augmented-Generation）や、ウェブブラウジングに特化したマルチエージェント設定など、複雑なタスク解決の具体例が示されています。
*   **ライブラリの移行**: `transformers.agents`は`smolagents`として独立したライブラリになりました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、LLMがツールを使用して複雑なタスクを解決するためのフレームワークであるTransformers Agents 2.0をリリースしました。このアップデートでは、既存のエージェントタイプに加え、過去の観測に基づいて反復し、自己修正する能力を持つ2つの新しいエージェントタイプ（`ReactCodeAgent`と`ReactJsonAgent`）が導入されました。これにより、エージェントはより複雑な推論とアクションのシーケンスを実行できるようになります。

### 背景
大規模言語モデル（LLM）は広範なタスクに対応できますが、論理、計算、検索といった特定の領域ではしばしば課題を抱え、正確な回答を生成できないことがあります。この弱点を克服するための一つのアプローチが「エージェント」の作成です。エージェントはLLMによって駆動されるプログラムであり、特定のスキルを必要とする問題解決のためにツールボックスから適切なツールを利用します。Transformers Agentsは、1年前のリリース以来、「明瞭性」（シンプルな抽象化と容易な検査）と「モジュール性」（ビルディングブロックの提供）というコア設計目標を追求してきました。

### 影響
Transformers Agents 2.0の導入により、LLMベースのシステムは以下のような影響を受けます。
*   **複雑なタスク解決能力の向上**: 自己修正型RAGシステムや、ウェブブラウジングに特化したマルチエージェント設定など、多段階の推論とツール利用を必要とする複雑なタスクを効率的に解決できるようになります。
*   **高性能なエージェントフレームワーク**: 特にLlama-3-70B-Instructのような強力なLLMと組み合わせることで、GAIAリーダーボードでGPT-4ベースのエージェントを上回る性能を発揮し、オープンソースモデルの競争力を大幅に向上させました。
*   **開発の容易性と透明性**: 明瞭でモジュール化された設計により、エージェントワークフローの構築とデバッグが容易になり、LLMの思考プロセスとツール利用が透明化されます。

### 関係者
*   **開発元**: Hugging Face
*   **主要なLLMエンジン**: Llama-3-70B-Instruct, GPT-4 Turbo, Mixtral-8x7B, CohereForAI/c4ai-command-r-plus, Idefics2-8b-chatty (マルチモーダルエージェント用)
*   **関連ライブラリ**: LangChain (ベクトルデータベース、RAGの例で使用), datasets, sentence-transformers, faiss-cpu
*   **ベンチマーク**: GAIA (Mialon et al. 2023), HotpotQA (Yang et al., 2018), GSM8K (Cobbe et al., 2021)

### データ
Transformers Agents 2.0の性能は、複数のベンチマークで評価されました。

*   **agents_reasoning_benchmark**:
    *   **目的**: 計算機と基本的な検索ツールのみを使用するエージェントの推論性能を評価。
    *   **データセット**: HotpotQA (30問、検索ツール使用), GSM8K (40問、計算機使用), GAIA (20問、両ツール使用)。
    *   **結果**: Llama-3-70B-Instruct (ReactCodeAgent) はオープンソースモデルの中でトップの性能を示し、GPT-4に匹敵しました。特にLlama 3の強力なコーディング性能により、`ReactCodeAgent`で優れた結果を出しています。Mixtral-8x7Bのような性能の低いLLMではJSONベースのエージェントが優れる傾向がありますが、Llama-3-70B-Instructのような強力なモデルではCodeベースのエージェントがJSONベースを上回ることが確認されました。

*   **GAIA Leaderboard (完全セット)**:
    *   **目的**: 非常に困難なGAIAベンチマークの完全なセットで、マルチモーダルエージェントの性能を評価。
    *   **使用ツール**: SearchTool (ウェブブラウザ), TextInspectorTool, SpeechToTextTool (distil-whisperベース), VisualQATool (Idefics2-8b-chattyベース)。
    *   **エージェント**: Llama-3-70B-InstructをLLMエンジンとするReactCodeAgent。
    *   **結果**: Llama-3-70B-InstructベースのエージェントはGAIAリーダーボードで**4位**にランクインしました。これは多くのGPT-4ベースのエージェントを打ち破り、オープンソースカテゴリで最高の成績です。

## 引用（Notable quotes）
*   "We are releasing Transformers Agents 2.0!"
*   "Extremely performant new agent framework, allowing a Llama-3-70B-Instruct agent to outperform GPT-4 based agents in the GAIA Leaderboard!"
*   "Llama-3-70B-Instruct leads the Open-Source models: it is on par with GPT-4, and it’s especially strong in a ReactCodeAgent thanks to Llama 3’s strong coding performance!"
*   "Our agent ranks 4th: it beats many GPT-4-based agents, and is now the reigning contender for the Open-Source category!"

## リスクと課題
*   **LLMエンジンの性能依存**: Codeベースのエージェントは、LLMエンジンのコード生成能力に大きく依存します。性能の低いLLMでは、JSONベースのエージェントほど効果的でない可能性があります。
*   **エージェント共有機能の不足**: 現在、Hubからのツール共有は可能ですが、エージェント自体の共有オプションはまだ実装されていません。
*   **機能拡張の必要性**: 画像処理ツールのさらなる改善、長期記憶管理、マルチエージェントコラボレーションといった機能は、今後の開発ロードマップに含まれており、現在のフレームワークにはまだ完全には統合されていません。

## 今後の見通し/アクション
Hugging Faceは、Transformers Agentsパッケージの継続的な改善を計画しており、以下の開発ロードマップを掲げています。
*   **エージェント共有オプションの拡充**: Hugging Face Hubからのエージェントのプッシュ/ロード機能を実装し、コミュニティによるエージェントの共有を促進します。
*   **ツール機能の強化**: 特に画像処理ツールなど、既存ツールの改善と新しいツールの開発を進めます。
*   **長期記憶管理**: エージェントがより長期的なコンテキストを保持し、複雑なタスクをより効果的に処理できるよう、長期記憶管理機能を実装します。
*   **マルチエージェントコラボレーション**: 複数のエージェントが連携してタスクを解決する機能の開発を進めます。

ユーザーは、`pip install "git+https://github.com/huggingface/transformers.git#egg=transformers[agents]"`で早期アクセス版をインストールし、Transformers Agentsを試すことが推奨されています。フィードバックやアイデアが歓迎されており、オープンソースモデルがリーダーボードのトップを占めることを目指しています。

## Source URL
https://huggingface.co/blog/agents
