---
title: "Open LLM Leaderboard: DROP deep dive"
title_ja: "Open LLMリーダーボード DROPで低スコア続出、原因を深掘り"
source_url: "https://huggingface.co/blog/open-llm-leaderboard-drop"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging FaceのOpen LLM Leaderboardに追加されたDROPベンチマークで、ほとんどのモデルがF1スコア10/100未満という異常な低スコアを記録しました。詳細な調査の結果、数値正規化のバグと、世代終了トークンとして「.」（ピリオド）が不適切に使用されていたことが原因と判明。暫定的に世代終了トークンを「\n」（改行）に変更したところ、スコアの相関が大幅に改善されました。しかし、根本的な解決にはDROP評価の新しい実装が必要であると判断され、一時的にリーダーボードからDROPが削除されました。本件は、オープンソースコミュニティによる共同調査の重要性を示す事例となりました。

## 重要ポイント

*   **異常な低スコア**: Open LLM Leaderboardに追加されたDROPベンチマークで、大半のモデルがF1スコア10/100未満という予想外の低性能を示しました。
*   **原因1: 数値正規化のバグ**: 数値がスペース以外の空白文字（例: 改行）に続く場合、数値正規化が正しく行われず、正解と一致しない問題がありました。
*   **原因2: 世代終了トークンの問題**: 世代終了トークンとして「.」（ピリオド）が使用されていたため、浮動小数点数の回答が途中で切断されたり、高品質モデルが余分なテキストを生成してF1スコアが低下したりしていました。
*   **暫定的な修正**: 世代終了トークンを「\n」（改行）に変更してスコアを再計算したところ、DROPスコアが他のベンチマークの平均スコアと良好な相関を示すようになりました。
*   **リーダーボードからの削除**: 根本的な修正にはDROP評価の新しい実装が必要であるため、新しいバージョンが登場するまでOpen LLM LeaderboardからDROPを一時的に削除する決定が下されました。
*   **コミュニティの力**: 本件は、コミュニティによる共同調査がベンチマークの隠れたエラーを発見する上で非常に価値があることを示しました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

*   **What happened**: Open LLM LeaderboardにWinogrande、GSM8k、DROPの3つの新しいベンチマークが追加された際、DROPベンチマークにおいて、ほとんどのモデルがF1スコア10/100未満という異常な低スコアを記録しました。これは、モデルの全体的な性能を示す他のベンチマーク平均との相関が非常に低いという予期せぬ傾向を示していました。
*   **背景**: DROP (Discrete Reasoning Over Paragraphs) は、英語の段落から関連情報を抽出し、離散的な推論（例: アイテムのソートやカウント）を実行するモデルの能力を評価するベンチマークです。評価にはカスタムのF1スコアとExact Matchスコアが使用されます。当初、DROPスコアはモデルの全体的な性能と相関すると期待されていましたが、多くのモデルがF1スコア5前後で停滞する傾向が見られました。
*   **原因1（正規化の問題）**: 最初の調査で、正規化ステップが意図通りに機能していない可能性が浮上しました。特に、数値が単純なスペース以外の空白文字（例: 改行）に続く場合、数値正規化が正しく行われず、正解の数値と一致しないことが判明しました。これにより、モデルが正しい数値を生成していても、スコアが0になるケースが発生していました。
*   **原因2（世代終了トークンの問題）**: Zenoチームとの共同調査により、さらに深刻な問題が発見されました。
    *   浮動小数点数の回答が一つも正しく評価されていない。
    *   高品質なモデルほど長い回答を生成しようとするため、F1スコアが低くなる。
    これらの問題の根本原因は、世代終了トークンとして「.」（ピリオド）が使用されていたことでした。これにより、浮動小数点数が途中で切断されたり、モデルが「Answer\n\nPlausible prompt for the next question.」のようにプロンプト形式に合わせた余分なテキストを生成し、F1スコアが不当に低くなる事態が生じていました。
*   **影響**: これらの問題により、DROPベンチマークはモデルの真の推論能力を正確に評価できておらず、リーダーボード上のモデル性能ランキングに誤解を与えていました。
*   **関係者**:
    *   **Hugging Face**: Open LLM Leaderboardの運営者であり、問題の発見と調査を主導。
    *   **EleutherAI**: LM Eval Harnessの実装者であり、コードの調査とガイダンスを提供。
    *   **Zeno**: 共同調査に参加し、結果のより詳細な分析を実施。
    *   **コミュニティメンバー**: DROPスコアに関する問題を指摘し、調査のきっかけを提供。
*   **データ**: 調査対象となった代表的なモデルとして、falcon-180B、mistral-7B（期待以下の性能）、Yi-34B、tigerbot-70B（良好な性能）、facebook/xglm-7.5B（中間の性能）が挙げられています。

## 引用（Notable quotes）

*   "the overwhelming majority of models scoring less than 10 out of 100 on their f1-score!"
*   "if a number is followed by any kind of whitespace other than a simple space, it will not pass through the number normalization, hence never match the gold if it is also a number!"
*   "Not a single model got a correct result on floating point answers"
*   "High quality models which generate long answers actually have a lower f1-score"
*   "We have therefore taken the decision to remove DROP from the Open LLM Leaderboard until a new version arises."
*   "Here again the power of open-source, community and developping in the open-shines in that it allows to transparently investigate the root cause of an issue on a benchmark which has been out there for a couple of years."

## リスクと課題

*   **評価の不正確性**: 現在のDROP評価実装では、モデルの離散的推論能力を正確に測定できず、特に浮動小数点数の回答や、特定の形式で生成された回答に対する評価が不正確です。
*   **高コストな再評価**: 全モデルの評価を再実行するには、膨大なGPU時間とコストがかかります（DROPだけで8年分のGPU時間に相当）。正しく評価するためには、50%以上の例を再実行する必要があると推定されています。
*   **根本的な修正の必要性**: LM Eval Harnessの実装が「公式DROP」コードに厳密に従っているため、根本的な修正にはDROPベンチマーク評価自体の新しいバージョンを開発する必要があります。既存の実装の微調整では不十分です。
*   **コミュニティの協力**: 新しい評価バージョンの開発と、その後の検証には、学術界やコミュニティメンバーの協力が不可欠です。

## 今後の見通し/アクション

*   **一時的な削除**: 新しいDROP評価バージョンが開発されるまで、Open LLM LeaderboardからDROPベンチマークを一時的に削除します。
*   **新しい評価バージョンの開発**: EleutherAIチームと協力し、DROPベンチマークのスコアリングと正規化を修正した新しい評価バージョンを開発します。
*   **コミュニティへの呼びかけ**: コミュニティメンバーとDROP評価に取り組む学術関係者に対し、新しい評価バージョンの開発と改善に協力するよう呼びかけます。
*   **フィードバックの募集**: DROPの評価方法に関するコミュニティからのフィードバックを募り、より正確で信頼性の高いベンチマークを目指します。

## Source URL
https://huggingface.co/blog/open-llm-leaderboard-drop
