---
title: "Our Transformers Code Agent beats the GAIA benchmark 🏅"
title_ja: "Transformers Code Agent、GAIAベンチマークを制覇"
source_url: "https://huggingface.co/blog/beating-gaia"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging FaceのTransformers Agentsライブラリで構築されたCode Agentが、最も困難で包括的なエージェントベンチマークであるGAIAでトップスコアを達成しました。Code Agentは、JSON形式よりも効率的で安全なコード実行を特徴とし、GAIAの検証セットで44.2%の正答率を記録し、既存のトップソリューションを上回りました。この成果は、エージェントがアクションをコードで表現することの優位性を示しています。なお、Transformers Agentsは現在スタンドアロンライブラリ「smolagents」としてアップグレードされています。

## 重要ポイント

*   **GAIAベンチマークでトップスコア**: Hugging FaceのTransformers Code Agentが、複雑な多段階推論を要求するGAIAベンチマークで最高スコアを達成しました。
*   **コードベースのアクションの優位性**: エージェントがアクションをPythonコードで表現することで、JSON形式に比べて簡潔性、効率性（約30%少ないステップとトークン）、既存ライブラリの再利用性、LLMのコード生成能力の高さ、変数管理の容易さ、ログの可読性において優れていることを実証しました。
*   **安全なコード実行環境**: LLMが生成するコードを安全に実行するため、抽象構文木(AST)に基づき、明示的に許可された操作のみを実行するサンドボックス型Pythonインタープリタをゼロから構築しました。
*   **効果的な計画コンポーネント**: Nステップごとに「既知の事実/必要な事実の要約」と「ステップバイステップの計画」を生成する計画戦略を採用。過去の計画をプロンプトに含めないことで、LLMが新しい状況に柔軟に対応し、性能が向上することを発見しました。
*   **マルチエージェントオーケストレーション**: ReactCodeAgentをマネージャーとし、Web検索エージェント（JSONエージェント）をツールとして埋め込むナイーブなマルチエージェント構成で、複雑なタスクを解決しました。

## 詳細レポート

### What happened
Hugging FaceのTransformers Agentsライブラリを用いて構築されたCode Agentが、エージェントシステムの最も困難で包括的なベンチマークであるGAIAで、検証セットにおいて44.2%の正答率を達成し、既存のトップソリューション（Autogenベースの40%）を上回りました。テストセットでは33.3%で2位でしたが、最も難しいレベル3の問題では最高平均スコアを記録しました。この結果は、エージェントがアクションをコードで表現するアプローチの有効性を示すものです。

### 背景
*   **エージェントの定義**: LLMを基盤とし、外部ツールを呼び出したり、LLMの出力に基づいてワークフロー（グラフ構造）を変更したりできるシステム。
*   **GAIAベンチマークの難しさ**: GAIAは、高レベルの計画能力と厳密な実行を要求する非常に複雑な多段階質問で構成されており、LLMベースのシステムが苦戦する領域を浮き彫りにします。例えば、画像からの情報抽出、複数のウェブ検索、特定の形式での回答など、連鎖的なステップが必要です。従来のGPT-4-Turboは平均7%未満、Autogenベースのマルチエージェントシステムが40%がこれまでの最高でした。
*   **Code Agentの優位性**: Wang et al. (2024)の研究に基づき、エージェントがアクションをコードで表現することには以下の利点があります。
    *   **簡潔性**: JSON形式に比べてアクション表現がはるかに簡潔。
    *   **効率性**: 平均して30%少ないステップとトークンで済み、LLM呼び出しコストを削減。
    *   **再利用性**: 既存のPythonライブラリのツールを容易に利用可能。
    *   **LLMの親和性**: LLMは学習データにコードが多いため、コード生成に長けている可能性。
    *   **変数管理**: コード内で名前付き変数として要素を容易に保存・参照可能。
    *   **可読性**: エージェントのログが格段に読みやすい。

### 影響
この成果は、エージェントシステムにおけるアクション表現の標準が、JSON/OpenAI形式からコードベースのアクションへと移行する可能性を示唆しています。Transformers Agents（および後継のsmolagents）は、このコードベースのアクションを中核に据える唯一のライブラリであり、今後のエージェント開発の方向性に大きな影響を与える可能性があります。

### 関係者
*   **Hugging Face**: Transformers Agents (現smolagents) の開発チーム。GAIAベンチマークへの挑戦とCode Agentの実装。
*   **Autogenチーム**: ウェブブラウザツールとファイルインスペクターツールをオープンソースで提供し、Hugging Faceの開発を加速。
*   **OpenAI**: LLMエンジンとしてGPT-4oが使用されました。

### データ
GAIAベンチマークにおける主要なエージェントシステムの性能比較:

| エージェントシステム | 検証セット正答率 | テストセット正答率 | レベル3問題 (平均) |
| :----------------- | :--------------- | :--------------- | :----------------- |
| **Transformers Code Agent** | **44.2% (1位)** | **33.3% (2位)** | **最高スコア** |
| Autogen-based solution | 40% (2位) | - | - |
| GPT-4-Turbo | <7% | - | - |

### 引用（Notable quotes）

*   "an agent is any system based on an LLM that can call external tools or not, depending on the need for the current use case and iterate on further steps based on the LLM output."
*   "Code actions are much more concise than JSON."
*   "If the previous version of the plan is present in the prompt, an LLM is likely to heavily reuse it instead of re-evaluating the approach and re-generating a plan when needed."
*   "Code actions will soon replace JSON/OAI format as the standard for agents writing their actions."

## リスクと課題

*   **コード実行の安全性**: LLMが生成するコードは悪意のある、または意図しない動作をする可能性があり、厳重なサンドボックス化とガードレールが不可欠です。現在の実装ではASTベースの安全なインタープリタで対応していますが、常に安全性を確保するための継続的な改善が必要です。
*   **ウェブブラウザツールの限界**: 現在のMarkdownウェブブラウザはJavaScriptのロードやCookieの受け入れに対応しておらず、多くのウェブページにアクセスできない可能性があります。
*   **LLMエンジンの最適化**: 現在はGPT-4oを使用していますが、ファインチューニングされたオープンソースモデルを使用することで、解析エラーの削減やさらなるスコア向上が期待されます。
*   **マルチエージェントオーケストレーションの洗練**: 現在のマルチエージェント構成は「ナイーブ」とされており、よりシームレスで高度なオーケストレーション手法が性能向上に寄与する可能性があります。

## 今後の見通し/アクション

Hugging FaceはTransformers Agents（smolagents）の継続的な改善を計画しており、以下の領域に注力します。

*   **LLMエンジンの改善**: ファインチューニングされたオープンソースモデルの活用により、解析エラーを減らし、スコア向上を目指します。
*   **マルチエージェントオーケストレーションの強化**: 現在のナイーブなアプローチから、より洗練されたシームレスなマルチエージェント連携を追求します。
*   **ウェブブラウザツールの改善**: Seleniumパッケージを導入し、JavaScriptのロードやCookieバナーの処理に対応することで、アクセス可能なウェブページの範囲を拡大します。
*   **計画コンポーネントのさらなる最適化**: 文献にある他の計画戦略のテストや、既存コンポーネントの代替実装、新しいコンポーネントの導入を通じて、計画能力の向上を図ります。

## Source URL
https://huggingface.co/blog/beating-gaia
