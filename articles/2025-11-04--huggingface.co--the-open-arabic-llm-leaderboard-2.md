---
title: "The Open Arabic LLM Leaderboard 2"
title_ja: "アラビア語LLM評価の信頼性向上へ 「Open Arabic LLM Leaderboard 2」公開"
source_url: "https://huggingface.co/blog/leaderboard-arabic-v2"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、アラビア語大規模言語モデル（LLM）の評価を目的とした「Open Arabic LLM Leaderboard (OALL)」の第2版をリリースしました。この新バージョンは、従来のリーダーボードが抱えていた計算リソースの制約、結果の信頼性、翻訳タスクの不適切さ、ベンチマークの飽和といった課題に対処するため、ネイティブアラビア語の高品質なベンチマークを多数追加し、評価の透明性と信頼性を向上させています。特に、Retrieval Augmented Generation (RAG) 能力を評価するALRAGEベンチマークや、ネイティブMMLUなどが導入され、より現実世界のアラビア語使用状況に即したモデル性能の測定を目指しています。

## 重要ポイント

*   **OALL v2のリリース**: アラビア語LLMの評価を強化するため、Open Arabic LLM Leaderboardの第2版が公開されました。
*   **課題への対応**: 従来のリーダーボードやOALL v1の課題（リソース制約、結果の信頼性、翻訳タスクの不適切さ、ベンチマークの飽和、評価バグ）を解決。
*   **ネイティブベンチマークの重視**: 機械翻訳されたタスクを削除し、ネイティブアラビア語または人間がキュレーションした高品質なベンチマーク（Native Arabic MMLU, MedinaQA, AraTrust, ALRAGEなど）を多数追加。
*   **RAG評価の導入**: アラビア語におけるRAG能力を評価する初の包括的フレームワーク「ALRAGE」を導入し、LLM-as-judgeメトリックを使用。
*   **評価の改善**: UI/フィルターの改善、チャットテンプレートの導入、モデル提出数の制限（週5モデル/組織）により、公平性と多様性を確保。
*   **モデルランキングの変化**: 新しいベンチマークの導入により、OALL v1とv2でトップモデルのランキングに変化が見られ、Llama3.3-70B-instructが多くのカテゴリでリーダーに浮上。

## 詳細レポート

### What happened

Hugging Faceは、アラビア語LLMの評価プラットフォームである「Open Arabic LLM Leaderboard (OALL)」の第2版をリリースしました。これは、アラビア語LLMコミュニティからのフィードバックと、既存の評価ベンチマークの限界に対応するための大幅なアップデートです。

### 背景

アラビア語をサポートするLLMの増加に伴い、専用の評価リーダーボードの必要性が高まりました。しかし、従来のリーダーボードには以下の課題がありました。
*   **リソースの制約**: コミュニティメンバーが全てのオープンソースモデルを評価するための計算リソースが不足。
*   **結果の信頼性**: ユーザーが自己評価結果を提出する形式のため、結果の正確性や再現性を保証する仕組みが不足。
これらの課題に対処するため、2024年5月に2A2I、TII、HuggingFaceがOALLの初版を立ち上げ、短期間でアラビア語AIコミュニティの重要なプラットフォームとなりました（7ヶ月で46,000訪問者、700以上のモデル提出）。

しかし、OALL v1にも以下の課題が指摘されていました。
*   **アラビア語固有の評価の不足**: 多くのデータセットが非アラビア語圏由来で、翻訳されたタスクはアラビア語の複雑な文法、形態論、方言、文化的ニュアンスを捉えきれていなかった。
*   **ベンチマークの飽和**: 一部のベンチマークでモデルがほぼ満点を取り、性能向上の差別化が困難になった。
*   **評価バグ**: AlGhafaタスクにおいて、回答選択肢の検証方法にサイレントバグがあり、特に小型モデルのランキングに不公平な影響を与えていた。

これらの課題に対応するため、OALL v2では飽和したタスクや機械翻訳されたタスクを削除し、高品質なネイティブアラビア語ベンチマークを導入することで、より正確で現実世界に即した評価を目指しました。

### 影響

OALL v2の導入により、アラビア語LLMの評価はより客観的かつ包括的になりました。
*   **評価の質の向上**: ネイティブベンチマークの採用により、アラビア語の言語的・文化的特性をより正確に反映したモデル性能評価が可能に。
*   **モデルランキングの変動**: 新しい評価基準とデータセットにより、OALL v1と比較してモデルの相対的なランキングに変化が見られました。特にLlama3.3-70B-instructが多くのカテゴリでトップに浮上しています。
*   **コミュニティへの貢献**: 計算リソースの制約を緩和し、透明性の高い評価プラットフォームを提供することで、アラビア語LLMの研究開発コミュニティ全体の活性化が期待されます。

### 関係者

