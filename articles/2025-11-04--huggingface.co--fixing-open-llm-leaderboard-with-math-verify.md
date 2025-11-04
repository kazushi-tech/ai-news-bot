---
title: "Fixing Open LLM Leaderboard with Math-Verify"
title_ja: "Open LLM Leaderboard、Math-Verifyで数学評価を公平に刷新"
source_url: "https://huggingface.co/blog/math_verify_leaderboard"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Open LLM Leaderboardにおける大規模言語モデル（LLM）の数学能力評価に存在した複数の問題を修正するため、新しい評価ツール「Math-Verify」を導入しました。これにより、3,751モデル全ての数学評価が再実施され、多くのモデルのスコアが大幅に向上し、特にMATH-Hardリーダーボードのランキングが劇的に再編成されました。

## 重要ポイント
*   **旧評価システムの問題点**: 以前の数学評価は、モデルの回答フォーマット不遵守、SymPyによる回答解析の失敗、および抽出された回答と正解の比較ロジックの不備（丸め、数値評価、変数代入、行列、集合比較の未サポート）により、モデルの真の数学能力を過小評価していました。
*   **Math-Verifyの導入**: これらの問題を解決するため、Hugging Faceは「Math-Verify」を導入し、わずか3行のコード変更で評価システムを刷新しました。
*   **スコアとランキングの劇的変化**: Math-Verifyによる再評価の結果、全モデルの平均スコアが4.66ポイント上昇し、特にAlgebraとPrealgebraサブセットで顕著な改善が見られました。MATH-Hardリーダーボードのトップ20は完全に再編成され、NvidiaのAceMathモデルが上位を独占し、QwenやDeepSeekなどのモデルも大幅にスコアを伸ばしました。
*   **公平性と正確性の向上**: Math-Verifyは、モデルの多様な回答形式や複雑な数学表現を正確に処理できるようになり、評価の公平性と正確性を大幅に向上させました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、Open LLM Leaderboardに提出された3,751モデル全ての数学評価を、新しく開発した「Math-Verify」ツールを用いて徹底的に再実施しました。これは、以前の数学評価システムが抱えていた複数の問題点を解決し、より公平で堅牢なモデル比較を実現するためです。

### 背景
Open LLM LeaderboardのMATH-Hardタスクは、高校・大学レベルの数学問題（Hendrycks MATHデータセットのLevel 5、1,324問）を用いてLLMの数学能力を評価していました。しかし、以下の問題により、モデルの真の能力が正確に反映されていませんでした。
1.  **回答フォーマットの厳格性**: モデルが特定の終了文字列（"Final answer is [ANSWER]. I hope it is correct."）に従わない場合、たとえ正解であっても誤りと判定されていました。
2.  **SymPy解析の限界**: 回答から[ANSWER]を抽出し、SymPyでシンボリック表現に変換する際に、LaTeX形式の境界、区間表記、パーセンテージ、行列などの表現が正しく解析できない問題がありました。
3.  **比較ロジックの不備**: 抽出された回答と正解を比較する際、丸め処理、数値評価、変数代入、行列の同等性、集合の比較などがサポートされておらず、論理的に正しい回答でも誤りと判定されるケースがありました。
これらの問題は特にQwenやDeepSeekといったモデルに影響し、彼らのスコアが不当に低く評価されていました。

### 影響
*   **平均スコアの向上**: 全モデルの平均スコアが4.66ポイント上昇し、平均で61問多く正解するようになりました。
*   **サブセットごとの改善**: 特にAlgebraとPrealgebraサブセットで顕著な改善が見られ、それぞれ8.27ポイント、6.93ポイントのスコア上昇を記録しました。これは、これらのサブセットが集合や行列形式の回答を多く含むため、Math-Verifyの処理能力向上によるものです。
*   **MATH-Hardリーダーボードの再編成**: トップ20のランキングが完全に刷新され、NvidiaのAceMathモデルがMATH-Hardリーダーボードを席巻しました。Qwen派生モデルも大幅に順位を上げ、AceMathに次ぐ位置を占めるようになりました。
*   **特定のモデルファミリーへの影響**: Qwenモデルのスコアは2倍以上に、DeepSeekモデルのスコアは3倍近くに増加し、以前の評価が彼らの性能を著しく過小評価していたことが明らかになりました。
*   **全体リーダーボードへの影響**: 全体リーダーボードでもトップ4は変わらないものの、それ以下の順位には大きな変動があり、Qwenモデルのトップ20における存在感が増しました。一部のモデルは200位以上順位を上げました。

### 関係者
*   **Hugging Face**: Open LLM Leaderboardの運営者であり、Math-Verifyの開発と導入を行いました。
*   **Qwen (Alibaba)**: 旧評価システムでスコアが過小評価されていた主要なモデルファミリーの一つ。
*   **DeepSeek (DeepSeek AI)**: Qwenと同様に、旧評価システムでスコアが過小評価されていた主要なモデルファミリーの一つ。
*   **Nvidia AceMath**: 新しい評価システムでMATH-Hardリーダーボードのトップを独占したモデル。

### データ
*   **再評価対象モデル数**: 3,751モデル
*   **全モデルの平均スコア上昇**: 4.66ポイント (平均61問多く正解)
*   **Algebraサブセットの平均スコア上昇**: 8.27ポイント
*   **Prealgebraサブセットの平均スコア上昇**: 6.93ポイント

## 引用（Notable quotes）
*   「Which model is the best at math? A complete reshuffling of cards thanks to fairer evaluations」
*   「scores more than doubled for these models, showcasing previous severe underestimation of performance.」

## リスクと課題
以前の評価システムは、モデルの真の数学能力を正確に測定できないという大きな課題を抱えていました。これは、特定の回答形式への過度な依存、数学的表現の多様性への対応不足、および比較ロジックの不備に起因していました。結果として、一部の高性能モデルが不当に低い評価を受け、リーダーボードの信頼性が損なわれるリスクがありました。Math-Verifyの導入により、これらの課題は解決されました。

## 今後の見通し/アクション
Math-Verifyの導入により、Open LLM LeaderboardにおけるLLMの数学能力評価の精度と公平性は大幅に向上しました。Hugging Faceは、開発者や研究者に対し、自身の数学評価にMath-Verifyを採用することを推奨しています。これにより、より信頼性の高いモデル評価結果を確保できるとしています。また、更新されたランキングを確認し、お気に入りのモデルの性能変化を探索することを推奨しています。

## Source URL
https://huggingface.co/blog/math_verify_leaderboard
