---
title: "Patch Time Series Transformer in Hugging Face"
title_ja: "Hugging FaceにPatch Time Series Transformer 時系列予測を強化"
source_url: "https://huggingface.co/blog/patchtst"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、ICLR 2023で発表された時系列予測モデル「PatchTST」のHugging Face Transformersライブラリでの利用方法を解説しました。本記事では、電力データセットでの直接予測と、電力データで事前学習したモデルをETTh1データセットに転移学習させる（ゼロショット、線形プロービング、フルファインチューニング）具体的な手順と結果を提示し、PatchTSTの高い予測性能と転移学習による汎用性を実証しています。

## 重要ポイント

*   **PatchTSTの基本**: 時系列データをサブシリーズレベルの「パッチ」に分割し、Transformerに入力トークンとして与えることで、長期時系列予測の精度と効率を向上させるモデルです。
*   **主要な特徴**:
    *   **パッチ化**: ローカルな意味情報を保持し、アテンションマップの計算量とメモリ使用量を削減し、より長い履歴を扱えるようにします。
    *   **チャネル独立性**: 各ユニバリアント時系列が同じ埋め込みとTransformer重みを共有し、グローバルなユニバリアントモデルとして機能します。
*   **Hugging Faceでの利用**: Hugging Face TransformersライブラリとIBMの`tsfm`パッケージを組み合わせることで、PatchTSTモデルのインストール、データ前処理、学習、評価が容易に行えます。
*   **直接予測の成功**: ElectricityデータセットでPatchTSTを直接学習・評価し、原論文に匹敵する高い予測精度（MSE 0.131）を達成しました。
*   **転移学習の有効性**: Electricityデータで事前学習したモデルをETTh1データセットに適用し、ゼロショット予測、線形プロービング、フルファインチューニングの各手法で良好な結果を示しました。特に線形プロービングとフルファインチューニングにより、ゼロショット予測よりも性能が向上しました。

## 詳細レポート

### What happened/背景

Hugging Faceは、2023年のICLRで発表された「A Time Series is Worth 64 Words: Long-term Forecasting with Transformers」論文で提案されたPatchTSTモデルを、Hugging Face Transformersライブラリで利用するための詳細なガイドを公開しました。このガイドは、PatchTSTのインストールから、具体的な時系列予測タスク（直接予測と転移学習）への適用方法までをステップバイステップで説明しています。PatchTSTは、時系列データを固定長のパッチに分割してTransformerに入力することで、長期予測における計算効率と予測精度を向上させることを目指しています。

### 影響

本ガイドにより、研究者や開発者はHugging Faceのエコシステム内でPatchTSTモデルを容易に導入・活用できるようになります。特に、転移学習のデモンストレーションは、特定のドメインで学習した知識を他のドメインに効率的に転用できる可能性を示しており、時系列予測モデルの汎用性と適用範囲を広げることに貢献します。これにより、データが限られている新しい時系列タスクに対しても、事前学習済みモデルを活用して迅速に高性能な予測モデルを構築できる道が開かれます。

### 関係者

*   **Hugging Face**: PatchTSTモデルをTransformersライブラリに統合し、利用ガイドを公開。
*   **IBM**: 時系列データの前処理を支援する`tsfm`（Time Series Foundation Model）パッケージを提供。
*   **Yuqi Nie, Nam H. Nguyen, Phanwadee Sinthong, Jayant Kalagnanam**: PatchTSTモデルの原論文著者。

### データ

*   **ソースドメイン（事前学習）**: Electricityデータセット (電力消費量データ)
*   **ターゲットドメイン（転移学習）**: ETTh1データセット (電気変圧器の負荷データ)

### 具体的な手順と結果

記事では、以下の手順でPatchTSTモデルの学習と評価を行いました。

1.  **インストール**: Hugging Face TransformersとIBM `tsfm`パッケージをインストール。
2.  **Part 1: Electricityデータセットでの直接予測**:
    *   Electricityデータセットをロードし、学習、検証、テストセットに分割。
    *   PatchTSTモデル（`context_length=512`, `forecast_horizon=96`, `patch_length=16`など）を設定し、Hugging Face `Trainer`で学習。
    *   テストセットでの評価結果: **MSE = 0.13163**。これは原論文の報告値に近い性能です。
3.  **Part 2: ETTh1データセットへの転移学習**:
    *   Electricityで事前学習したモデルをロード。
    *   ETTh1データセットをロードし、学習、検証、テストセットに分割。
    *   以下の3つの転移学習戦略で評価を実施。

**予測結果の比較:**

| 予測手法           | データセット | 評価指標 (MSE) |
| :----------------- | :----------- | :------------- |
| 直接予測           | Electricity  | 0.13163        |
| ゼロショット予測   | ETTh1        | 0.37287        |
| 線形プロービング   | ETTh1        | 0.35652        |
| フルファインチューン | ETTh1        | 0.35423        |

線形プロービングとフルファインチューニングにより、ETTh1データセットでの予測性能がゼロショット予測から改善されました。

## 引用（Notable quotes）

*   "A Time Series is Worth 64 Words: Long-term Forecasting with Transformers by Yuqi Nie, Nam H. Nguyen, Phanwadee Sinthong, Jayant Kalagnanam and presented at ICLR 2023."
*   "The patching design naturally has three-fold benefit: local semantic information is retained in the embedding; computation and memory usage of the attention maps are quadratically reduced given the same look-back window via strides between patches; and the model can attend longer history via a trade-off between the patch length (input vector size) and the context length (number of sequences)."
*   "By zero-shot, we mean that we test the performance in the target domain without any additional training. We hope that the model gained enough knowledge from pretraining which can be transferred to a different dataset."

## リスクと課題

*   **データ特性の乖離**: 転移学習の成功は、ソースドメインとターゲットドメインのデータ特性の類似性に依存します。乖離が大きい場合、期待通りの性能向上が得られない可能性があります。
*   **ハイパーパラメータチューニング**: `context_length`、`patch_length`、Transformerの層数や次元など、多くのハイパーパラメータが存在し、最適な設定を見つけるには試行錯誤が必要です。
*   **計算リソース**: 大規模な時系列データや複雑なモデル設定の場合、トレーニングにはGPUなどの高性能な計算リソースが依然として必要となります。
*   **モデルの解釈性**: Transformerベースのモデルは高い予測性能を持つ一方で、その内部動作の解釈は困難な場合があり、ビジネス上の意思決定に利用する際の透明性に課題が残る可能性があります。

## 今後の見通し/アクション

Hugging Faceは、本ガイドを通じてPatchTSTモデルの利用を促進し、時系列予測のユースケースにおける採用を容易にすることを目指しています。ユーザーは本コンテンツを参考に、自身のプロジェクトにPatchTSTを迅速に導入し、その高性能と転移学習能力を活用することが期待されます。今後は、さらに多様なデータセットやドメインへの適用事例の共有、モデルのさらなる最適化、コミュニティからのフィードバックを取り入れた機能強化などが進められるでしょう。

## Source URL

https://huggingface.co/blog/patchtst
