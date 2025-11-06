---
title: "Unlock the power of images with AI Sheets"
title_ja: "AI Sheets、画像データ活用を革新！抽出・生成・編集も"
source_url: "https://huggingface.co/blog/aisheets-unlock-images"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Face AI Sheetsは、AIモデルを活用してデータセットを強化するオープンソースのノーコードツールです。今回の大型アップデートにより、画像サポートが追加されました。これにより、レシートや文書からのデータ抽出、テキストからのビジュアル生成、画像編集といった作業をすべてスプレッドシート内で完結できるようになりました。数千ものオープンモデルがInference Providers経由で利用可能です。

## 重要ポイント
*   **画像サポートの追加**: AI Sheetsが画像データのアップロード、分析、情報抽出、生成、編集に対応。
*   **ノーコードAI活用**: コーディング不要で、AIモデルをデータセット構築・強化に利用可能。
*   **多様なAIアクション**: 画像からのテキスト抽出、構造化データ抽出、画像生成、画像編集など、幅広いAIアクションを提供。
*   **オープンモデルの活用**: Inference Providersを通じて数千のオープンAIモデルを利用でき、柔軟なモデル選択が可能。
*   **ワークフローの統合**: テキストと画像の処理を同じスプレッドシート内で一元管理し、コンテンツ作成ワークフローを効率化。
*   **フィードバック学習**: プロンプトの反復、手動編集、高評価（thumbs-up）を通じてモデルの精度を向上。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、オープンソースのデータセット構築・変換・強化ツールであるAI Sheetsに、大規模なアップデートをリリースしました。このアップデートにより、AI Sheetsは画像（ビジョン）サポートを統合し、ユーザーはスプレッドシート内で直接画像を操作できるようになりました。

**背景:**
画像は、製品写真、レシート、スクリーンショット、図表、ロゴなど、あらゆる場所に存在し、構造化された情報を含んでいます。これまでのAI Sheetsはテキストコンテンツの処理に特化していましたが、画像が持つ膨大な情報をAIで抽出し、分析し、変換するニーズが高まっていました。このアップデートは、画像データが持つ潜在的な価値を最大限に引き出し、より包括的なデータセット構築を可能にすることを目的としています。

**影響:**
*   **データ抽出の効率化**: レシートからの経費データ抽出、手書き文書からのテキスト化、チャートからのデータ抽出などが容易になり、手作業によるデータ入力や構造化の手間を大幅に削減します。
*   **コンテンツ作成の加速**: テキストプロンプトから画像を生成したり、既存画像を編集したりすることで、ソーシャルメディアコンテンツやマーケティング素材の作成プロセスがスプレッドシート内で完結し、コンテンツ制作のワークフローが効率化されます。
*   **データセットの多様化**: テキストと画像の両方を含むリッチなデータセットを構築・管理できるようになり、より複雑なAIアプリケーション開発の基盤となります。

**関係者:**
*   **Hugging Face**: AI Sheetsの開発元であり、オープンソースAIツールの提供者。
*   **Inference Providers**: AI Sheetsが利用する数千のオープンモデルの推論を提供するプロバイダー。
*   **ユーザー**: データサイエンティスト、研究者、コンテンツクリエイター、ビジネスユーザーなど、データセットの構築やAIを活用した情報抽出・生成を求める人々。

**データ:**
AI Sheetsで扱えるデータは以下の通りです。
*   **画像データ**: レシート、手書き文書、製品写真、スクリーンショット、図表、ロゴなど。
*   **テキストデータ**: 画像から抽出されたテキスト、ユーザーが入力するプロンプト、生成されたキャプションや説明文。
*   **構造化データ**: 画像から抽出された merchant name, date, total amount, expense category, ingredients, cooking time, cuisine type など。

**モデル比較例:**
手書きレシピからのテキスト抽出において、異なるモデルの性能比較が示されています。

| モデル名 | 抽出テキスト |
| :------- | :----------- |
| Qwen/Qwen2.5-VL-7B-Instruct | in large bowl combine meat, onion, bread crumbs 1/2 nutmeg & cheese - as you add sprinkle around. Then blend - Last sprinkle blend again Bake in large pan for 10-15 min. at 350. Let stand 5 min before serving. |
| Qwen/Qwen3-VL-235B-A22B-Reasoning | in lg bowl combine meat, onion, bread crumbs 1/4 nutmeg & cheese - as you add sprinkle around. then blend - last spinach blend again. Bake in lg pan for 50-60 min. @ 350 - let stand 5 min before serving |

Qwen/Qwen3-VL-235B-A22B-Reasoningモデルは、より正確な調理時間（50-60分 vs 10-15分）と材料（spinach vs sprinkle）を抽出しており、モデル選択が結果に大きく影響することが示されています。

## 引用（Notable quotes）
「Hugging Face AI Sheets is an open-source tool for supercharging datasets with AI models, no code required. Now with vision support: extract data from images (receipts, documents), generate visuals from text, and edit images—all in a spreadsheet. Powered by thousands of open models via Inference Providers.」

## リスクと課題
*   **モデルの精度と選択**: デフォルトモデルでは複雑な画像からの情報抽出や生成において不十分な場合があり、最適な結果を得るためには、数千あるモデルの中から適切なものを選択し、プロンプトを繰り返し調整する必要があります。
*   **コスト**: ローカルでAI Sheetsを最大限に活用し、月間20倍の推論使用量を得るためには、Hugging Face PROサブスクリプションが推奨されており、利用規模によってはコストが発生します。
*   **誤認識の可能性**: AIモデルによる抽出や生成は完璧ではなく、特に複雑な画像や手書き文字の場合、誤認識や不正確な情報が含まれる可能性があり、手動での検証と修正が不可欠です。

## 今後の見通し/アクション
*   **AI Sheetsの試用**: インストールやダウンロードなしでオンラインでAI Sheetsを試すことができます。
*   **ローカルデプロイ**: GitHubリポジトリからAI Sheetsをローカルにデプロイすることが可能です。
*   **PROサブスクリプションの検討**: ローカル実行で最大限の性能と月間推論使用量を得るには、Hugging Face PROサブスクリプションが推奨されています。
*   **コミュニティへの貢献**: 質問や提案がある場合は、CommunityタブまたはGitHubでIssueを開くことで、開発チームやコミュニティにフィードバックを提供できます。

## Source URL（必須）
https://huggingface.co/blog/aisheets-unlock-images
