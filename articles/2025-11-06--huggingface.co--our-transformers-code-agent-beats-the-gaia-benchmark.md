---
title: "Our Transformers Code Agent beats the GAIA benchmark 🏅"
title_ja: "Transformers Code Agent、難関GAIAベンチマークでトップ"
source_url: "https://huggingface.co/blog/beating-gaia"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging FaceのTransformers Agentsライブラリで構築されたCode Agentが、最も包括的で困難なエージェントベンチマークであるGAIAでトップの成績を収めました。特に、バリデーションセットで44.2%を達成し、既存のトップソリューションを上回りました。この成果は、エージェントがアクションをコードで表現する「Code actions」のアプローチが、JSONなどの形式よりも優れていることを示しています。

## 重要ポイント

*   **GAIAベンチマークでのトップ成績**: Transformers AgentsのCode Agentが、GAIAベンチマークのバリデーションセットで44.2%のスコアを記録し、既存のソリューションを上回って1位を獲得しました。テストセットでは33.3%で2位、特に難易度の高いレベル3問題では最高の平均スコアを達成しています。
*   **Code Agentの優位性**: エージェントがアクションをPythonコードで表現する「Code actions」は、JSON形式と比較して、アクションの簡潔性、ステップ数の約30%削減（コスト削減）、一般的なライブラリのツール再利用、LLMのコード生成能力の高さ、変数の扱いやすさ、ログの可読性において優れていることが実証されました。
*   **安全なコード実行環境**: LLMが生成するコードの安全性を確保するため、Hugging FaceはAST（抽象構文木）ベースで、明示的に許可された操作のみを実行する「LLMセーフなPythonインタープリタ」をゼロから構築しました。これにより、無限ループや不適切なファイルアクセスなどのリスクを軽減しています。
*   **マルチエージェントとプランニング**: 高度なタスク解決のために、ReactCodeAgent（トップレベル）とWeb Search Agent（Webブラウジング特化）を組み合わせたマルチエージェントオーケストレーションを採用。また、Nステップごとに事実の要約と計画を生成するプランニングコンポーネントを導入し、LLMの意思決定を支援しています。
*   **smolagentsへの移行**: 本記事で紹介された`transformers.agents`フレームワークは、現在スタンドアロンライブラリ`smolagents`にアップグレードされており、同様のAPIで利用可能です。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging FaceのTransformers Agentsライブラリを用いて開発されたCode Agentが、エージェントシステムの性能を測る最も困難で包括的なベンチマークであるGAIAにおいて、既存のソリューションを上回る成績を収めました。バリデーションセットで44.2%のスコアを達成し、トップに立ちました。

**背景:**
エージェントシステムは、LLMが外部ツールを呼び出し、その出力に基づいて次のステップを反復的に決定することで、固定されたワークフローでは不可能な柔軟な問題解決を可能にします。GAIAベンチマークは、複数の情報源（画像、ウェブ、ファイル）からの情報収集、複雑な推論、厳密な出力形式が求められる非常に難しい問題で構成されており、LLMベースのエージェントが直面する課題を浮き彫りにします。従来のGPT-4-Turbo単体では7%未満、Autogenベースのマルチエージェントソリューションでも40%が最高でした。

