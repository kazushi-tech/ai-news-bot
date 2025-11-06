---
title: "Open LLM Leaderboard: DROP deep dive"
title_ja: "Open LLM LeaderboardのDROPで謎の低スコア、その原因を徹底解明"
source_url: "https://huggingface.co/blog/open-llm-leaderboard-drop"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging FaceのOpen LLM Leaderboardに追加されたDROPベンチマークにおいて、多くのモデルが異常に低いf1スコア（10/100未満）を記録する問題が発覚しました。詳細な調査の結果、数値の正規化エラーと、生成終了トークンとしてピリオド（.）を使用していることによる浮動小数点数の途切れや不必要な単語の生成が主な原因と判明。暫定的に生成終了トークンを改行（\n）に変更することでスコアの相関は改善されましたが、根本的な解決にはDROPベンチマークの新しい評価実装が必要であると結論付けられました。このため、新しいバージョンが登場するまで、DROPはリーダーボードから一時的に削除されることになりました。

## 重要ポイント

*   **異常な低スコア**: Open LLM Leaderboardに追加されたDROPベンチマークで、ほとんどのモデルがf1スコア10未満という異常な結果を示しました。
*   **正規化の問題**: 数値がスペース以外の空白文字（例: 改行）に続く場合、正しく数値として正規化されず、正解と一致しないバグが発見されました。
*   **生成終了トークンの問題**: 生成終了トークンとしてピリオド（.）を使用しているため、浮動小数点数の回答が途中で切れたり、高品質モデルが不必要な単語を生成してf1スコアが低下したりする問題が判明しました。
*   **暫定的な改善**: 生成終了トークンを改行（\n）に変更してスコアを再計算したところ、DROPスコアと他のベンチマークの平均スコアとの相関が大幅に改善されました。
*   **評価の一時削除**: 既存の評価実装が公式DROPコードに厳密に従っているため、根本的な修正には新しい評価実装の開発が必要と判断され、DROPベンチマークはOpen LLM Leaderboardから一時的に削除されました。
*   **コミュニティの力**: オープンソースコミュニティによる共同調査が、長年見過ごされてきたベンチマークの問題を発見する上で極めて重要であることが再確認されました。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened**:
Hugging FaceのOpen LLM LeaderboardにWinogrande、GSM8k、DROPの3つの新しいベンチマークが追加されました。しかし、DROPのf1スコアを分析したところ、圧倒的多数のモデルが10/100未満という異常に低いスコアを記録していることが判明しました。これはモデルの全体的な性能を示す他のベンチマーク平均スコアとの相関がほとんど見られないという予期せぬ傾向を示していました。

**背景**:
DROP (Discrete Reasoning Over Paragraphs) は、英語の段落から関連情報を抽出し、離散的な推論ステップ（例: アイテムの並べ替えやカウント）を実行する能力を評価するベンチマークです。評価にはカスタムのf1スコアとExact Matchスコアが用いられます。このベンチマークはEleutherAI Harnessのオリジナル実装を再現してリーダーボードに統合されました。

**影響**:
異常に低いDROPスコアは、モデルの真の推論能力を正確に反映せず、リーダーボードにおけるモデルの総合的な評価を歪める可能性がありました。特に、一部の高品質モデルが他のベンチマークでの高評価にもかかわらずDROPで低スコアを出すという矛盾が生じていました。

**関係者**:
*   **Hugging Face**: Open LLM Leaderboardの運営者であり、今回の問題の発見と調査を主導しました。
*   **EleutherAIチーム**: LM Eval Harnessの実装者であり、コードのガイダンスや調査に協力しました。
*   **Zenoチーム**: 調査に加わり、より詳細な結果分析を行い、追加の問題点を発見しました。
*   **コミュニティ**: DROPスコアに関する問題点を指摘し、共同調査に貢献しました。

**データ**:
調査により、以下の2つの主要な問題が特定されました。

1.  **正規化の不具合**:
    *   モデルの生成結果や正解の正規化ステップにおいて、数値が単純なスペース以外の空白文字（例: 改行 `\n`）に続く場合、その数値が正しく認識されませんでした。
    *   例えば、モデルが「`10\n\nPassage:`」と生成し、正解が「`10`」である場合、生成された「`10`」は数値として正規化されず、正解の「`10.0`」と一致しないため、誤答と判断されていました。
    *   これは、文字列全体ではなく、正規化された単語のバッグ（Bag of Words）で比較が行われるため、数値が正しく抽出されないと一致しないという問題でした。

2.  **生成終了トークンの誤用**:
    *   生成を終了させるストップワードとしてピリオド（`.`）が使用されていました。
    *   このため、浮動小数点数（例: `12.25`）の回答が「`12.`」で途切れてしまい、完全な回答が生成されませんでした。
    *   また、高品質なモデルほど、few-shotプロンプトの形式に合わせて「`Answer\n\nPlausible prompt for the next question.`」のように長い回答を生成しようとしますが、途中のピリオドで停止するため、実際の回答の後に余分な単語が含まれてしまい、f1スコアが低下していました。

これらの問題に対し、生成終了トークンをピリオド（`.`）から改行（`\n`）に変更してスコアを再計算したところ、DROPスコアと他のベンチマーク平均スコアとの相関が大幅に改善され、問題の根源が確認されました。

## 引用（Notable quotes）

*   "the overwhelming majority of models scoring less than 10 out of 100 on their f1-score!"
*   "if a number is followed by any kind of whitespace other than a simple space, it will not pass through the number normalization, hence never match the gold if it is also a number!"
*   "At this point, we believed that both failure cases were actually caused by the same root factor: using . as a stopword token (to end the generations)"
*   "We have therefore taken the decision to remove DROP from the Open LLM Leaderboard until a new version arises."
*   "Here again the power of open-source, community and developping in the open-shines in that it allows to transparently investigate the root cause of an issue on a benchmark which has been out there for a couple of years."

## リスクと課題

*   **評価の信頼性低下**: 既存のDROP評価実装には、正規化の不具合と生成終了トークンの誤用という複数の根本的な問題があり、モデルの真の性能を正確に評価できないため、リーダーボードの信頼性が損なわれていました。
*   **高コストな再評価**: 全モデルのDROPベンチマークを再実行するには、GPU時間で8年相当という莫大なコストがかかります。問題のある例（全体の50%以上）のみを再実行するだけでも多大なリソースが必要です。
*   **実装の厳密性**: EleutherAIのLM Eval Harness実装が「公式DROP」コードに厳密に従っているため、既存のコードベースで問題を修正するのではなく、新しい評価実装を開発する必要があるという課題があります。

## 今後の見通し/アクション

*   **一時的な削除**: 新しいバージョンの評価実装が開発されるまで、DROPベンチマークはOpen LLM Leaderboardから一時的に削除されます。
*   **コミュニティへの協力呼びかけ**: Hugging Faceは、DROP評価のスコアリングと正規化の両方を修正するため、コミュニティメンバーと学術界の協力を積極的に呼びかけています。
*   **新しい評価実装の開発**: 根本的な解決策として、DROPベンチマークの新しい評価実装の開発が計画されています。
*   **データセットの再利用**: DROPデータセット自体は非常に興味深く有用であると認識されており、新しい評価実装が確立され次第、再びリーダーボードに統合されることが期待されています。

## Source URL（必須）
https://huggingface.co/blog/open-llm-leaderboard-drop
