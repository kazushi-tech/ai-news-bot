---
title: "Introducing the Open Arabic LLM Leaderboard"
title_ja: "**オープンアラビア語LLMリーダーボード始動 アラビア語LLMの性能評価を促進** (40文字)"
source_url: "https://huggingface.co/blog/leaderboard-arabic"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、アラビア語の大規模言語モデル（LLM）に特化した評価プラットフォーム「Open Arabic LLM Leaderboard (OALL)」を発表しました。これは、英語に偏重しがちなNLP分野において、3.8億人のアラビア語話者のニーズに応え、アラビア語LLMの研究開発を促進することを目的としています。多様なベンチマークデータセットと評価指標を用いて、モデルの性能を比較・評価し、コミュニティからのモデル提出と将来的な機能拡張を計画しています。

## 重要ポイント
*   **アラビア語LLMに特化:** 英語中心のNLP分野におけるギャップを埋めるため、アラビア語LLMの評価と比較に特化したリーダーボードを立ち上げ。
*   **多様なベンチマーク:** TII LLMチームによるAlGhafa、AceGPT論文からのACVAおよびAceGPTベンチマークなど、ネイティブおよび翻訳された広範なデータセットを使用。
*   **評価指標:** 主に正規化対数尤度精度（normalized log likelihood accuracy）を採用し、公平なモデル性能測定を実現。
*   **技術協力:** Technology Innovation Institute (TII) が計算リソースを提供し、Hugging Faceが評価フレームワークとリーダーボードテンプレートの統合・カスタマイズを支援。
*   **将来の拡張計画:** RAG評価用リーダーボード、チャットボットELOスコアアリーナ、OpenDolphinベンチマークの開発など、さらなる機能拡張を予定。
*   **コミュニティ貢献の促進:** モデル提出、ベンチマーク提案、議論への参加を通じて、アラビア語NLPコミュニティの活性化を奨励。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Open Arabic LLM Leaderboard (OALL) がHugging Faceによって発表され、アラビア語LLMの性能評価と比較のための専門プラットフォームが提供されました。

### 背景
自然言語処理（NLP）分野はこれまで英語に大きく偏重しており、アラビア語を含む他の言語のリソースに大きなギャップが存在していました。世界中に3.8億人以上のアラビア語話者がいるにもかかわらず、アラビア語LLMの評価と開発を促進するための専門的なベンチマークが不足していました。OALLはこのギャップを埋め、アラビア語LLMの進歩を加速させることを目指しています。

### 影響
OALLは、アラビア語のニュアンス、文化、遺産にきめ細かく対応したモデルやアプリケーションの開発を促進します。これにより、アラビア語話者向けのAI技術が向上し、グローバルなNLPエコシステムがより多様で包括的なものになることが期待されます。また、大規模かつ言語特化型のリーダーボードをデプロイした経験は、他の低リソース言語における同様の取り組みにも役立つと見込まれています。

### 関係者
*   **Hugging Face:** 新しい評価フレームワークとリーダーボードテンプレートの統合およびカスタマイズを支援。
*   **Technology Innovation Institute (TII):** 必要な計算リソースを惜しみなく提供し、アラビア語NLP分野におけるコミュニティ主導プロジェクトとオープンサイエンスの推進に貢献。OALLのバックエンドはTIIクラスターでローカル実行。
*   **Open Ko-LLM Leaderboard (Upstage):** OALL開発の貴重な参考資料およびインスピレーション源。
*   **コミュニティ:** モデル提出者、ベンチマーク提案者、議論参加者。

### データ
*   **ベンチマークデータセット:**
    *   **AlGhafa:** TII LLMチームが作成。読解、感情分析、質問応答など、幅広い能力を評価。11のネイティブアラビア語データセットと、英語NLPコミュニティで広く採用されている11のベンチマークの翻訳版を含む。
    *   **ACVAおよびAceGPT:** 論文「AceGPT, Localizing Large Language Models in Arabic」からの58データセット。MMLUおよびEXAMSベンチマークの翻訳版も特徴とし、広範な言語タスクをカバー。
*   **評価指標:**
    *   主に**正規化対数尤度精度（normalized log likelihood accuracy）**を使用。これは、多肢選択式およびYes/No形式の質問を含むタスクの性質に基づき、異なる種類の質問に対して明確かつ公平なモデル性能測定を提供するために選択されました。
*   **技術セットアップ:**
    *   **フロントエンド/バックエンド:** demo-leaderboardにインスパイアされており、バックエンドはTIIクラスターでローカル実行。
    *   **評価ライブラリ:** lightevalライブラリを使用。アラビア語ベンチマークの統合に大きく貢献し、アラビア語モデルの評価をすぐに利用できるようにしています。

## 引用（Notable quotes）
*   "The OALL aims to balance this by providing a platform specifically for evaluating and comparing the performance of Arabic Large Language Models (LLMs), thus promoting research and development in Arabic NLP."
*   "By enhancing the ability to accurately evaluate and improve Arabic LLMs, we hope the OALL will play a crucial role in developing models and applications that are finely tuned to the nuances of the Arabic language, culture and heritage."
*   "This focus will help bridge the gap in resources and research, traditionally dominated by English-centric models, enriching the global NLP landscape with more diverse and inclusive tools, which is crucial as AI technologies become increasingly integrated into everyday life around the world."

## リスクと課題
*   **モデル提出時の技術的課題:**
    *   モデルの精度がオリジナルと一致しない場合、評価はされるもののリーダーボードに適切に表示されない可能性がある。
    *   モデルやトークナイザーのロード失敗、公開設定の不備。
    *   モデルウェイトがSafetensors形式に変換されていない場合、Extended Viewerでパラメータ数が表示されない。
    *   オープンライセンスでないモデルや、モデルカードが不完全なモデルは受け付けられない。
    *   `use_remote_code=True` を必要とするモデルは現在サポートされていない（開発中）。
*   **英語中心のNLP研究からのギャップ:** アラビア語LLMの評価リソースが限られている現状を克服し、研究開発を促進する必要がある。

## 今後の見通し/アクション
*   **リーダーボードの拡張:**
    *   Retrieval Augmented Generation (RAG) シナリオにおけるアラビア語LLM評価用の追加リーダーボードを導入。
    *   ユーザーの好みに基づきアラビア語チャットボットのELOスコアを計算するチャットボットアリーナを設置。
*   **ベンチマークの拡張:**
    *   約50のデータセットを含むOpenDolphinベンチマークを開発し、Nagoudi et al.の「Dolphin: A Challenging and Diverse Benchmark for Arabic NLG」のオープンレプリケーションを目指す。
*   **コミュニティへの呼びかけ:**
    *   モデルの提出、新しいベンチマークの提案、議論への積極的な参加を奨励。
    *   現在のリーダーボードのトップモデルを活用し、ファインチューニングなどの技術で新しいモデルを作成することを推奨。
    *   OALLの技術セットアップと大規模な言語特化型リーダーボード展開の知見を、他の低リソース言語における同様のイニシアチブに役立てることを期待。
*   **モデル提出ガイドライン:**
    *   モデルの精度がオリジナルと一致していることを確認。
    *   `AutoConfig`, `AutoModel`, `AutoTokenizer` を使用してモデルとトークナイザーが正常にロードできるか事前確認。
    *   モデルが公開設定になっていることを確認。
    *   モデルウェイトをSafetensors形式に変換。
    *   モデルがオープンライセンスであり、詳細なモデルカードが記入されていることを確認。

## Source URL
https://huggingface.co/blog/leaderboard-arabic
