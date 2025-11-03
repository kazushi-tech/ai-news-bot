---
title: "License to Call: Introducing Transformers Agents 2.0"
title_ja: "Transformers Agents 2.0登場、能力解放でGPT-4超え"
source_url: "https://huggingface.co/blog/agents"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは「Transformers Agents 2.0」をリリースしました。これは、既存のエージェントタイプに加え、過去の観測に基づいて複雑なタスクを反復的に解決できる2つの新しいエージェントを導入するものです。コードの明瞭性、モジュール性、およびプロンプトやツールの透明性を重視し、コミュニティエージェントを促進する共有オプションも追加されました。この新しいエージェントフレームワークは非常に高性能で、特にLlama-3-70B-InstructベースのエージェントがGAIAリーダーボードでGPT-4ベースのエージェントを凌駕する結果を出しています。なお、`transformers.agents`はスタンドアロンライブラリ`smolagents`にアップグレードされました。

## 重要ポイント

*   **新エージェントタイプの導入**: 過去の観測に基づき反復可能な新しいエージェント（ReactCodeAgent, ReactJsonAgent）が追加され、複雑なタスク解決能力が向上しました。
*   **設計原則**: 明瞭性（Clarity through simplicity）とモジュール性（Modularity）を重視し、抽象化を最小限に抑え、再利用可能なビルディングブロックを提供します。
*   **高性能なオープンソースLLMの活用**: Llama-3-70B-Instructをエンジンとするエージェントが、GAIAリーダーボードでGPT-4ベースのエージェントを上回り、オープンソースカテゴリで最高位を獲得しました。
*   **自己修正RAGとマルチエージェント**: 自己修正機能を持つRAGシステムや、ウェブブラウジングに特化したマルチエージェント設定など、具体的なユースケースが示されました。
*   **Code-basedエージェントの優位性**: 強力なLLM（例: Llama-3-70B-Instruct）を使用する場合、Code-based ReactエージェントがJSON-basedエージェントよりも優れた性能を発揮することが示されました。
*   **ライブラリの移行**: `transformers.agents`は、より焦点を絞ったスタンドアロンライブラリ`smolagents`にアップグレードされました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、大規模言語モデル（LLM）の能力を拡張するためのエージェントフレームワーク「Transformers Agents 2.0」を発表しました。このリリースでは、既存のエージェントに加え、過去の観測に基づいて自己修正・反復が可能な「ReactAgent」（ReactCodeAgentとReactJsonAgent）が導入されました。また、ライブラリは`transformers.agents`から`smolagents`というスタンドアロンライブラリに移行しました。

**背景:**
LLMは多様なタスクに対応できますが、論理、計算、検索といった特定の領域ではしばしば課題を抱え、正確な回答を生成できないことがあります。この弱点を克服するため、LLMを基盤とし、ツールを活用してアクションを実行する「エージェント」が有効なアプローチとして注目されています。Hugging Faceは、エージェントワークフローの複雑さを軽減し、明瞭性とモジュール性を高めることを目標に、このフレームワークを開発しました。

**影響:**
*   **複雑なタスク解決能力の向上**: エージェントは、自己修正型のRetrieval-Augmented-Generation (RAG) や、専門のウェブサーファーエージェントを組み込んだマルチエージェント設定による効率的なウェブブラウジングなど、多段階の推論とツール使用を必要とする複雑なタスクを解決できるようになりました。
*   **オープンソースLLMの競争力強化**: Llama-3-70B-InstructのようなオープンソースLLMが、このエージェントフレームワークと組み合わせることで、GPT-4ベースのエージェントに匹敵、あるいはそれを凌駕する性能を発揮し、GAIAリーダーボードでオープンソースモデルとして最高位を獲得しました。
*   **開発の容易性と透明性**: シンプルな設計とモジュール化により、開発者はエージェントシステムを容易に構築・検査できるようになり、ツールの動的な利用やLLMの思考プロセスが透明化されました。

