---
title: "Fixing Open LLM Leaderboard with Math-Verify"
title_ja: "Open LLM Leaderboard 数学評価をMath-Verifyで再構築、順位激変"
source_url: "https://huggingface.co/blog/math_verify_leaderboard"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceのOpen LLM Leaderboardにおける数学問題評価（MATH-Hard）に複数の不正確な点があったため、新しい評価ツール「Math-Verify」を導入し、3,751の全モデルを再評価しました。これにより、モデルの数学能力評価の精度と公平性が大幅に向上し、リーダーボードの順位が大きく変動しました。特にQwenやDeepSeekモデルのスコアが大幅に改善され、Nvidia AceMathモデルがMATH-Hardリーダーボードのトップを占めています。

## 重要ポイント
*   **旧評価システムの欠陥:** 従来の数学評価は、モデルの回答形式不遵守、SymPyパーサーの制限、比較ロジックの不備により、多くのモデルの数学能力を過小評価していました。
*   **Math-Verifyの導入:** これらの問題を解決するため、より堅牢な「Math-Verify」評価ツールが導入されました。コードの変更はわずか3行で済みました。
*   **全モデルの再評価:** Open LLM Leaderboardに提出された全3,751モデルがMath-Verifyを用いて再評価されました。
*   **スコアの大幅な向上:** モデルは平均で4.66ポイント（61問）スコアが向上しました。特に代数関連のサブセットで顕著な改善が見られました。
*   **リーダーボードの再編:** MATH-Hardリーダーボードのトップ20が完全に再編され、Nvidia AceMathモデルが上位を独占。QwenモデルやDeepSeekモデルも大幅に順位を上げました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、Open LLM Leaderboardの数学評価（MATH-Hard）における既存の課題を解決するため、新しい評価ツール「Math-Verify」を導入し、過去に提出された全3,751モデルの数学能力を再評価しました。この変更により、モデルの数学性能の評価がより正確になり、リーダーボードの順位に大きな変動が生じました。

**背景:**
Open LLM LeaderboardのMATH-Hardタスクは、Hendrycks MATHデータセットの高校・大学レベルの数学問題（難易度レベル5、1,324問）を使用し、5-shot方式で評価を行っていました。しかし、従来の評価システムには以下の問題点がありました。
1.  **回答形式の厳格性:** モデルが「Final answer is [ANSWER]. I hope it is correct.」という特定の回答形式に従わない場合、たとえ正解であっても誤りとして扱われていました。
2.  **SymPy解析の限界:** 回答の[ANSWER]部分をSymPyでシンボリック表現に変換する際、パラメトリック方程式、区間、行列、特定のLaTeX表記など、複雑な数学的表現の解析に失敗することがありました。
3.  **比較ロジックの不備:** 抽出された回答と正解の比較において、数値の丸め、数値評価、変数代入、行列や集合の等価性などがサポートされておらず、誤った判定が下されることがありました。
これらの問題により、多くのモデルの真の数学能力が過小評価されていることがユーザーから報告されていました。

**影響:**
*   **平均スコアの向上:** 再評価の結果、モデルは平均で61問多く正解し、全体で4.66ポイントのスコア増加を記録しました。
*   **サブセットごとの改善:** 特に代数関連のサブセット（AlgebraとPrealgebra）でそれぞれ8.27ポイント、6.93ポイントと最も顕著な改善が見られ、一部のモデルでは90ポイント近くスコアが向上しました。これは、Math-Verifyが集合や行列形式の回答処理を強化したためと考えられます。
*   **モデルファミリーの評価変化:**
    *   **Qwenモデル:** 以前は自己申告の性能に比べてスコアが異常に低かったQwenモデルは、Math-Verify導入後、スコアが2倍以上に増加し、以前の深刻な過小評価が明らかになりました。
    *   **DeepSeekモデル:** DeepSeekモデルもスコアが約3倍に増加しました。これは、旧評価器が抽出できなかった`\boxed{}`表記で回答を囲む傾向があったためです。
*   **MATH-Hardリーダーボードの再編:** トップ20の順位が大きく変動し、NvidiaのAceMathモデルがMATH-Hardリーダーボードを支配する結果となりました。Qwen派生モデルもAceMathに次ぐ位置に多数ランクインしました。
*   **全体リーダーボードへの影響:** 全体的なリーダーボードでもトップ4は変わらないものの、Qwen派生モデルのMATHサブセットでの躍進により、トップ20におけるQwenモデルの存在感がさらに増しました。多くのモデルが200位以上順位を上げるなど、全体的に大きな変動がありました。

