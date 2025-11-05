---
title: "Welcome Gemma 3: Google's all new multimodal, multilingual, long context open LLM"
title_ja: "Google、最新オープンLLM「Gemma 3」発表 マルチモーダル・多言語・長文脈対応"
source_url: "https://huggingface.co/blog/gemma3"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Googleは、Gemmaファミリーの最新版であるGemma 3をリリースしました。このモデルは1Bから27Bまでのパラメータサイズを持ち、最大128kトークンのコンテキストウィンドウ、画像とテキストの両方を受け入れるマルチモーダル機能（1Bモデルはテキストのみ）、および140以上の言語サポートを特徴としています。Gemma 3はHugging Faceエコシステムと緊密に統合されており、ベンチマークではGemma-3-4B-ITがGemma-2-27B ITを、Gemma-3-27B-ITがGemini 1.5-Proを上回る性能を示しています。

## 重要ポイント

*   **最新のオープンウェイトLLM**: GoogleによるGemmaファミリーの最新イテレーション。
*   **モデルサイズ**: 1B, 4B, 12B, 27Bの4つのサイズで提供され、ベースモデルとインストラクションチューニングモデルがある。
*   **主要な技術強化**:
    *   **長コンテキスト長**: 1Bモデルで32k、その他で128kトークンに大幅拡張。
    *   **マルチモーダル性**: 4B, 12B, 27Bモデルは画像とテキストの入力を処理可能。
    *   **多言語対応**: 140以上の言語をサポート（1Bモデルは英語のみ）。
*   **高性能**: LMSys Chatbot ArenaでGemma 3 27B ITがEloスコア1339を記録し、トップ10入り。主要ベンチマークでGemini 1.5 Proに匹敵または凌駕する性能。
*   **エコシステム統合**: Hugging Face `transformers`、`mlx-vlm` (Apple Silicon)、`llama.cpp` (GGUF) で即日サポートされ、Hugging Face Endpointsでのデプロイも可能。
*   **オンデバイス対応**: 小規模モデルはオンデバイスおよび低リソースデバイスでの利用を想定。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Googleは、オープンウェイトの大規模言語モデル（LLM）であるGemma 3を発表・リリースしました。これは、マルチモーダル（画像とテキスト対応）、多言語対応、および大幅に拡張されたコンテキスト長を特徴とするGemmaファミリーの最新版です。モデルはHugging Face Hubで利用可能であり、Hugging Faceエコシステムと緊密に統合されています。

**背景:**
Gemma 3は、前世代のGemma 2からの大幅な進化を遂げています。主な強化点は以下の通りです。

*   **コンテキスト長**: Gemma 2の8kトークンから、Gemma 3では1Bモデルで32k、4B, 12B, 27Bモデルで128kトークンへと拡張されました。これは、32kシーケンスでの事前学習後、計算資源を節約しつつ、RoPE（Rotary Positional Embeddings）のベース周波数を10kから1Mに、スケーリング係数を8に調整することで実現されました。KVキャッシュ管理もGemma 2のsliding window interleaved attentionを最適化し、メモリ効率を向上させながらパープレキシティの劣化を防いでいます。
*   **マルチモーダル性**: Gemma 3（4B, 12B, 27Bモデル）は、SigLIPを画像エンコーダとして採用し、画像を896x896ピクセルにリサイズしてトークン化します。非正方形や高解像度画像に対応するため、「パン＆スキャン」アルゴリズムが導入され、画像を適応的にクロップして詳細を拡大して処理できます。テキスト入力には一方向アテンション、画像入力には双方向アテンションが適用されます。
*   **多言語対応**: 事前学習データセットの多言語データ量が2倍に増加し、言語カバレッジが向上しました。Gemini 2.0と同じ262KエントリのSentencePieceトークナイザーが採用され、中国語、日本語、韓国語のエンコーディングが大幅に改善されました（英語とコードのトークンカウントはわずかに増加）。

**影響:**
Gemma 3は、その高性能とアクセシビリティにより、幅広いアプリケーションでの利用が期待されます。