**技術的アプローチと影響:**
*   **Code Agentの採用**: アクションをPythonコードで表現する「Code Agent」のアプローチを採用しました。これにより、JSON形式と比較して、アクションの表現が簡潔になり、ステップ数とトークン生成数を約30%削減し、LLM呼び出しコストを低減できることが確認されました。また、LLMがコード生成に優れている点や、変数の管理が容易になる点も利点です。
*   **安全なPythonインタープリタ**: LLMが生成するコードの安全な実行のため、AST（抽象構文木）を解析し、明示的に許可された操作のみを実行するカスタムのPythonインタープリタを開発しました。これにより、悪意のあるコードや無限ループ、不適切なファイルアクセスを防ぎます。
*   **ツール**: Autogenチームがオープンソース化したWebブラウザ（Markdown形式でページを返す）とファイルインスペクターを主要ツールとして活用しました。
*   **マルチエージェントオーケストレーション**: トップレベルのReactCodeAgent（Pythonでアクション実行）が、Webブラウジングに特化したJSONベースのWeb Search Agentをツールとして呼び出す、という「エージェントをツールとして埋め込む」素朴なマルチエージェント構成を採用しました。
*   **プランニングコンポーネント**: Nステップごとに「既知の事実と発見すべき事実の要約」と「ステップバイステップの計画」を生成し、LLMの次のアクション生成のコンテキストとして提供することで、より良い解決経路を選択できるよう促しました。以前の計画を再利用しない方がスコアが向上するという興味深い発見もありました。

**データ:**

| ベンチマーク | スコア | 順位 | 備考 |
| :---------- | :---- | :--- | :--- |
| GAIA (Validation Set) | 44.2% | 1位 | 既存トップソリューションを4ポイント上回る |
| GAIA (Test Set) | 33.3% | 2位 | Microsoft Autogenを上回る |
| GAIA (Level 3 Hardcore) | 最高平均スコア | 1位 | 最も難しい問題群で優れた性能 |

**関係者:**
*   **Hugging Face**: Transformers AgentsおよびCode Agentの開発者。
*   **Autogenチーム**: Webブラウザツールとファイルインスペクターのオープンソース提供者。
*   **OpenAI**: LLMエンジンとしてGPT-4oが使用されました。

## 引用（Notable quotes）

*   "GAIA is the most comprehensive benchmark for agents. The questions in GAIA are very difficult and highlight certain difficulties of LLM-based systems."
*   "Code actions are much more concise than JSON."
*   "On average, the paper shows that Code actions require 30% fewer steps than JSON, which amounts to an equivalent reduction in the tokens generated. Since LLM calls are often the dimensioning cost of agent systems, it means your agent system runs are ~30% cheaper."
*   "Transformers Agents is the only library to make this format central!"

## リスクと課題

*   **LLMエンジンの依存**: 現在のソリューションはGPT-4oに依存しており、ファインチューニングされたオープンソースモデルを使用することで、パースエラーの削減やスコアの向上が期待されます。
*   **マルチエージェントオーケストレーションの素朴さ**: 現在のマルチエージェント構成は「素朴な」方法であり、よりシームレスなオーケストレーションの改善の余地があります。
*   **Webブラウザツールの制限**: 現在のWebブラウザツールはJavaScriptのロードやクッキーバナーの処理に対応しておらず、一部のウェブページにアクセスできない可能性があります。Seleniumなどの導入で改善が見込まれます。
*   **プランニング戦略の最適化**: 現在のプランニング戦略は比較的シンプルであり、他の文献からのオプションや新しいコンポーネントを試すことで、さらなる性能向上が期待されます。

## 今後の見通し/アクション

Hugging FaceはTransformers Agents（現在はsmolagents）の継続的な改善を計画しており、以下の分野に注力します。

*   **LLMエンジンの強化**: ファインチューニングされたオープンソースモデルの活用により、パースエラーを削減し、スコアを向上させることを目指します。
*   **マルチエージェントオーケストレーションの洗練**: よりシームレスで高度なマルチエージェント連携の実現に向けて開発を進めます。
*   **Webブラウザツールの機能拡張**: Seleniumパッケージの導入により、JavaScriptのロードやクッキーバナーの処理に対応し、アクセス可能なウェブページの範囲を広げます。
*   **プランニング機能の深化**: 文献からの多様なプランニング戦略や新しいコンポーネントを評価し、エージェントの計画能力をさらに向上させます。

Code actionsがエージェントのアクション記述の標準となる可能性を強く示唆しており、Hugging Faceは引き続きこの分野でリーダーシップを発揮していく方針です。

## Source URL（必須）

https://huggingface.co/blog/beating-gaia