**関係者:**
*   **Hugging Face**: Transformers Agents 2.0およびsmolagentsの開発・提供元。
*   **LLM開発者/研究者**: 新しいエージェントフレームワークを利用して、より高性能で複雑なタスクを解決できるアプリケーションや研究を推進。
*   **LLMユーザー**: エージェント機能により、LLMの応用範囲が広がり、より信頼性の高い結果を得られるようになる。

**データ:**
**1. agents_reasoning_benchmarkでのLLMエンジン比較**
（HotpotQA、GSM8K、GAIAからの合計90問で構成）

| LLM Engine          | ReactJsonAgent | ReactCodeAgent |
| :------------------ | :------------- | :------------- |
| Mixtral-8x7B        | 68.3%          | 59.4%          |
| Llama-3-70B-Instruct| 75.6%          | **79.4%**      |
| GPT-4 Turbo         | **77.2%**      | 76.7%          |

*Llama-3-70B-InstructのReactCodeAgentがGPT-4 TurboのReactCodeAgentを上回り、オープンソースモデルとして最高の性能を示しました。*

**2. GAIA Leaderboardでのマルチモーダルエージェントの性能**
Hugging Faceのマルチモーダルエージェント（Llama-3-70B-Instructベース、SearchTool, VisualQATool, SpeechToTextTool, TextInspectorToolを使用）は、GAIAリーダーボードで**全体4位**にランクインしました。これは、多くのGPT-4ベースのエージェントを打ち破り、オープンソースカテゴリで最高位の成果です。

## 引用（Notable quotes）

*   "We are releasing Transformers Agents 2.0!"
*   "Extremely performant new agent framework, allowing a Llama-3-70B-Instruct agent to outperform GPT-4 based agents in the GAIA Leaderboard!"
*   "Our framework strives for: Clarity through simplicity: we reduce abstractions to the minimum. Modularity: We prefer to propose building blocks rather than full, complex feature sets."
*   "Our agent ranks 4th: it beats many GPT-4-based agents, and is now the reigning contender for the Open-Source category!"

## リスクと課題

記事中で明示的なリスクは述べられていませんが、今後の開発ロードマップから以下の課題が示唆されます。

*   **長期記憶管理**: エージェントが過去の対話や観測を効率的かつ長期的に記憶し、利用する能力のさらなる向上。
*   **マルチエージェント連携の複雑性**: 複数のエージェントが協調してより複雑なタスクを解決するための高度な連携メカニズムの実現。
*   **ツール品質の向上**: 特に画像処理など、特定のモダリティにおけるツールの性能と多様性の改善。
*   **エージェント共有の容易性**: 現在はツールのみがHubからプッシュ/ロード可能であり、エージェント自体を容易に共有・ロードする機能の不足。

## 今後の見通し/アクション

Hugging Faceは、今後数ヶ月でこのパッケージを継続的に改善していく計画です。

*   **開発ロードマップ**:
    *   **エージェント共有オプションの拡充**: 現在はHubからツールのプッシュ/ロードが可能ですが、エージェント自体のプッシュ/ロード機能も実装予定です。
    *   **より優れたツールの開発**: 特に画像処理など、特定のモダリティにおけるツールの性能向上を目指します。
    *   **長期記憶管理**: エージェントの長期記憶管理機能の強化に取り組みます。
    *   **マルチエージェント連携**: 複数のエージェントが協調してタスクを解決する機能の開発を進めます。
*   **ユーザーへの呼びかけ**: ユーザーに対し、`transformers agents`（または新しい`smolagents`）を試用し、フィードバックやアイデアを提供することを奨励しています。オープンソースモデルがリーダーボードのトップを占めることを目指しています。
*   **ライブラリ移行**: `transformers.agents`は、スタンドアロンライブラリ`smolagents`にアップグレードされており、ユーザーはそちらを利用することが推奨されます。

## Source URL（必須）
https://huggingface.co/blog/agents
