---
title: "Introducing the Open Ko-LLM Leaderboard: Leading the Korean LLM Evaluation Ecosystem"
title_ja: "Open Ko-LLM Leaderboard始動 韓国LLM評価エコシステムをリード"
source_url: "https://huggingface.co/blog/leaderboard-upstage"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Upstageは、韓国語LLMの評価エコシステムを構築するため、「Open Ko-LLM Leaderboard」を立ち上げました。公平性を確保するため、非公開の韓国語専用テストセットを採用し、5種類の評価タスクでモデルの性能を測定しています。立ち上げから5ヶ月で1,000以上のモデルが提出され、多様な参加者を集めていますが、大規模モデルの評価におけるインフラの課題や、既存リーダーボードの現実世界との乖離といった限界も認識しており、今後はより実用的な評価システムへの発展を目指しています。

## 重要ポイント
*   **Open Ko-LLM Leaderboardの立ち上げ**: Upstageが2023年9月に韓国語LLMの評価エコシステム構築を目指し開始。
*   **公平性のための設計**: 既存の英語ベースではなく韓国語データセットを採用し、テストセット汚染を防ぐため非公開の新規テストセットを使用。
*   **多様な評価タスク**: Ko-ARC、Ko-HellaSwag、Ko-MMLU、Ko-Truthful QA、Ko-CommonGEN V2の5種類で多角的に評価。
*   **活発な参加**: 5ヶ月で1,000以上のモデルが提出され、企業、研究機関、個人など多様な参加者が集結。
*   **注目モデル**: KTのMi:dm 7Bが7B以下のモデルでトップに立ち、公開された。UpstageのSOLARやLLaMa2/Yi/Mistralベースのファインチューニングモデルも好成績。
*   **インフラ課題**: 16基のA100 80GB GPUインフラでは、30B以上の大規模モデルの評価に計算リソースが不足し、処理遅延が発生。
*   **リーダーボードの限界認識**: データ陳腐化、現実世界との乖離、テストセットへの過学習といった現在の評価システムの課題を認識。
*   **今後の展望**: 現実世界のユースケースと相関性の高いベンチマークの導入、継続的な更新、オンライン環境での評価重視により、実用的な評価プラットフォームを目指す。
*   **強力なパートナーシップ**: NIA、KT、Korea University、Hugging Faceとの連携により、リーダーボードの信頼性と権威を確立。

## 詳細レポート
### What happened
2023年9月、Upstageは韓国語LLMの評価エコシステムを構築するため、「Open Ko-LLM Leaderboard」を立ち上げました。これは、Hugging FaceのNLP民主化やUpstageの生成AIエコシステム構築といった業界の動きに触発されたものです。研究者が結果を共有し、才能を発掘できる透明性の高いプラットフォームを提供し、韓国語LLMの競争領域を拡大することを目標としています。

### 背景
LLMの急速な進化の中で「エコシステム」の構築が重要視されており、Upstageはグローバルなオープンかつ協調的なAI開発の動きに合わせ、韓国語LLMデータに特化した評価エコシステムの必要性を感じ、本リーダーボードを開発しました。韓国語のユニークな特性と文化を捉えるため、Ko-MMLUなどのベンチマークデータセットも韓国語の特性を反映するように翻訳・調整されています。

### 影響
*   **参加の活発化**: 立ち上げからわずか5ヶ月で1,000以上のモデルが提出され、韓国語LLM開発への高い関心が示されました。これは、英語のOpen LLM Leaderboardの約4分の1に相当する規模です。
*   **多様な参加者**: KT、Lotte Information & Communication、Yanolja、MegaStudy Maum AI、42Maru、ETRI、KAIST、Korea Universityなど、個人研究者から企業、学術機関まで幅広い参加が見られます。
*   **注目モデル**: KTのMi:dm 7Bモデルは、7Bパラメータ以下のモデルでトップに立ち、一般公開されました。UpstageのSOLARのようなクロスリンガル転移モデルや、LLaMa2、Yi、Mistralなどの強力な基盤モデルをファインチューニングしたモデルが優れた性能を示しています。
*   **インフラの課題**: 16基のA100 80GB GPUを基盤とするインフラでは、30B以上の大規模モデルの評価に過剰な計算リソースが必要となり、多くの提出モデルが保留状態になるという課題に直面しています。

### 関係者
*   **主催・開発**: Upstage
*   **主要パートナー**:
    *   National Information Society Agency (NIA): 韓国の主要国家機関、韓国式リーダーボード開発で協力。
    *   Korea Telecom (KT): GPUリソースの提供、Mi:dm 7Bモデルの公開。
    *   Korea University (Heuiseok Lim教授研究チーム): KoCommonGen V2の組み込みで協力。
    *   Hugging Face: 継続的なサポート、直接的な連携。
