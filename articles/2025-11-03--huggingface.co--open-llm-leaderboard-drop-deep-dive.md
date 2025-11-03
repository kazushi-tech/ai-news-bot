---
title: "Open LLM Leaderboard: DROP deep dive"
title_ja: "Open LLM Leaderboard、DROPの異常スコアを深掘り調査"
source_url: "https://huggingface.co/blog/open-llm-leaderboard-drop"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Open LLM Leaderboardに追加されたDROPベンチマークで、ほとんどのモデルが異常に低いスコア（f1-score 10/100未満）を記録しました。詳細な調査の結果、スコアリングの正規化処理と、世代終了トークン（`.`）の使用に問題があることが判明。これらの問題により、モデルの実際の性能が正確に評価されていないことが明らかになりました。Hugging Faceは、修正版が開発されるまでDROPベンチマークをリーダーボードから一時的に削除することを決定しました。

## 重要ポイント

*   **異常なスコア傾向**: DROPベンチマークのf1-scoreが、他のベンチマークでのモデルの全体的な性能と相関せず、ほとんどのモデルで異常に低い値（10/100未満）に集中する傾向が見られました。
*   **正規化の問題**: 数値がスペース以外の空白文字（例: 改行）に続く場合、正しく数値として認識・正規化されず、正解と一致しないことが判明しました。
*   **世代終了トークンの問題**: 世代終了トークンとして使用される`.`が、以下の問題を引き起こしていました。
    *   浮動小数点数の回答が途中で切断され、一つも正しく評価されない。
    *   高品質なモデルが生成する長い回答（例: `Answer.\n\nPlausible prompt...`）が不必要に長く評価され、f1スコアを低下させる。
*   **暫定的な修正**: 世代終了トークンを`\n`に変更する暫定的な修正を試みたところ、DROPスコアが他のベンチマークの平均スコアと大幅に相関するようになりました。
*   **DROPの一時削除**: 完全な修正にはLM Eval HarnessにおけるDROP評価の新しい実装が必要であるため、Hugging FaceはリーダーボードからDROPベンチマークを一時的に削除することを決定しました。
*   **コミュニティの力**: コミュニティからの問題指摘と、EleutherAIおよびZenoチームとの協力が、今回の問題発見と調査に大きく貢献しました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Open LLM LeaderboardにDROP (Discrete Reasoning Over Paragraphs) ベンチマークが追加された際、圧倒的多数のモデルがf1-scoreで10/100未満という異常に低いスコアを記録しました。これは、モデルの全体的な性能（ARC、HellaSwag、TruthfulQA、MMLUの平均スコア）とDROPスコアの間に期待される相関が見られないことを意味しました。

**背景:**
DROPは、英語の段落から関連情報を抽出し、離散的な推論ステップ（ソートやカウントなど）を実行するモデルの能力を評価するベンチマークです。カスタムのf1およびExact Matchスコアを使用します。当初、モデルの全体的な性能が高いほどDROPスコアも高くなると予想されていましたが、一部のモデルを除き、ほとんどのモデルが非常に低いDROP f1-scoreに留まるという予期せぬ傾向が観察されました。

**原因と影響:**
調査の結果、主に以下の2つの問題が特定されました。

1.  **正規化処理の問題**:
    *   数値がスペース以外の空白文字（例: 改行 `\n`）に続く場合、スコアリングの正規化ステップで正しく数値として処理されませんでした。
    *   これにより、モデルが正しい数値を予測しても、正規化された正解（例: `10.0`）と正規化されたモデルの出力（例: `10 passage 2011.0 census recorded population of 1001360.0`）が一致せず、スコアが不当に低くなる問題が発生しました。

2.  **世代終了トークン（`.`）の使用問題**:
    *   **浮動小数点数の回答の切断**: 世代終了トークンとして`.`が使用されていたため、浮動小数点数（例: `12.25`）の回答が途中で切断され（例: `12`）、正しく評価されませんでした。調査対象モデルのいずれも浮動小数点数の回答を正しく得られませんでした。
    *   **高品質モデルのf1-score低下**: 高品質なモデルは、few-shotプロンプト形式に合わせようとして「`Answer.\n\nPlausible prompt for the next question.`」のような長い回答を生成する傾向がありました。しかし、最初の`.`で世代が停止するため、実際の回答の後に余分な単語が含まれ、f1-scoreが不当に低下していました。

**関係者:**
*   **Hugging Face**: Open LLM Leaderboardの運営者であり、今回の調査を主導しました。
*   **EleutherAI**: LM Eval Harnessの実装者であり、調査においてコードのガイダンスと支援を提供しました。
*   **Zeno**: 共同で詳細な結果分析を行い、世代終了トークンの問題を特定するのに貢献しました。
*   **コミュニティメンバー**: DROPスコアに関する問題を指摘し、調査のきっかけとなりました。

**データ:**
調査では、falcon-180B、mistral-7B（期待を下回るモデル）、Yi-34B、tigerbot-70B（期待通りの性能を示すモデル）、facebook/xglm-7.5B（中間のモデル）など、代表的な5つのモデルの結果が詳細に分析されました。

## 引用（Notable quotes）

*   「overwhelming majority of models scoring less than 10 out of 100 on their f1-score!」
*   「if a number is followed by any kind of whitespace other than a simple space, it will not pass through the number normalization, hence never match the gold if it is also a number!」
*   「Not a single model got a correct result on floating point answers」
*   「High quality models which generate long answers actually have a lower f1-score」
*   「the LM Eval Harness implementation follows the "official DROP" code very strictly: a new version of this benchmark’s evaluation thus needs to be developed!」
*   「We have therefore taken the decision to remove DROP from the Open LLM Leaderboard until a new version arises.」
*   「Here again the power of open-source, community and developping in the open-shines in that it allows to transparently investigate the root cause of an issue on a benchmark which has been out there for a couple of years.」

## リスクと課題

*   **再評価の膨大なコスト**: 全モデルのDROPベンチマークを再実行するには、GPU時間で8年相当という莫大なコストがかかります。失敗した例のみを再実行するとしても、50%以上の例を再実行する必要があり、これも膨大なGPU時間を要します。
*   **新しい実装の正確性**: 新しい評価実装を開発する際、それが確実に正しいことを検証し、同様の問題が再発しないようにする必要があります。
*   **LM Eval Harnessの変更**: 現在のLM Eval HarnessにおけるDROPの実装は「公式DROPコード」に厳密に従っているため、根本的な解決にはベンチマーク評価の新しいバージョンを開発する必要があります。
*   **コミュニティとの協力**: DROP評価のスコアリングと正規化を修正するためには、学術界とコミュニティの継続的な協力が不可欠です。

## 今後の見通し/アクション

*   **DROPの一時削除**: 新しい評価バージョンが開発され、実装されるまで、Open LLM LeaderboardからDROPベンチマークを一時的に削除します。
*   **新しい評価実装の開発**: EleutherAIチームと協力し、DROPベンチマークのスコアリングと正規化の問題を解決する新しい評価実装を開発します。
*   **コミュニティへの呼びかけ**: DROP評価の修正に関心のあるコミュニティメンバーや学術研究者に対し、協力とフィードバックを求め、共に解決策を見出すことを奨励します。
*   **再評価の計画**: 新しい実装が完成し、その正確性が確認された後、必要に応じてモデルの再評価を計画します。

## Source URL
https://huggingface.co/blog/open-llm-leaderboard-drop
