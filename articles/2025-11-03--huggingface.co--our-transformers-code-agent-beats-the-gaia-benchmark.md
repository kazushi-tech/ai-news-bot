---
title: "Our Transformers Code Agent beats the GAIA benchmark 🏅"
title_ja: "Transformers Code Agent、難関GAIAベンチマークでトップに"
source_url: "https://huggingface.co/blog/beating-gaia"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging FaceのTransformers Agentsライブラリで構築されたCode Agentが、最も困難で包括的なエージェントベンチマークであるGAIAでトップの成績を収めました。この成果は、エージェントのアクションをコードで表現する「Code actions」の優位性を示しており、Transformers Agents（現在はsmolagentsとして独立）がこのアプローチを中核に据える唯一のライブラリであることを強調しています。

## 重要ポイント

*   **GAIAベンチマークでのトップ成績**: Transformers Code AgentがGAIA検証セットで44.2%のスコアを獲得し、既存のトップソリューション（Autogenベースの40%）を上回りました。テストセットでは33.3%で2位ですが、特に難易度の高いレベル3問題では最高の平均スコアを記録しました。
*   **Code Agentの優位性**: エージェントのアクションをJSONのような辞書形式ではなくPythonコードで表現する「Code actions」が、複雑なアクションシーケンスの簡潔性、ステップ数とトークン生成量の30%削減、コスト効率、変数の格納容易性、ログの可読性、そしてベンチマーク性能向上に寄与することが実証されました。
*   **安全なコード実行環境**: LLMが生成するコードの安全性を確保するため、明示的に許可された操作のみを実行するゼロからのPythonインタープリタを開発しました。これにより、悪意のあるコードや無限ループ、コンテキスト長オーバーフローを防ぎます。
*   **マルチエージェントとプランニング**: 素朴ながら効果的なマルチエージェントオーケストレーション（ReactCodeAgentがWeb検索エージェントをツールとして利用）と、Nステップごとに事実の要約と計画を生成するプランニングコンポーネントを導入しました。特に、以前の計画をLLMの入力から除外することで、パフォーマンスが向上する興味深い発見がありました。

## 詳細レポート

**What happened:**
Hugging Faceの研究チームは、Transformers Agentsライブラリを用いて開発したCode Agentを、エージェントシステムの能力を測る最も困難なベンチマークであるGAIAに適用しました。その結果、検証セットで44.2%のスコアを達成し、GAIAの公開リーダーボードでトップに躍り出ました。テストセットでは33.3%で2位となりましたが、特に難易度の高いレベル3問題では最高の平均スコアを記録しました。

**背景:**
エージェントとは、LLMを基盤とし、外部ツールを呼び出し、LLMの出力に基づいて実行パス（グラフ構造）を動的に変更できるシステムです。GAIAベンチマークは、複数の情報源からのデータ収集、マルチモーダルな理解、複雑な推論、厳密な出力形式といった、LLMベースのエージェントが苦手とする領域を試すために設計されています。例えば、特定の絵画に描かれた果物を特定し、それが特定の船の朝食メニューに含まれていたかを調べ、指定された順序と形式で回答するといった多段階のタスクが含まれます。既存のソリューションでは、GPT-4-Turboが7%未満、Autogenベースの複雑なマルチエージェントシステムが40%のスコアでした。

