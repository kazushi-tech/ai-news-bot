---
title: "Our Transformers Code Agent beats the GAIA benchmark 🏅"
title_ja: "Transformers Code Agent、最難関GAIAベンチマークで首位"
source_url: "https://huggingface.co/blog/beating-gaia"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
一流のテックニュース編集者として、Hugging Faceのブログ記事「Our Transformers Code Agent beats the GAIA benchmark 🏅」を以下の通り要約します。

---

## 概要 (TL;DR)
Hugging FaceのTransformers Agentsライブラリ（現在はsmolagentsにアップグレード）で構築されたCode Agentが、最も困難で包括的なエージェントベンチマークであるGAIAでトップの成績を収めました。この成果は、エージェントがアクションをコードで表現する「Code Agent」アプローチの優位性を示すもので、JSONベースのアプローチと比較して効率性とLLMのパフォーマンス向上に寄与します。

## 重要ポイント
*   **GAIAベンチマークでの最高スコア達成:** Hugging FaceのCode Agentが、エージェントにとって最も挑戦的なGAIAベンチマークの検証セットで44.2%を達成し、既存のトップソリューションを上回りました。
*   **Code Agentアプローチの優位性:** アクションをコードで表現するCode Agentは、JSON形式に比べ、アクションの簡潔性、ステップ数の30%削減、トークン生成量の削減、コスト効率の向上、LLMのコード生成能力の活用といった多くの利点を提供します。
*   **安全なコード実行環境:** LLMが生成するコードの安全性を確保するため、Hugging FaceはAST（抽象構文木）ベースで、明示的に許可された操作のみを実行する独自のLLMセーフなPythonインタープリターをゼロから構築しました。
*   **効果的なマルチエージェントオーケストレーションと計画:** マネージャーエージェントとWeb検索エージェントを組み合わせた素朴ながら効果的なマルチエージェントシステムと、定期的な事実の要約と計画生成を行う計画コンポーネントを導入し、複雑なタスク解決能力を向上させました。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging FaceのTransformers Agentsライブラリ（現在はsmolagents）を用いて開発されたCode Agentが、エージェントシステムの性能を測る最も包括的で困難なベンチマークであるGAIAにおいて、既存のトップソリューションを凌駕する結果を出しました。検証セットで44.2%のスコアを記録し1位を獲得、テストセットでは33.3%で2位となり、特に難易度の高いレベル3の問題では最高の平均スコアを達成しました。

**背景:**
GAIAベンチマークは、マルチモーダルな情報処理、複数の情報源からのデータ収集、複雑な推論、制約付きフォーマットでの回答など、LLMベースのエージェントシステムが直面する主要な課題を浮き彫りにするよう設計されています。従来のLLM（例: GPT-4-Turbo）はGAIAで7%未満のスコアしか出せず、以前のトップソリューションはAutogenベースの複雑なマルチエージェントシステムで40%でした。Hugging Faceは、エージェントがアクションをPythonコードで表現する「Code Agent」アプローチがこれらの課題を克服する鍵であると考え、その有効性をGAIAで検証しました。

**影響:**
今回の成果は、エージェントがアクションを記述する標準として、JSONやOpenAIのツール呼び出し形式に代わり、コード形式が主流となる可能性を示唆しています。コードアクションは、より直感的で効率的であり、LLMのトレーニングデータにコードが豊富に含まれているため、LLMがより流暢にアクションを表現できるという利点があります。Transformers Agentsは、このコードアクション形式を中核とする数少ないライブラリの一つとして、エージェント開発の新たな方向性を示しています。

**関係者:**
*   **Hugging Face:** Transformers Agents（現smolagents）の開発者であり、Code Agentを構築しGAIAベンチマークで最高スコアを達成。
*   **Autogenチーム:** Webブラウザツールやファイルインスペクターツールなど、開発プロセスを加速させたオープンソースツールを提供。
*   **OpenAI:** 評価に使用されたLLMエンジン（GPT-4o）を提供。

**データ:**

| ベンチマーク | ソリューション | スコア (検証セット) | スコア (テストセット) | レベル3平均スコア |
| :---------- | :------------- | :------------------ | :---------------- | :------------------ |
| GAIA        | Transformers Agent (ReactCodeAgent) | 44.2% (#1)          | 33.3% (#2)        | 最高                |
| GAIA        | Autogen-based solution | -                   | 40% (以前の#1)    | -                   |
| GAIA        | GPT-4-Turbo    | < 7%                | -                 | -                   |

*   コードアクションはJSONと比較して、平均で30%少ないステップ数で同等のタスクを完了し、トークン生成量の削減とコスト効率の向上に貢献します。

## 引用（Notable quotes）
*   "Transformers Agent’s ReactCodeAgent is now #1 overall, with 4 points above the second!"
*   "This is a data point to support that Code actions work better."
*   "Given their efficiency, we think Code actions will soon replace JSON/OAI format as the standard for agents writing their actions."

## リスクと課題
*   **LLM生成コードの安全性:** LLMが生成するコードは悪意のある、または意図しない動作を引き起こす可能性があるため、安全な実行環境の確保が不可欠です。Hugging FaceはASTベースのカスタムインタープリターでこれに対応していますが、継続的な監視と改善が必要です。
*   **Webブラウザツールの限界:** 現在のWebブラウザツールはMarkdown形式で情報を取得するため、JavaScriptのロードやクッキーバナーの処理に対応しておらず、一部のWebページへのアクセスが制限される可能性があります。
*   **マルチエージェントオーケストレーションの洗練:** 現在のマルチエージェントシステムは「素朴な」実装であり、よりシームレスで高度なオーケストレーションによってさらなる性能向上の余地があります。
*   **LLMエンジンの最適化:** 今回の成果はファインチューニングなしのGPT-4oで達成されましたが、ファインチューニングされたオープンソースモデルを使用することで、解析エラーを減らし、さらにスコアを向上させる可能性があります。

## 今後の見通し/アクション
Hugging FaceはTransformers Agents（smolagents）のさらなる改善に向けて、以下のステップを計画しています。
*   **LLMエンジンの強化:** ファインチューニングされたオープンソースモデルの導入を検討し、解析エラーの削減とスコア向上を目指します。
*   **マルチエージェントオーケストレーションの改善:** 現在の素朴な実装をよりシームレスで高度なものに進化させ、エージェント間の連携を強化します。
*   **Webブラウザツールの機能拡張:** Seleniumパッケージの導入により、JavaScriptのロードやクッキーバナーの処理に対応し、より多くのWebページへのアクセスを可能にします。
*   **計画コンポーネントの最適化:** 文献にある他の計画戦略を評価し、既存コンポーネントの代替実装や新しいコンポーネントの導入を通じて、計画能力をさらに向上させます。

## Source URL
https://huggingface.co/blog/beating-gaia
