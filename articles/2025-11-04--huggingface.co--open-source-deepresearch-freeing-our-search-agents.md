---
title: "Open-source DeepResearch – Freeing our search agents"
title_ja: ""
source_url: "https://huggingface.co/blog/open-deep-research"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

OpenAIが発表した高性能なウェブブラウジングAIシステム「Deep Research」に対し、Hugging Faceは24時間以内のミッションでそのエージェントフレームワークをオープンソースで再現しました。OpenAIがフレームワークの詳細を非公開にしたため、Hugging Faceは「smolagents」ライブラリとコードベースのエージェントを活用し、GAIAベンチマークで55.15%のスコアを達成。これは従来のオープンソースSOTA（46%）を上回り、コードエージェントの優位性を示しました。今後はGUIエージェントの開発に注力し、オープンソースコミュニティの貢献を求めています。

## 重要ポイント

*   **OpenAI Deep Researchの発表**: OpenAIがウェブを閲覧しコンテンツを要約・質問に回答するシステム「Deep Research」を発表。GAIAベンチマークで67%近い正答率を達成。
*   **エージェントフレームワークの重要性**: LLM単体では困難な多段階推論やツール使用を可能にし、性能を劇的に向上させる。OpenAIはDeep Researchの基盤となるエージェントフレームワークの詳細を非公開。
*   **Hugging Faceによるオープンソース再現**: OpenAIの非公開を受け、Hugging Faceは24時間でDeep Researchのエージェントフレームワークをオープンソースで再現するミッションに着手。
*   **コードエージェントの採用**: アクションをコードで表現する「コードエージェント」を採用。JSONベースのエージェントと比較して、簡潔さ、コスト削減（約30%のトークン削減）、ツール再利用性、性能向上、状態管理の改善といった利点を確認。
*   **GAIAベンチマークでの成果**: Hugging Faceのオープンソースコードエージェントは、GAIA検証セットで55.15%のスコアを達成。これは従来のオープンソースSOTA（Magentic-Oneの46%）を上回り、JSONベースのエージェント（33%）を大きく凌駕。
*   **今後の展望**: より高度なウェブブラウザ（GUIエージェント）の開発、オープンモデルの性能探求、コミュニティからの貢献を呼びかけ。

## 詳細レポート

### What happened
OpenAIが「Deep Research」を発表し、その高性能なウェブブラウジングと質問応答能力が注目を集めました。特に、エージェントの包括的ベンチマークであるGAIAで高いスコアを記録しましたが、その基盤となるエージェントフレームワークの詳細は非公開でした。これに対し、Hugging Faceは24時間という短期間で、そのエージェントフレームワークをオープンソースで再現するプロジェクトを開始。結果として、GAIAベンチマークの検証セットで55.15%のスコアを達成し、従来のオープンソースSOTAを更新しました。

### 背景
*   **Deep Researchの登場**: OpenAIが発表したDeep Researchは、LLMと内部の「エージェントフレームワーク」を組み合わせ、ウェブ検索などのツールを使用し、アクションを段階的に整理することで、コンテンツの要約や質問応答を行うシステムです。
*   **GAIAベンチマークでの高性能**: Deep Researchは、多段階推論とツール使用を必要とするGAIAベンチマークで、平均67%近い正答率（レベル3の特に難しい問題では47.6%）を達成し、LLM単体（GPT-4で7%未満）を大きく上回る性能を示しました。
*   **エージェントフレームワークの非公開**: 強力なLLMがオープンソースで利用可能になる中、OpenAIはDeep Researchの核となるエージェントフレームワークの詳細を公開しませんでした。
*   **Hugging Faceの挑戦**: この状況を受け、Hugging Faceはオープンソースコミュニティのために、Deep Researchの成果を再現し、必要なフレームワークをオープンソース化する24時間ミッションを開始しました。

