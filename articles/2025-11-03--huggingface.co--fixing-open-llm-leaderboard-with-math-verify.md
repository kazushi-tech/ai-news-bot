---
title: "Fixing Open LLM Leaderboard with Math-Verify"
title_ja: "Open LLM Leaderboard 数学評価をMath-Verifyで刷新、公平性向上"
source_url: "https://huggingface.co/blog/math_verify_leaderboard"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceのOpen LLM Leaderboardにおける数学評価（MATH-Hard）に深刻な問題があったことが判明し、新しい評価ツール「Math-Verify」が導入されました。これにより、過去に提出された全3,751モデルが再評価され、ランキングが大幅に変動。モデルの数学能力がより正確かつ公平に評価されるようになりました。

## 重要ポイント
*   **旧評価システムの問題点:** 特定の回答フォーマットへの依存、SymPy解析の不備、比較ロジックの限界により、多くのモデルの数学能力が過小評価されていました。
*   **Math-Verifyの導入:** これらの問題を解決する新評価ツール「Math-Verify」がわずか3行のコード変更で導入され、全モデルの再評価が行われました。
*   **スコアの大幅向上:** 全モデルの平均スコアが4.66ポイント向上し、特にAlgebraとPrealgebraのサブセットで大きな改善が見られました。
*   **モデルファミリーへの影響:** Qwenモデルのスコアは2倍以上に、DeepSeekモデルは3倍近くに急上昇するなど、特定のモデルファミリーの評価が劇的に改善しました。
*   **リーダーボードの再編:** MATH-HardリーダーボードではNvidiaのAceMathモデルがトップに浮上し、Qwen派生モデルがそれに続く形となり、トップ20が大きく入れ替わりました。全体リーダーボードでもQwen派生モデルの存在感が増し、多くのモデルが200位以上順位を上げました。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging FaceのOpen LLM Leaderboardにおける数学タスク「MATH-Hard」の評価システムが、新ツール「Math-Verify」に置き換えられ、過去に提出された全3,751モデルが再評価されました。この変更により、モデルの数学能力評価の正確性と公平性が大幅に向上し、リーダーボードのランキングが劇的に再編されました。

**背景:**
Open LLM Leaderboardは、LLMの性能を比較する上で最も広く利用されているプラットフォームの一つです。その中のMATH-Hardタスクは、Hendrycks MATHデータセットの最高難易度（レベル5）の1,324問を使用し、高校・大学レベルの数学問題を評価していました。
しかし、旧評価システムには以下の問題がありました。
1.  **回答フォーマットの厳格性:** モデルが「Final answer is [ANSWER]. I hope it is correct.」という特定のフォーマットに従わない場合、たとえ正解であっても誤りと判定されていました。
2.  **SymPy解析の限界:** 回答から[ANSWER]を抽出する際に使用されるSymPyパーサーが、数式、区間、行列、パーセンテージなど、様々な形式の回答を正しく解析できないケースがありました。
3.  **比較ロジックの不備:** 抽出された回答と正解を比較する際、数値の丸め、変数代入、行列や集合の等価性比較に対応しておらず、誤判定が生じていました。

**影響:**
*   **全モデルの再評価:** 2023年6月以降に提出された全3,751モデルがMath-Verifyによって再評価されました。
*   **スコアの平均向上:** 全モデルの平均スコアは4.66ポイント向上し、平均で61問多く正解する結果となりました。
*   **サブセットごとの改善:** 特にAlgebraとPrealgebraのサブセットで顕著な改善が見られ、それぞれ8.27ポイント、6.93ポイントのスコア増加を記録しました。これは、これらのサブセットで頻繁に出現するセットや行列形式の回答に対するMath-Verifyの処理能力向上によるものです。
*   **モデルファミリーのパフォーマンス向上:**
    *   Qwenモデルは、Math-Verify導入後、スコアが2倍以上に増加しました。
    *   DeepSeekモデルは、回答が`\boxed{}`表記で囲まれていることが多く、旧評価器では抽出できなかったため、スコアがほぼ3倍に急上昇しました。
*   **リーダーボードの再編:**
    *   MATH-Hardリーダーボードのトップ20は大幅に入れ替わり、NvidiaのAceMathモデルが首位を独占しました。Qwen派生モデルもAceMathに次ぐ上位に多数ランクインしました。
    *   全体リーダーボードでも、Qwen派生モデルの存在感がさらに増し、多くのモデルが200位以上順位を上げるなど、大きな変動が見られました。

**関係者:**
*   **Hugging Face:** Open LLM Leaderboardの運営者であり、Math-Verifyの開発・導入主体。
*   **Nvidia:** AceMathモデルの開発元で、MATH-Hardリーダーボードのトップを占める。
*   **Qwen:** Math-Verify導入によりスコアが大幅に向上したモデルファミリー。
*   **DeepSeek:** 同様にスコアが大幅に向上したモデルファミリー。

**データ:**
*   再評価されたモデル数: 3,751
*   全モデルの平均スコア向上: 4.66ポイント
*   平均正解問題数増加: 61問
*   Algebraサブセットのスコア向上: 8.27ポイント
*   Prealgebraサブセットのスコア向上: 6.93ポイント
*   Qwenモデルのスコア向上: 2倍以上
*   DeepSeekモデルのスコア向上: 3倍近く

## 引用（Notable quotes）
*   「On average, models solved 61 more problems across the board, equating to a 4.66-point increase across the board!」
*   「After the Math-Verify introduction, the scores more than doubled for these models, showcasing previous severe underestimation of performance.」 (Qwenモデルについて)
*   「After switching to Math-Verify, DeepSeek models almost tripled their scores!」
*   「the Top 20 rankings have undergone a significant shift, with Nvidia’s AceMath models now dominating the MATH-Hard leaderboard.」

## リスクと課題
*   **過去の評価の信頼性:** 旧評価システムの不備により、過去のMATH-Hard評価はモデルの真の数学能力を正確に反映していなかった可能性があり、これまでのランキングやモデル選択に影響を与えていた可能性があります。
*   **評価基準の進化:** LLMの能力向上に伴い、評価基準やツールも常に進化させる必要があり、現在のMath-Verifyも将来的に新たな課題に直面する可能性があります。
*   **コミュニティへの周知:** 新しい評価システムの導入とランキングの変動について、開発者や研究者コミュニティへの適切な周知と理解促進が重要です。

## 今後の見通し/アクション
*   Math-Verifyの導入により、Open LLM Leaderboardの数学評価の正確性と公平性が大幅に向上しました。
*   Hugging Faceは、すべての開発者や研究者に対し、自身の数学評価にMath-Verifyを採用することを推奨しています。これにより、より信頼性の高いモデル評価が可能になります。
*   ユーザーは、更新されたランキングを確認し、自身の関心のあるモデルのパフォーマンス変化を把握することが推奨されます。

## Source URL
https://huggingface.co/blog/math_verify_leaderboard
