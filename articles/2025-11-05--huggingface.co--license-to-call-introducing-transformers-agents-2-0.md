---
title: "License to Call: Introducing Transformers Agents 2.0"
title_ja: "Transformers Agents 2.0 複雑タスク解決へ能力解禁"
source_url: "https://huggingface.co/blog/agents"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceはTransformers Agents 2.0をリリースしました。この新バージョンでは、既存のエージェントタイプに加え、過去の観測に基づいて反復し、複雑なタスクを解決できる2つの新しいエージェントを導入しています。コードの明瞭性、モジュール性、透明性を重視し、コミュニティエージェントを促進する共有オプションも追加されました。特に、Llama-3-70B-InstructエージェントがGAIAリーダーボードでGPT-4ベースのエージェントを上回り、高いパフォーマンスを示しています。なお、`transformers.agents`はスタンドアロンライブラリ`smolagents`にアップグレードされました。

## 重要ポイント
*   **Transformers Agents 2.0のリリース**: 複雑なタスク解決のために、過去の観測に基づいて反復可能な新しいエージェントタイプ（ReactCodeAgent、ReactJsonAgent）を導入。
*   **設計思想**: シンプルさによる明瞭性とモジュール性を核とし、ツール、ツールボックス、LLMエンジンを分離。
*   **高性能**: Llama-3-70B-InstructベースのReactCodeAgentが、GAIAリーダーボードにおいてGPT-4ベースのエージェントを凌駕し、オープンソースモデルでトップ（全体4位）の成績を達成。
*   **ユースケース**: 自己修正型RAGシステムや、マルチエージェント設定による効率的なウェブブラウジングなど、実用的な応用例を提示。
*   **ライブラリの移行**: `transformers.agents`は、スタンドアロンライブラリ`smolagents`としてアップグレードされました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、LLMの限界を克服し、複雑なタスク解決能力を向上させるためのエージェントフレームワーク「Transformers Agents 2.0」をリリースしました。このバージョンでは、過去の観測に基づいて反復し、自己修正が可能な`ReactCodeAgent`と`ReactJsonAgent`という新しいエージェントタイプが導入されました。フレームワークは、コードの明瞭性、モジュール性、ツールとプロンプトの透明性を重視して設計されており、コミュニティによるエージェント共有を促進する機能も追加されています。また、`transformers.agents`ライブラリは、`smolagents`というスタンドアロンライブラリにアップグレードされました。

### 背景
大規模言語モデル（LLM）は多岐にわたるタスクに対応できますが、論理、計算、検索といった特定の領域ではしばしば課題を抱え、正確な回答を生成できないことがあります。この弱点を克服するため、LLMを原動力とし、特定のスキルを持つ「ツール」を活用してアクションを実行する「エージェント」というアプローチが注目されています。Transformers Agentsは1年前にローンチされ、その設計目標である「明瞭性」と「モジュール性」をさらに強化するために2.0が開発されました。

### 影響
*   **タスク解決能力の向上**: 新しい反復型エージェントにより、自己修正型のRetrieval-Augmented-Generation (RAG) システムや、ウェブブラウジングのような複雑なサブタスクを専門エージェントに委譲するマルチエージェント設定が可能になり、より高度な問題解決が実現しました。
*   **ベンチマークでの高パフォーマンス**: Llama-3-70B-InstructをLLMエンジンとして使用したエージェントが、GAIAリーダーボードで多くのGPT-4ベースのエージェントを上回り、オープンソースモデルとして最高位（全体4位）を獲得しました。これは、オープンソースLLMが商用モデルに匹敵するエージェント性能を発揮できることを示しています。
*   **Codeベースエージェントの優位性**: 強力なLLMエンジン（Llama-3-70B-Instructなど）を使用する場合、JSONベースのエージェントよりもCodeベースのエージェントが優れた性能を発揮することが示されました。

### 関係者
*   **Hugging Face**: Transformers Agentsおよびsmolagentsの開発元。
*   **LLMエンジン**: Llama-3-70B-Instruct、GPT-4 Turbo、Mixtral-8x7B、Command-R+、Idefics2-8b-chatty（マルチモーダル機能用）。
*   **ベンチマーク**: GAIA (Mialon et al., 2023)、agents_reasoning_benchmark (HotpotQA, GSM8K)。
*   **関連ライブラリ**: LangChain, sentence-transformers, FAISS, datasets。

### データ

#### agents_reasoning_benchmark結果 (平均2回実行)
| LLM Engine          | ReactJsonAgent | ReactCodeAgent |
| :------------------ | :------------- | :------------- |
| Mixtral-8x7B        | 57.5%          | 47.5%          |
| Llama-3-70B-Instruct | 75%            | 82.5%          |
| GPT-4 Turbo         | 77.5%          | 77.5%          |
*Llama-3-70B-InstructはReactCodeAgentにおいてGPT-4と同等かそれ以上の性能を発揮。Mixtral-8x7BではCodeベースがJSONベースより劣る。*

#### GAIA Leaderboard結果
*   Hugging Faceのマルチモーダルエージェント（Llama-3-70B-Instructベース）が**全体で4位**にランクイン。
*   多くのGPT-4ベースのエージェントを上回り、**オープンソースカテゴリでトップ**の性能を達成。
*   使用された主要ツール: SearchTool (ウェブブラウザ), TextInspectorTool, SpeechToTextTool, VisualQATool。

## 引用（Notable quotes）
*   "We are releasing Transformers Agents 2.0!"
*   "Extremely performant new agent framework, allowing a Llama-3-70B-Instruct agent to outperform GPT-4 based agents in the GAIA Leaderboard!"
*   "Our agent ranks 4th: it beats many GPT-4-based agents, and is now the reigning contender for the Open-Source category!"
*   "In essence, what an agent does is “allowing an LLM to use tools”."

## リスクと課題
*   **LLMエンジンの性能依存**: Codeベースのエージェントは、LLMエンジンのコード生成能力に大きく依存するため、Mixtral-8x7Bのような比較的性能の低いLLMではJSONベースのエージェントよりも性能が劣る可能性がある。
*   **エージェント共有の限定性**: 現在、Hubからのツールプッシュ/ロードは可能だが、エージェント自体のプッシュ/ロード機能はまだ実装されていない。
*   **ツール機能の改善**: 特に画像処理ツールにおいて、さらなる機能強化が必要。
*   **長期記憶管理**: エージェントの長期的な記憶管理機能は今後の開発課題。
*   **マルチエージェントコラボレーション**: 複数エージェント間のより高度な連携機能の実現。

## 今後の見通し/アクション
Hugging Faceは、今後数ヶ月でTransformers Agents (smolagents) パッケージの継続的な改善を計画しています。
*   **エージェント共有オプションの拡充**: Hubからのエージェントのプッシュ/ロード機能を実装し、コミュニティでの共有をさらに促進。
*   **ツール機能の強化**: 特に画像処理ツールを中心に、より高性能なツールの開発。
*   **長期記憶管理**: エージェントがより長期的な情報を保持し、活用できる機能の実装。
*   **マルチエージェントコラボレーション**: 複数エージェントが連携して複雑なタスクを解決する機能の強化。
コミュニティからのフィードバックやアイデアを積極的に取り入れ、オープンソースモデルがリーダーボードのトップを占めることを目指しています。

## Source URL
https://huggingface.co/blog/agents