### 影響
*   **オープンソースエージェントの性能向上**: Hugging Faceの取り組みにより、オープンソースのエージェントシステムがGAIAベンチマークで大幅な性能向上を達成しました。
*   **コードエージェントの有効性の実証**: アクションをコードで表現するアプローチが、JSONベースのアプローチよりも優れていることが実証され、エージェントシステム設計の新たな方向性を示しました。
*   **コミュニティへの貢献**: オープンソースのフレームワークとツールを提供することで、誰もがDeep Researchのようなエージェントを構築・実行できる可能性が広がりました。

### 関係者
*   **OpenAI**: Deep Researchを開発・発表。
*   **Hugging Face**: Deep Researchのオープンソース再現プロジェクトを主導。
*   **GAIAベンチマーク**: エージェントシステムの評価に使用される包括的なベンチマーク。
*   **Microsoft Research (Magentic-One)**: Hugging Faceがツールの一部を流用したエージェントシステムを開発。
*   **コミュニティ貢献者**: dzhng, assafelovic, nickscamara, jina-ai, mshumerなど、Deep Researchの他のオープン実装に取り組む人々。

### データ
GAIAベンチマークにおける主要なエージェントシステムの性能比較:

| システム                     | GAIA検証セットスコア (平均) | 備考                                       |
| :--------------------------- | :-------------------------- | :----------------------------------------- |
| OpenAI Deep Research         | 67.36% (1-shot)             | レベル3は47.6%                             |
| Hugging Face (CodeAgent)     | 55.15%                      | 24時間+再現スプリントの成果                |
| Magentic-One                 | 46%                         | 従来のオープンフレームワークSOTA           |
| Hugging Face (JSON Agent)    | 33%                         | コードエージェントと同じ設定でJSONを使用 |
| GPT-4 (単体、エージェントなし) | < 7%                        |                                            |

## 引用（Notable quotes）

*   "The system is impressive and blew our minds when we tried it for the first time." (OpenAI Deep Researchの第一印象について)
*   "While powerful LLMs are now freely available in open-source... OpenAI didn’t disclose much about the agentic framework underlying Deep Research…" (OpenAIがフレームワークを非公開にしたことについて)
*   "So we decided to embark on a 24-hour mission to reproduce their results and open-source the needed framework along the way!" (Hugging Faceのミッションについて)
*   "Using an agentic framework bumps performance by up to 60 points!" (エージェントフレームワークの性能向上効果について)
*   "Indeed, when switching to a standard agent that writes actions in JSON instead of code, performance of the same setup is instantly degraded to 33% average on the validation set." (コードエージェントの優位性について)

## リスクと課題

*   **完全な再現の難しさ**: OpenAI Deep Researchの完全な性能（特にブラウザ操作など）をオープンソースで再現するには、まだ多くの改善が必要です。OpenAI Operatorのような高度なブラウザ使用とインタラクションは、現在のテキストベースのウェブインタラクションを超えています。
*   **ツールの改善**: 現在のウェブブラウザやテキストインスペクターはシンプルであり、読み取り可能なファイル形式の拡張、よりきめ細かいファイル処理、ビジョンベースのブラウザへの置き換えなど、ツールの性能向上が必要です。
*   **LLMの選択とチューニング**: エージェントをサポートするより良いオープンモデルの探求や、smolagentsフレームワーク自体のチューニングも課題です。

## 今後の見通し/アクション

*   **GUIエージェントの開発**: OpenAIのDeep ResearchがOperatorで導入された優れたウェブブラウザによって強化されていると推測されるため、Hugging Faceは次にGUIエージェント（画面を見てマウスやキーボードで直接操作できるエージェント）の開発に取り組む予定です。
*   **コミュニティへの貢献呼びかけ**: オープンソースのGUIエージェント開発プロジェクトへの貢献を広く呼びかけています。
*   **フルタイムエンジニアの採用**: このプロジェクトを加速させるため、フルタイムのエンジニアを募集しています。
*   **オープンソースDeep Researchの継続的な改善**: GAIAベンチマークでのオープンLLMの性能評価、ビジョンLMの使用、従来のツール呼び出しとコードネイティブエージェントの比較などを進めます。

## Source URL
https://huggingface.co/blog/open-deep-research
