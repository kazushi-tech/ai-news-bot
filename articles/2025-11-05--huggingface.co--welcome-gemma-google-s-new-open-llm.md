---
title: "Welcome Gemma - Google’s new open LLM"
title_ja: "Google、新オープンLLM「Gemma」登場 AI開発に新風"
source_url: "https://huggingface.co/blog/gemma"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Googleは、Geminiをベースとした新しいオープンLLMファミリー「Gemma」をリリースしました。Gemmaは2Bと7Bの2つのモデルサイズで提供され、それぞれベースモデルと指示チューニング版があります。Hugging Faceは、モデルハブ、Transformers、Google Cloud、Inference Endpoints、TRLでのファインチューニングなど、Gemmaの包括的なエコシステム統合をサポートしています。Gemma 7BはMistral 7Bに匹敵する強力な性能を持ち、コンシューマー向けGPUでも効率的に動作します。

## 重要ポイント
*   **GoogleのオープンソースAIへのコミットメント**: GoogleがオープンソースAIへの取り組みを強化し、Gemmaをリリースしました。
*   **Gemmaモデルファミリー**: GeminiをベースとしたオープンLLMで、2Bと7Bの2サイズ、それぞれベースモデルと指示チューニング版があります。
*   **Hugging Faceとの包括的統合**: Hugging Faceエコシステム（モデルハブ、Transformers、Google Cloud、Inference Endpoints、TRL）に完全に統合されています。
*   **高性能と効率性**: Gemma 7BはMistral 7Bと同等の強力な性能を持ち、4-bit量子化により9GBメモリで動作可能で、コンシューマー向けGPUでも効率的に利用できます。
*   **Gemma 1.1へのアップデート**: リリース1ヶ月後に、コーディング能力、事実性、指示追従性、マルチターン品質が向上したGemma 1.1がリリースされました。
*   **学習データの詳細不足**: ベースモデルの学習データは一部開示されていますが、データセットの構成や前処理、指示チューニングモデルのファインチューニングに関する詳細は不明です。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened**: Googleは、Geminiを基盤とする新しいオープンな大規模言語モデル（LLM）ファミリー「Gemma」を発表しました。Hugging Faceは、このGemmaのリリースを全面的にサポートし、Hugging Faceエコシステム内での包括的な統合（モデルハブ、Transformersライブラリ、Google Cloud、Inference Endpoints、TRLによるファインチューニングなど）を提供しています。リリースから1ヶ月後には、コーディング能力や事実性などが向上したGemma 1.1が公開されました。
*   **背景**: このリリースは、GoogleがオープンソースAIへのコミットメントを強化する一環として行われました。Hugging Faceとの協力により、開発者がGemmaを容易に利用、デプロイ、ファインチューニングできる環境が整えられています。
*   **影響**: 開発者はHugging FaceのエコシステムやGoogle Cloudを通じてGemmaを容易に利用、デプロイ、ファインチューニングできるようになり、特にコンシューマー向けハードウェアでのLLM開発が加速することが期待されます。Gemma 7Bの高性能と効率的な動作は、幅広いアプリケーションでの採用を促進するでしょう。
*   **関係者**:
    *   **Google**: Gemmaの開発元であり、オープンソースAIコミュニティへの提供者。
    *   **Hugging Face**: GemmaのHugging Faceエコシステムへの統合、サポート、デプロイ・ファインチューニングツールの提供。
    *   **コミュニティ**: Gemmaの実際の利用におけるフィードバックやさらなる評価が期待されています。
*   **データ**:
    *   **モデル**: Gemma (Geminiベース)
    *   **サイズ**: 2B (ベース/指示チューニング)、7B (ベース/指示チューニング)
    *   **コンテキスト長**: 8Kトークン
    *   **更新版**: Gemma 1.1 (コーディング、事実性、指示追従性、マルチターン品質向上)
    *   **性能比較 (LLM Leaderboard - ベースモデル)**:
        | モデル | サイズ | LLM Leaderboardスコア (ベースモデル) | 比較対象 |
        |---|---|---|---|
        | Gemma 7B | 7B | 高い (Mistral 7Bに匹敵) | Mistral 7B |
        | Gemma 2B | 2B | 中程度 (Phi 2には及ばない) | Phi 2 |
    *   **学習データ**: ウェブ文書、コード、数学テキスト。CSAMコンテンツとPIIは除去され、ライセンスチェック済み。指示チューニングモデルのファインチューニングデータセットやハイパーパラメータに関する詳細は未公開。
    *   **ハードウェア要件**: Gemma 7Bは4-bit量子化で約9GBのメモリで動作可能。

## 引用（Notable quotes）
*   "It's great to see Google reinforcing its commitment to open-source AI, and we’re excited to fully support the launch with comprehensive integration in Hugging Face."
*   "Gemma 7B is a really strong model, with performance comparable to the best models in the 7B weight, including Mistral 7B."

## リスクと課題
*   **学習データの透明性の不足**: ベースモデルのトレーニングデータセットの具体的な構成や前処理に関する詳細な情報が不足しています。
*   **ファインチューニングの詳細不明**: 指示チューニングモデルのファインチューニングに使用されたデータセットやハイパーパラメータに関する情報が公開されていません。
*   **Gemma 2Bの性能**: Gemma 2Bは同サイズの他のトップモデル（例: Phi 2）と比較して、LLM Leaderboardでのスコアが低い点が指摘されています。

## 今後の見通し/アクション
*   **さらなる統合**: Hugging FaceとGoogle Cloudのパートナーシップにより、今後さらに多くの統合が提供される予定です。
*   **コミュニティからのフィードバック**: Gemmaの実世界での利用に関するコミュニティからのフィードバックが期待されています。
*   **開発者向けアクション**:
    *   Hugging Face HubからGemmaモデルにアクセスし、モデルカードやライセンスを確認する。
    *   Hugging ChatでGemma Instructモデルのデモを試す。
    *   🤗 Transformers 4.38以降を使用して、Gemmaモデルを推論やトレーニングに利用する。
    *   Google Cloud (Vertex AI, GKE) またはHugging Face Inference EndpointsにGemmaをデプロイする。
    *   🤗 TRLとQLoRAを活用し、単一GPUでGemmaを効率的にファインチューニングする。
    *   チャットモデルの評価には、LLM Leaderboardだけでなく、MT Bench、EQ Bench、lmsys Arenaなどのベンチマークも活用する。

## Source URL
https://huggingface.co/blog/gemma