**関係者:**
*   **Hugging Face:** Open LLM Leaderboardの運営者であり、Math-Verifyの開発・導入を主導。
*   **LLM開発者:** Qwen、DeepSeek、Nvidia AceMathなど、リーダーボードにモデルを提出している各社。
*   **ユーザー:** 評価システムの課題を報告し、改善を促したコミュニティメンバー。

**データ:**
*   再評価されたモデル総数: 3,751
*   MATH-Hardタスクの問題数: 1,324 (Hendrycks MATHデータセット Level 5)
*   全モデルの平均スコア向上: 4.66ポイント
*   Algebraサブセットの平均スコア向上: 8.27ポイント
*   Prealgebraサブセットの平均スコア向上: 6.93ポイント
*   Qwenモデルのスコア増加率: 2倍以上
*   DeepSeekモデルのスコア増加率: 約3倍

**MATH-Hard Leaderboardの変更 (新トップ20)**

| Old Rank | New Rank | Model Name                                     |
| :------- | :------- | :--------------------------------------------- |
| 1        | 1        | NVIDIA/AceMath-8B                              |
| 2        | 2        | NVIDIA/AceMath-7B                              |
| 3        | 3        | NVIDIA/AceMath-13B                             |
| 4        | 4        | NVIDIA/AceMath-34B                             |
| 29       | 5        | deepseek-ai/deepseek-math-7b-instruct          |
| 30       | 6        | deepseek-ai/deepseek-math-7b-base              |
| 31       | 7        | deepseek-ai/deepseek-math-7b-instruct-v1.5     |
| 32       | 8        | deepseek-ai/deepseek-math-7b-base-v1.5         |
| 33       | 9        | deepseek-ai/deepseek-math-7b-instruct-v1.5-hf  |
| 34       | 10       | deepseek-ai/deepseek-math-7b-base-v1.5-hf      |
| 5        | 11       | Qwen/Qwen1.5-72B-Chat                          |
| 6        | 12       | Qwen/Qwen1.5-72B                               |
| 7        | 13       | Qwen/Qwen1.5-32B-Chat                          |
| 8        | 14       | Qwen/Qwen1.5-32B                               |
| 9        | 15       | Qwen/Qwen1.5-14B-Chat                          |
| 10       | 16       | Qwen/Qwen1.5-14B                               |
| 11       | 17       | Qwen/Qwen1.5-7B-Chat                           |
| 12       | 18       | Qwen/Qwen1.5-7B                                |
| 13       | 19       | Qwen/Qwen1.5-4B-Chat                           |
| 14       | 20       | Qwen/Qwen1.5-4B                                |

## 引用（Notable quotes）
*   「On average, models solved 61 more problems across the board, equating to a 4.66-point increase across the board!」
*   「After the Math-Verify introduction, the scores more than doubled for these models, showcasing previous severe underestimation of performance.」
*   「After switching to Math-Verify, DeepSeek models almost tripled their scores!」

## リスクと課題
*   **過去の評価の不正確性:** 従来の評価システムがモデルの数学能力を過小評価していたため、過去のリーダーボードのデータはモデルの真の性能を反映していない可能性があります。
*   **評価の複雑性:** 数学問題の評価は、多様な回答形式、シンボリック表現、数値的な比較など、本質的に複雑であり、今後も新たな課題が生じる可能性があります。
*   **モデルの適応:** 特定の評価形式に最適化されたモデルが存在する可能性があり、評価ツールの変更がモデル開発の方向性に影響を与える可能性があります。

## 今後の見通し/アクション
*   Math-Verifyの導入により、Open LLM Leaderboardにおける数学評価の精度と公平性が大幅に向上し、より信頼性の高いモデル比較が可能になりました。
*   Hugging Faceは、LLM開発者や研究者に対し、自身の数学評価にMath-Verifyを採用することを推奨しています。
*   ユーザーは、更新されたOpen LLM Leaderboardで、お気に入りのモデルの性能変化を確認することが奨励されています。

## Source URL
https://huggingface.co/blog/math_verify_leaderboard
