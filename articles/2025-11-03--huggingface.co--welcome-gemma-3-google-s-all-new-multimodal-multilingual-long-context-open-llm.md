---
title: "Welcome Gemma 3: Google's all new multimodal, multilingual, long context open LLM"
title_ja: "Google、Gemma 3公開 新型オープンLLMはマルチモーダル・多言語・長文脈対応"
source_url: "https://huggingface.co/blog/gemma3"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Googleは、Gemmaファミリーの最新モデル「Gemma 3」をリリースしました。Gemma 3は、1Bから27Bまでの4つのパラメータサイズを持ち、最大128kトークンのコンテキストウィンドウ、画像とテキストの両方を受け入れるマルチモーダル機能（1Bモデルを除く）、そして140以上の言語をサポートします。Hugging Faceエコシステムと緊密に統合されており、事前学習済みモデルと指示チューニング済みモデルが提供されます。ベンチマークでは、Gemma-3-4B-ITがGemma-2-27B-ITを上回り、Gemma-3-27B-ITはGemini 1.5-Proを凌駕する性能を示しています。

| 特徴                 | Gemma 2      | Gemma 3                                 |
| :------------------- | :----------- | :-------------------------------------- |
| サイズバリアント     | 2B, 9B, 27B  | 1B, 4B, 12B, 27B                        |
| コンテキストウィンドウ長 | 8k           | 32k (1B), 128k (4B, 12B, 27B)           |
| マルチモーダル (画像とテキスト) | ❌           | ❌ (1B), ✅ (4B, 12B, 27B)                |
| 多言語サポート       | –            | 英語 (1B), +140言語 (4B, 12B, 27B)      |

## 重要ポイント

*   **マルチモーダル対応**: 4B、12B、27Bモデルは画像とテキストの両方を処理可能。
*   **長コンテキスト長**: 1Bモデルは32k、その他は128kトークンまでコンテキスト長を拡張。
*   **多言語サポート**: 140以上の言語に対応し、特に中国語、日本語、韓国語のエンコーディングが改善。
*   **高性能**: Gemma-3-27B-ITはLMSys Chatbot Arenaでトップ10入りし、Gemini 1.5-Proと同等またはそれ以上のベンチマーク性能を発揮。
*   **Hugging Face統合**: Hugging Face Hubで利用可能で、`transformers`ライブラリにリリースと同時に対応。
*   **オンデバイス対応**: Apple Silicon向けのMLXやLlama.cpp (GGUF) を通じて、低リソースデバイスでの実行をサポート。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Googleは、オープンウェイトLLM「Gemma」シリーズの最新版「Gemma 3」を発表しました。このモデルは、Gemma 2から大幅な技術的進歩を遂げ、マルチモーダル、多言語、長コンテキスト対応を実現しています。

**背景:**
Gemma 3は、Googleのオープンモデル戦略の一環として開発され、より高性能で汎用性の高いAIモデルを研究者や開発者に提供することを目的としています。Gemma 2の成功を基盤に、コンテキスト長、マルチモーダル能力、多言語対応といった主要な領域で強化が図られました。

**技術的強化:**
1.  **長コンテキスト長**:
    *   128kトークンへのスケーリングは、32kシーケンスでの事前学習後、4B、12B、27Bモデルのみを128kトークンに拡張することで効率的に達成。
    *   RoPE（Rotary Positional Embeddings）のベース周波数をGemma 2の10kから1Mに調整し、長コンテキスト向けに8倍スケーリング。
    *   KVキャッシュ管理は、Gemma 2のsliding window interleaved attentionを最適化し、5つのローカル層と1つのグローバル層をインターリーブ（以前は1:1）、ウィンドウサイズを1024トークンに削減（以前は4096）。これにより、パープレキシティを損なわずにメモリを節約。
2.  **マルチモーダル**:
    *   画像エンコーダとしてSigLIPを使用し、画像を言語モデルが取り込めるトークンに変換。
    *   入力画像は896x896にリサイズされるが、非正方形や高解像度画像には「pan and scan」アルゴリズムを適用し、適応的にクロップして詳細を拡大。
    *   アテンションメカニズムは、テキスト入力には一方向アテンション、画像入力には双方向アテンションを適用。
3.  **多言語対応**:
    *   事前学習データセットの多言語データを2倍に増加させ、言語カバー率を向上。
    *   Gemini 2.0と同じ262KエントリのSentencePieceトークナイザーを採用。これにより、中国語、日本語、韓国語のエンコーディングが大幅に改善された一方、英語とコードのトークン数はわずかに増加。

**評価:**
*   **LMSys Chatbot Arena**: Gemma-3-27B-ITはEloスコア1339を記録し、o1-previewと同等で、主要なクローズドモデルを含むトップ10にランクイン。
*   **ベンチマーク**: MMLU-Pro (67.5)、LiveCodeBench (29.7)、Bird-SQL (54.4)、GPQA Diamond (42.4)、MATH (69.0)、FACTS Grounding (74.9)、MMMU (64.9) などで、Gemini 1.5モデルに匹敵または上回る性能。SimpleQA (10.0) では劣る。

**関係者:**
Google DeepMindのGemmaチームが開発。Hugging FaceのRaushan、Joao、Lysandre、Kashif、Matthew、Marc、David、Mohit、Yih DahらがHugging Faceのオープンソーススタック（Transformers、TGIなど）への統合に貢献。オンデバイス、Gradio、アドボカシーチーム（Chris、Kyle、Pedro、Son、Merve、Aritra、VB、Toshiro）がデモ構築を支援。Georgi、Diego、Princeがllama.cppおよびMLXポートに貢献。

## 引用（Notable quotes）

*   「Gemma-3-4B-IT beats Gemma-2-27B IT, while Gemma-3-27B-IT beats Gemini 1.5-Pro across benchmarks.」
*   「It takes a village to raise a gemma!」

## リスクと課題

*   **SimpleQAでの性能**: 基本的な事実に関するSimpleQAベンチマークでは、Gemma-3-27B-ITが10.0と比較的低いスコアを示しており、この領域での改善の余地がある。
*   **固定入力解像度**: 画像エンコーダの固定入力解像度（896x896）は、非正方形のアスペクト比や非常に高解像度の画像を直接処理する際に課題となる可能性がある（「pan and scan」アルゴリズムで対応はしている）。

## 今後の見通し/アクション

*   **モデルの利用**: Gemma 3モデルはHugging Face Hubで公開されており、`transformers`ライブラリを通じてすぐに利用可能。`pip install git+https://github.com/huggingface/transformers@v4.49.0-Gemma-3`でインストールできる。
*   **推論の実行**: `pipeline`抽象化、`Gemma3ForConditionalGeneration` (VLM用)、`Gemma3ForCausalLM` (LLM専用) クラスを使用して推論を実行できる。`bfloat16`データタイプでの利用が推奨される。
*   **オンデバイス展開**: Apple Siliconデバイス向けには`mlx-vlm`ライブラリ、低リソースデバイス向けには事前量子化されたGGUFファイルと`llama.cpp`を利用してオンデバイスでの実行が可能。
*   **クラウドデプロイ**: Hugging Face Endpointsを通じて、Gemma-3-27B-ITおよびGemma-3-12B-ITをワンクリックでデプロイできる。GGUF/llama.cppバリアントのデプロイもサポートされている。
*   **さらなる研究開発**: 技術レポートが公開されており、詳細な技術的強化について深く掘り下げることが可能。

## Source URL（必須）
https://huggingface.co/blog/gemma3