*   **参加企業・機関**: KT, Lotte Information & Communication, Yanolja, MegaStudy Maum AI, 42Maru, Electronics and Telecommunications Research Institute (ETRI), KAIST, Korea University (参加モデル提供)

### データ
**リーダーボード設計の選択**:
*   既存の英語ベースのベンチマークではなく、韓国語データセットを採用。
*   テストセット汚染を防ぎ、公平な比較を保証するため、完全に新しい非公開のテストセットを構築。

**評価タスク**:
Open Ko-LLM Leaderboardは以下の5種類の評価方法を採用しています。

| 評価タスク名       | 目的                                                                                              | 評価形式     | 主要評価指標 |
| :----------------- | :------------------------------------------------------------------------------------------------ | :----------- | :----------- |
| **Ko-ARC**         | 科学的思考と理解、複雑な推論、問題解決能力を評価。                                                | 多肢選択     | 精度         |
| **Ko-HellaSwag**   | 状況理解と予測能力を評価。                                                                        | 生成または多肢選択 | 精度         |
| **Ko-MMLU**        | 広範なトピックと言語理解の深さ、多様性を評価。                                                    | 多肢選択     | 全体およびドメイン別精度 |
| **Ko-Truthful QA** | モデルの真実性と事実の正確性を評価。                                                              | 多肢選択     | 精度         |
| **Ko-CommonGEN V2**| 韓国語の常識に基づいた、文脈的・文化的に適切な出力生成能力を評価（新規ベンチマーク）。 | 生成         | -            |

## 引用（Notable quotes）
*   "Our goal was to quickly develop and introduce an evaluation ecosystem for Korean LLM data, aligning with the global movement towards open and collaborative AI development."
    （私たちの目標は、オープンで協調的なAI開発に向けた世界的な動きに合わせ、韓国語LLMデータのための評価エコシステムを迅速に開発し導入することでした。）
*   "We're striving to expand the playing field for Korean LLMs."
    （私たちは韓国語LLMの活躍の場を広げるよう努めています。）
*   "The decision to maintain a closed test set environment was made with the intention of fostering a more controlled and fair comparative analysis."
    （非公開のテストセット環境を維持するという決定は、より管理され公平な比較分析を促進する意図で行われました。）
*   "We believe that evaluations in a real online environment, as opposed to benchmark-based evaluations, are highly meaningful."
    （ベンチマークベースの評価とは対照的に、実際のオンライン環境での評価は非常に有意義であると信じています。）

## リスクと課題
*   **データ陳腐化**: SQUADやKLEUのような既存のデータセットは時間とともに陳腐化し、日々生成される新しいデータポイントを反映できない。
*   **現実世界との乖離**: B2B/B2Cサービスで発生するユーザーや業界からのデータ、エッジケースや外れ値への対応能力を現在のリーダーボードシステムは測定できない。
*   **競争の意義の疑問**: 多くのモデルがテストセットで良い成績を出すために特化してチューニングされ、テストセット内での過学習につながる可能性がある。リーダーボードが現実世界中心ではなく、リーダーボード中心に機能している。
*   **インフラの制約**: 16基のA100 80GB GPUという現在のインフラでは、30B以上の大規模モデルの評価に必要な計算リソースが不足し、提出モデルの処理が長期化する。

## 今後の見通し/アクション
*   **リーダーボードの発展**: 上記の課題に対処するため、リーダーボードをさらに発展させ、広く認知される信頼できるリソースとすることを目指します。
*   **現実世界との相関性強化**: 現実世界のユースケースと強い相関性を持つ多様なベンチマークを組み込むことで、リーダーボードの関連性を高め、ビジネスに真に役立つものにします。
*   **学術と実用化の橋渡し**: 学術研究と実用化のギャップを埋めることを目指し、研究コミュニティと業界の実務家からのフィードバックを通じて、ベンチマークを継続的に更新・強化します。
*   **データセット開発者との連携**: データセット開発者との協力を歓迎し、chanjun.park@upstage.ai または contact@upstage.ai で連絡を受け付けています。
*   **オンライン環境での評価**: ベンチマークベースの評価だけでなく、実際のオンライン環境での評価が非常に有意義であると考えており、そのような取り組みを奨励します。
*   **ベンチマークの更新**: ベンチマークの月次更新や、ドメイン固有の側面をより具体的に評価するベンチマークの必要性を提唱します。

## Source URL
https://huggingface.co/blog/leaderboard-upstage
