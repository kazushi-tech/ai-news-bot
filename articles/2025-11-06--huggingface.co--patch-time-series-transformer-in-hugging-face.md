---
title: "Patch Time Series Transformer in Hugging Face"
title_ja: "Hugging FaceにPatchTST、時系列予測Transformerを実装"
source_url: "https://huggingface.co/blog/patchtst"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
本記事は、Hugging Face上でPatchTSTモデルを利用し、時系列予測と転移学習を行うためのステップバイステップガイドです。電力データセットでの直接予測と、ETTh1データセットへの転移学習（ゼロショット、リニアプロービング、フルファインチューニング）の具体的な実装例を通じて、PatchTSTの強力な機能と柔軟性をデモンストレーションしています。

## 重要ポイント
*   **PatchTSTモデルの紹介**: ICLR 2023で発表されたTransformerベースの時系列予測モデルで、時系列をサブシリーズレベルのパッチに分割し、チャネル独立性を特徴とします。
*   **Hugging Faceエコシステムとの統合**: Hugging Face TransformersライブラリとIBM tsfmパッケージを組み合わせて、PatchTSTを簡単にインストール・利用できます。
*   **直接予測のデモンストレーション**: ElectricityデータセットでPatchTSTを直接訓練し、MSE 0.1316という、元の論文に非常に近い高性能を達成しました。
*   **転移学習の有効性**: 電力データで事前学習したモデルをETTh1データセットに転移学習させ、以下の結果を示しました。
    *   **ゼロショット予測**: 事前学習モデルをそのまま適用し、MSE 0.3728。
    *   **リニアプロービング**: 凍結されたバックボーンの上に線形層のみを訓練し、MSE 0.3565を達成。これは元の論文で報告された結果を上回ります。
    *   **フルファインチューニング**: 全てのモデルパラメータを訓練し、MSE 0.3542を達成。リニアプロービングからの改善はわずかでした。
*   **PatchTSTの設計上の利点**: パッチング設計により、局所的な意味情報の保持、計算およびメモリ使用量の削減、より長い履歴への対応が可能になります。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Faceは、PatchTSTモデルをHugging Face Transformersライブラリに統合し、その利用方法を詳細なコード例とともにブログ記事で公開しました。具体的には、電力データセットでの直接的な時系列予測と、事前学習済みモデルをETTh1データセットに転移学習させる（ゼロショット、リニアプロービング、フルファインチューニング）プロセスが示されました。

**背景:**
PatchTSTは、Yuqi NieらがICLR 2023で発表した「A Time Series is Worth 64 Words: Long-term Forecasting with Transformers」で提案された、長期間の時系列予測に特化したTransformerベースのモデルです。Hugging Faceは、この先進的なモデルをより多くの開発者が容易に利用できるよう、Transformersライブラリに組み込み、実践的なガイドを提供しました。

**影響:**
このガイドにより、開発者はHugging Faceのツールチェーンを活用して、PatchTSTを自身の時系列予測プロジェクトに迅速に導入できるようになります。特に、転移学習のデモンストレーションは、限られたターゲットデータしかないシナリオでのPatchTSTの強力な性能と柔軟性を示しており、幅広い応用が期待されます。

**関係者:**
*   **Hugging Face:** Transformersライブラリを通じてPatchTSTモデルの統合と利用を促進。
*   **IBM:** 時系列データの前処理を支援する`tsfm`パッケージを提供。
*   **PatchTSTの著者:** Yuqi Nie, Nam H. Nguyen, Phanwadee Sinthong, Jayant Kalagnanam。

**データ:**
以下のデータセットが使用され、PatchTSTの性能が評価されました。

| フェーズ | データセット | 評価指標 (MSE) | 備考 |
|---|---|---|---|
| **直接予測** | Electricity (ソースドメイン) | 0.1316 | PatchTST論文のSOTA結果に近似 |
| **転移学習 (ゼロショット)** | ETTh1 (ターゲットドメイン) | 0.3728 | 事前学習モデルをETTh1に直接適用 |
| **転移学習 (リニアプロービング)** | ETTh1 (ターゲットドメイン) | 0.3565 | バックボーンを凍結し、線形層のみを訓練。元の論文のSOTA結果を上回る |
| **転移学習 (フルファインチューニング)** | ETTh1 (ターゲットドメイン) | 0.3542 | 全てのパラメータを訓練。リニアプロービングからわずかな改善 |

## 引用（Notable quotes）
*   "A Time Series is Worth 64 Words: Long-term Forecasting with Transformers" (PatchTSTの論文タイトル)
*   "The MSE of 0.131 is very close to the value reported for the Electricity dataset in the original PatchTST paper." (電力データセットでのPatchTSTの性能について)
*   "As can be seen, by only training a simple linear layer on top of the frozen backbone, the MSE decreased from 0.370 to 0.357, beating the originally reported results!" (リニアプロービングの成果について)

## リスクと課題
*   **ハイパーパラメータ調整の必要性**: `context_length`、`patch_length`、`d_model`などのモデル設定は、特定のアプリケーションやデータセットに応じて最適化が必要です。
*   **リソース要件**: `num_workers`や`batch_size`は、利用可能なCPUコア数やGPUメモリに依存するため、環境に応じた調整が求められます。
*   **転移学習の改善度合い**: 特定のデータセット（例：ETTh1）では、フルファインチューニングがリニアプロービングと比較して大幅な改善をもたらさない場合があります。他のデータセットではより顕著な改善が見られる可能性もあります。

## 今後の見通し/アクション
*   **PatchTSTの普及促進**: 本ガイドは、PatchTSTモデルのHugging Faceエコシステム内での採用を加速させることを目的としています。
*   **開発者の導入支援**: 開発者はこのステップバイステップガイドを参考に、自身の時系列予測タスクにPatchTSTを容易に導入し、実験を行うことができます。
*   **多様なユースケースへの適用**: Hugging Face TransformersとIBM tsfmパッケージの組み合わせにより、様々な時系列データセットや予測シナリオでのPatchTSTの性能検証と最適化が期待されます。

## Source URL（必須）
https://huggingface.co/blog/patchtst