*   **HuggingFace**: リーダーボードのホスティングと開発。
*   **2A2I, TII**: OALL v1の立ち上げパートナー、評価バックエンドのインフラ提供。
*   **SDAIA, King Salman Global Academy for Arabic Language**: Balsam Indexの導入。
*   **Inception, MBZUAI**: AraGen Leaderboardの導入、Native Arabic MMLU, Human Translated MMLU (MMLU-HT), MedinaQAなどの新しいネイティブベンチマークの提供。
*   **Scale's Safety, Evaluations, and Alignment Lab (SEAL)**: 多言語リーダーボードの一部としてアラビア語リーダーボードを公開。
*   **Argilla**: ALRAGEベンチマークのデータセット検証に協力。
*   **Qwen2.5-72B-Instruct**: ALRAGEベンチマークにおけるLLM-as-judgeモデルとして使用。

### データ

OALL v2では、OALL v1から一部のベンチマークを保持しつつ、多数の新しいデータセットを追加しています。

**OALL v2におけるデータセットの概要**

| Datasets kept from OALL v1 | Datasets added for OALL v2       |
| :------------------------- | :------------------------------- |
| AlGhafa (6 tasks)          | Native Arabic MMLU (40 tasks)    |
| EXAMS                      | Human Translated MMLU (57 tasks) |
| Belebele (2 tasks)         | MedinaQA                         |
|                            | AraTrust                         |
|                            | ALRAGE                           |

*   **AlGhafa**: ネイティブアラビア語データセット（Facts-Balanced, SOCAL, XGLUE, Sentiment, Sentiment-Rating, Sentiment-Rating-No-Neutral）、MetaのBelebele（Arabic-MSA, Arabic-Dialects）、Arabic EXAMSベンチマークを保持。
*   **Native Arabic MMLU**: MBZUAIがリリースした、40タスク約15,000問の現代標準アラビア語（MSA）多肢選択問題。
*   **Human Translated MMLU (MMLU-HT)**: Inceptionがキュレーションした、オリジナル英語MMLUの人間翻訳版（57タスク）。
*   **MedinaQA**: MBZUAIがリリースした、アラビア語の文法と言語一般に焦点を当てたデータセット。
*   **AraTrust**: 安全性と真実性に関する522問の人間作成多肢選択問題。
*   **ALRAGE**: アラビア語Retrieval Augmented Generation (RAG) 能力を評価する包括的フレームワーク。40冊のアラビア語書籍からキュレーションされたデータセットを使用し、LLM-as-judgeメトリック（Qwen2.5-72B-Instruct）で評価。

**モデルのパフォーマンス比較**
*   OALL v1ではACVAとToxigenで飽和効果が見られたが、OALL v2のAraTrust, ALRAGE, Alghafaではモデルサイズに対する性能の分散がより顕著。
*   OALL v2と他のアラビア語リーダーボード（SEAL Arabic, AraGen）との相関が確認され、Llama3.3-70B-instructがOALL v2とAraGenで1位、SEALで3位。
*   OALL v1ではQwen2.5が強力なベースラインだったが、OALL v2ではQwen/Qwen2-72Bが最高の事前学習モデル、Llama3.3-70B-instructが全カテゴリでリーダーに。
*   AceGPTとJaisファミリーの比較では、一般的に大型モデルほど高スコアだが、Jais-family-30b-8kがJais-adapted-70bをOALL v2で上回る例外も。OALL v2の平均スコアはv1より高い傾向（7Bモデルを除く）。

## 引用（Notable quotes）

*   「This high cost in both time and compute power can become a major barrier to participation in further developing Arabic LLMs, making a leaderboard a valuable shared resource.」
*   「This lack of centralized verification could potentially undermine the credibility and fairness of the leaderboard.」
*   「The Arabic language presents unique challenges and characteristics that require specialized evaluation beyond what general NLP tasks can capture.」
*   「This shift ensures that evaluations are more authentic and better aligned with the realities of Arabic language use.」
*   「Our goal is to offer the community an objective evaluation of Arabic LLMs, aiding in the understanding of the strengths and weaknesses of each submitted model.」

## リスクと課題

*   **従来のリーダーボードの課題**: 計算リソースの不足と結果の信頼性検証メカニズムの欠如は、アラビア語LLM開発への参加障壁となっていた。
*   **OALL v1の課題**:
    *   非アラビア語圏由来の翻訳タスクがアラビア語の特性を捉えきれず、現実世界の使用例と乖離していた。
    *   一部ベンチマークの飽和により、モデルの性能向上を正確に測定・比較することが困難だった。
    *   AlGhafaタスクのサイレントバグは、評価の一貫性、公平性、均一性を損なっていた。
*   **今後の課題**: 数学、推論、ハルシネーション（幻覚）、および汎用・ドメイン固有の新たなアラビア語ベンチマークの不足が指摘されており、これら分野でのさらなるベンチマーク開発が求められています。

## 今後の見通し/アクション

*   OALL v2は、アラビア語LLMの客観的な評価を提供し、各モデルの強みと弱みをコミュニティが理解するのに役立つことを目指しています。
*   コミュニティからのさらなるモデル提出により、リーダーボードの規模が拡大することが期待されます。
*   将来的には、数学、推論、ハルシネーション、および汎用・ドメイン固有の新たなアラビア語ベンチマークのリリースが望まれています。

## Source URL
https://huggingface.co/blog/leaderboard-arabic-v2