*   **性能**: LMSys Chatbot Arenaにおいて、Gemma 3 27B ITはEloスコア1339を達成し、トップ10モデルにランクインしました。MMLU-Pro (67.5)、LiveCodeBench (29.7)、Bird-SQL (54.4)、GPQA Diamond (42.4)、MATH (69.0)、FACTS Grounding (74.9)、MMMU (64.9) などの主要ベンチマークで、クローズドモデルであるGemini 1.5 Proに匹敵または上回る性能を示しています。ただし、SimpleQA (10.0) では基本的な事実に関する性能が劣ります。
*   **利用の容易さ**: Hugging Face `transformers`ライブラリ、Apple Siliconデバイス向けの`mlx-vlm`、および`llama.cpp`（GGUFファイル）を通じて、開発者はGemma 3を容易に利用・デプロイできます。Hugging Face Endpointsでは、ワンクリックでのデプロイもサポートされています。これにより、質疑応答、画像内容分析、文書要約など、多様なユースケースへの適用が促進されます。

**関係者:**
*   **Google (Gemma team)**: Gemma 3モデルの開発とリリース。
*   **Hugging Face**: `transformers`ライブラリへの統合、Hugging Face Hubでのモデル提供、Hugging Face Endpointsでのデプロイサポート、`mlx-vlm`、`gradio`、アドボカシーチームによるデモ構築。
*   **MLXコミュニティ**: Apple Siliconデバイス向けの`mlx-vlm`への統合。
*   **llama.cppコミュニティ**: `llama.cpp`へのポートとGGUFファイルの提供。

**データ:**

| 特徴                 | Gemma 2        | Gemma 3 (1B)     | Gemma 3 (4B, 12B, 27B) |
| :------------------- | :------------- | :--------------- | :--------------------- |
| **サイズバリアント** | 2B, 9B, 27B    | 1B               | 4B, 12B, 27B           |
| **コンテキスト長**   | 8k             | 32k              | 128k                   |
| **マルチモーダル**   | ❌             | ❌ (テキストのみ) | ✅ (画像とテキスト)    |
| **多言語サポート**   | –              | 英語             | 140+言語               |

**Gemma 3 27B ITのベンチマーク評価:**

| ベンチマーク          | スコア (27B) |
| :------------------ | :----------- |
| LMSys Eloスコア     | 1339         |
| MMLU-Pro            | 67.5         |
| LiveCodeBench       | 29.7         |
| Bird-SQL            | 54.4         |
| GPQA Diamond        | 42.4         |
| MATH                | 69.0         |
| FACTS Grounding     | 74.9         |
| MMMU                | 64.9         |
| SimpleQA            | 10.0         |

## 引用（Notable quotes）

*   「Gemma-3-4B-IT beats Gemma-2-27B IT, while Gemma-3-27B-IT beats Gemini 1.5-Pro across benchmarks.」
*   「Gemma 3 goes multimodal! The 4, 12, and 27 billion parameter models can process both images and text」
*   「Scaling context length to 128k tokens could be achieved efficiently without training models from scratch.」
*   「memory savings are achieved without degrading perplexity.」
*   「The new tokenizer significantly improves the encoding of Chinese, Japanese and Korean text」

## リスクと課題

*   **SimpleQAでの性能不足**: Gemma 3 27B ITは、基本的な事実に関するSimpleQAベンチマークで10.0と低いスコアを示しており、この領域での改善の余地があります。
*   **トークナイザーのトレードオフ**: 新しいトークナイザーは中国語、日本語、韓国語のエンコーディングを大幅に改善しましたが、その代償として英語とコードのトークンカウントがわずかに増加します。
*   **固定画像解像度**: 画像エンコーダが896x896ピクセルの固定解像度を要求するため、非正方形のアスペクト比や高解像度画像の処理が困難になる可能性があります（「パン＆スキャン」アルゴリズムで緩和）。

## 今後の見通し/アクション

*   **Hugging Face Hubからの利用**: Gemma 3の全モデルはHugging Face Hubで公開されており、すぐに利用可能です。
*   **多様な推論オプション**:
    *   `🤗 transformers`ライブラリを使用して、Pythonで簡単に推論を実行できます。
    *   Apple Siliconデバイス（Mac、iPhoneなど）向けには、`mlx-vlm`ライブラリを通じてオンデバイス推論が可能です。
    *   低リソースデバイス向けには、事前量子化されたGGUFファイルが提供されており、`llama.cpp`でローカル推論が可能です。
*   **Hugging Face Endpointsでのデプロイ**: Gemma-3-27b-itおよびGemma-3-12b-itは、Hugging Face Inference Catalogからワンクリックでデプロイでき、最適化されたハードウェアと設定が提供されます。
*   **幅広い応用**: 質疑応答、画像内容分析、文書要約など、マルチモーダルおよび長コンテキスト機能を活用した多様なアプリケーション開発が期待されます。

## Source URL（必須）
https://huggingface.co/blog/gemma3