**技術:**
*   **Code Agentの採用**: Wang et al. (2024)の研究に基づき、エージェントのアクションをPythonコードで表現する「Code Agent」を採用しました。これにより、JSON形式と比較して、アクションの簡潔性、ステップ数の30%削減、トークン生成量の削減、コスト効率の向上、変数の格納容易性、ログの可読性、そしてLLMがコード生成に慣れていることによる性能向上が得られました。
*   **安全なコードインタープリタ**: LLMが生成するコードの安全な実行のため、`ast`モジュールを利用し、明示的に許可された操作（インポート、関数呼び出しなど）のみを実行するゼロからのPythonインタープリタを構築しました。無限ループ防止のための操作回数制限や、コンテキスト長オーバーフロー防止のためのprint出力行数制限も実装されています。
*   **ツール**: Autogenチームがオープンソース化したMarkdown Webブラウザとファイルインスペクターを再利用しました。Code AgentはPythonコードを生成・実行するため、別途コードインタープリタは不要です。
*   **マルチエージェントオーケストレーション**: トップレベルのReactCodeAgentが、`file_inspector`、`visualizer`、そしてWeb検索エージェントをラップした`search_agent`といったツールにアクセスします。Web検索エージェント自体はJSONエージェントであり、Webブラウジングツール（`informational_web_search`、`page_down`、`find_in_page`など）を利用します。
*   **プランニングコンポーネント**: Nステップごとに「既知の事実と発見すべき事実の要約」と「ステップバイステップの計画」を生成するシンプルなプランニング戦略を採用しました。以前の計画をLLMの入力から除外することで、LLMが既存の計画に偏るのを防ぎ、より良い結果を得られることが分かりました。

**影響/データ:**
| ベンチマーク | スコア | 順位 | 備考 |
| :----------- | :----- | :--- | :--- |
| GAIA 検証セット | 44.2% | 1位 | 2位より4ポイント上 |
| GAIA テストセット | 33.3% | 2位 | Microsoft Autogenより上位 |
| GAIA レベル3問題 | 最高平均スコア | 1位 | ハードコア問題 |

この結果は、Code actionsがJSON/OAI形式に代わるエージェントアクションの標準となる可能性を示唆しています。Transformers Agentsは、このCode actionsを中核に据える唯一のライブラリです。

**関係者:**
*   **Hugging Face**: Transformers Agents (現smolagents) の開発元であり、Code AgentをGAIAベンチマークで成功させた主体。
*   **Autogenチーム (Microsoft)**: Webブラウザツールやファイルインスペクターツールをオープンソース化し、Hugging Faceの開発を加速させた。GAIAベンチマークの既存トップソリューションの一つを提供。
*   **OpenAI**: 評価に使用された基盤LLMであるGPT-4oを提供。

## 引用（Notable quotes）

*   "an agent is any system based on an LLM that can call external tools or not, depending on the need for the current use case and iterate on further steps based on the LLM output."
*   "Solving this requires both high-level planning abilities and rigorous execution, which are precisely two areas where LLMs struggle."
*   "Code actions are much more concise than JSON."
*   "Code actions require 30% fewer steps than JSON, which amounts to an equivalent reduction in the tokens generated."
*   "Transformers Agents is the only library to make this format central!"

## リスクと課題

*   **LLM生成コードの安全性**: LLMが生成するコードは、ガードレールなしで実行すると危険な可能性があるため、安全な実行環境の構築が不可欠です。
*   **Webブラウザツールの限界**: 現在のWebブラウザツールはJavaScriptのロードやCookieバナーの処理に対応しておらず、一部のWebページにアクセスできない可能性があります。
*   **マルチエージェントオーケストレーションの素朴さ**: 現在のマルチエージェントの連携方法は「素朴」であり、よりシームレスなオーケストレーションによってさらなる改善の余地があります。
*   **LLMの計画への偏り**: LLMはプロンプト内の関連情報に強く偏る傾向があるため、以前の計画が入力に含まれると、LLMが再評価せずに既存の計画を再利用してしまうリスクがあります。

## 今後の見通し/アクション

Hugging Faceは、Transformers Agentsのさらなる改善に向けて以下の計画を進めています。

*   **LLMエンジンの改善**: 現在GPT-4oを使用していますが、ファインチューニングされたオープンソースモデルを使用することで、解析エラーを減らし、スコアを向上させる可能性を探ります。
*   **マルチエージェントオーケストレーションの強化**: よりシームレスなマルチエージェント連携を実装し、システムの効率と性能を向上させます。
*   **Webブラウザツールの改良**: Seleniumパッケージを導入し、JavaScriptのロードやCookieバナーの処理に対応することで、より多くのWebページにアクセスできるようにします。
*   **プランニングのさらなる改善**: 文献からの他のプランニング戦略を評価し、既存コンポーネントの代替実装や新しいコンポーネントを試すことで、最適なプランニング手法を追求します。

## Source URL
https://huggingface.co/blog/beating-gaia
