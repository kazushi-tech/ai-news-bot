---
title: "Welcome Gemma 2 - Google’s new open LLM"
title_ja: "Google、最新オープンLLM「Gemma 2」登場"
source_url: "https://huggingface.co/blog/gemma2"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Googleは最新のオープンLLM「Gemma 2」をリリースしました。これはGoogle Deepmind Geminiをベースとし、9Bと27Bの2つのサイズ（それぞれベースモデルとインストラクションチューン版）で提供されます。Hugging Faceエコシステムとの緊密な統合が特徴で、Transformers、Hugging Chat、Inference Endpoints、TRLによるファインチューニングがサポートされています。商用利用可能なライセンスで提供され、初代Gemmaの約2倍のデータで学習され、複数の技術的進歩を遂げています。

## 重要ポイント
*   **新モデルのリリース**: Googleの最新オープンLLM「Gemma 2」が9Bと27Bの2サイズで登場。
*   **Hugging Faceとの統合**: Hugging Faceエコシステム（Transformers、Hugging Chat、Inference Endpoints、TRL）に深く統合され、利用とファインチューニングが容易。
*   **技術的進歩**: スライディングウィンドウアテンション、ロジットソフトキャッピング、知識蒸留、モデルマージングといった主要な技術革新を導入。
*   **性能向上**: 初代Gemmaや他のオープンモデル（Mistral 7B、Llama 3 8Bなど）と比較して、特に9Bモデルで大幅な性能向上が見られます。
*   **商用利用可能**: 寛容なライセンスにより、再配布、ファインチューニング、商用利用、派生作品の作成が許可されています。
*   **効率的な利用**: 27Bモデルはbfloat16で56GB RAM、4-bit量子化で約18GB RAMで動作可能であり、多くの消費者向けGPUで利用可能です。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Googleは、最先端のオープンLLMファミリーの最新版である「Gemma 2」をリリースしました。Hugging FaceはGoogleと協力し、Hugging Faceエコシステムへの最適な統合を確保しています。4つのオープンウェイトモデル（2つのベースモデルと2つのファインチューンモデル）がHugging Face Hubで公開されています。

**背景:**
Gemma 2は、Google Deepmind GeminiをベースとしたGemmaシリーズの最新イテレーションです。初代Gemmaの成功を受け、より大規模なデータセットと複数の技術的進歩を取り入れて性能を向上させました。コンテキスト長は8Kトークンです。

**影響:**
*   開発者や企業は、Hugging Faceエコシステムを通じて、最先端のオープンLLMを容易に利用、デプロイ、ファインチューニングできるようになりました。
*   新しい技術的進歩（スライディングウィンドウアテンション、ソフトキャッピング、知識蒸留、モデルマージング）は、今後のオープンモデル開発に新たな方向性を示唆します。
*   特に4-bit量子化により、27Bモデルが消費者向けGPUで動作可能になったことは、より広範なユーザーベースでのLLM利用を促進します。

**関係者:**
*   **Google (DeepMind)**: Gemma 2の開発とリリース元。
*   **Hugging Face**: Gemma 2のHugging Faceエコシステムへの統合（Transformers、TRL、Inference Endpoints、Hugging Chat）を支援。
*   **コミュニティ**: LLM評価、Text Generation Inferenceサポート、Transformersへの統合、Hugging Chatでの利用に貢献。

**データ:**
*   **モデルサイズ**:
    *   `gemma-2-9b`: ベース9Bモデル
    *   `gemma-2-9b-it`: 9Bモデルのインストラクションファインチューン版
    *   `gemma-2-27b`: ベース27Bモデル
    *   `gemma-2-27b-it`: 27Bモデルのインストラクションファインチューン版
*   **学習データ**: 27B版は13兆トークン、9B版は8兆トークン（主に英語のウェブデータ、コード、数学）で学習。初代Gemmaの約2倍のデータ量。
*   **技術的進歩**:
    *   **Sliding window attention**: 一層おきにスライディングウィンドウアテンション（ローカル4096トークン）、中間層はフル二次グローバルアテンション（8192トークン）を適用。
    *   **Logit soft-capping**: ロジットが過度に大きくなるのを防ぎ、訓練を安定化。最終層は30.0、アテンション層は50.0でキャップ。
    *   **Knowledge Distillation**: 9Bモデルの事前学習とインストラクションチューニングに利用。より大きな教師モデル（Gemini Ultraと推測）から合成データを生成し、SFTと「オンポリシー蒸留」を組み合わせる。
    *   **Model Merging**: Warpという新しいマージング技術を使用。RLファインチューニング中のEMA、複数ポリシーRLファインチューニング後のSLERP、SLERP後のLITIの3段階でモデルを結合。
*   **性能評価（Technical Report results）**:
    **Gemma 2 (27B) と競合モデルの比較**
    | Benchmark | Llama 3 (70B) | Qwen 1.5 (32B) | Gemma 2 (27B) |
    | :-------- | :------------ | :------------- | :------------ |
    | MMLU      | 79.2          | 74.3           | 75.2          |
    | GSM8K     | 76.9          | 61.1           | 75.1          |
    | ARC-c     | 68.8          | 63.6           | 71.4          |
    | HellaSwag | 88.0          | 85.0           | 86.4          |
    | Winogrande| 85.3          | 81.5           | 83.7          |

    **Gemma 2 (9B) と小型モデルの比較**
    | Benchmark | Mistral (7B) | Llama 3 (8B) | Gemma (8B) | Gemma 2 (9B) |
    | :-------- | :----------- | :----------- | :--------- | :----------- |
    | MMLU      | 62.5         | 66.6         | 64.4       | 71.3         |
    | GSM8K     | 34.5         | 45.7         | 50.9       | 62.3         |
    | ARC-C     | 60.5         | 59.2         | 61.1       | 68.4         |
    | HellaSwag | 83.0         | 82.0         | 82.3       | 81.9         |
    | Winogrande| 78.5         | 78.5         | 79.0       | 80.6         |

## 引用（Notable quotes）
*   "Google released Gemma 2, the latest addition to its family of state-of-the-art open LLMs, and we are excited to collaborate with Google to ensure the best integration in the Hugging Face ecosystem."
*   "And Thank you to the Google Team for releasing Gemma 2 and making it available to the open-source AI community!"

## リスクと課題
*   **学習データの詳細不足**: 事前学習およびファインチューニングのデータセットやハイパーパラメータの詳細は公開されていません。
*   **Soft-cappingとFlash Attentionの非互換性**: ファインチューニング時にはSoft-cappingがFlash Attention / SDPAと互換性がなく、eager attentionの使用が推奨されます（推論時は問題なし）。
*   **27Bモデルの精度要件**: 27Bインストラクションチューンモデルはfloat16で不安定な出力を生成するため、bfloat16の使用が必須です。
*   **Google Cloud統合の遅延**: GKEおよびVertex AIへの新しいコンテナ追加作業は現在進行中であり、利用可能になるまで時間がかかります。
*   **Open LLM Leaderboard評価の進行中**: Hugging FaceによるOpen LLM LeaderboardでのGemma 2の個別評価は現在進行中であり、結果は後日更新されます。

## 今後の見通し/アクション
*   Hugging Faceは、Gemma 2のHugging Faceエコシステムへの最適な統合を継続します。
*   Google Cloud (GKEおよびVertex AI) へのGemma 2を効率的に実行するための新しいコンテナが近日中に追加される予定です。
*   Open LLM LeaderboardでのGemma 2の評価結果が近日中に更新される見込みです。
*   Google NotebookおよびVertex AIモデルガーデンが近日中に公開される予定です。
*   「オンポリシー蒸留」のような新しい訓練手法が、今後のファインチューナーの間でより普及するか注目されます。

## Source URL（必須）
https://huggingface.co/blog/gemma2
