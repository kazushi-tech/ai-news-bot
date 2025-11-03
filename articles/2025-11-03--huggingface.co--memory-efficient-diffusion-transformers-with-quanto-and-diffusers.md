---
title: "Memory-efficient Diffusion Transformers with Quanto and Diffusers"
title_ja: "QuantoとDiffusersでディフュージョンTransformerを省メモリ化"
source_url: "https://huggingface.co/blog/quanto-diffusers"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
本記事は、Transformerベースの拡散モデル（DiT）における高いGPUメモリ要件を、Hugging Faceの量子化ツールキットQuantoとDiffusersライブラリを組み合わせて削減する方法を解説しています。FP8やINT8量子化により、推論レイテンシをわずかに増加させながら、大幅なメモリ削減（最大50%以上）を達成できることを示しています。特に、拡散バックボーンに加えてText Encoderを量子化することが効果的であり、Stable Diffusion 3のような複数のText Encoderを持つモデルでの注意点や、H100 GPUでのbfloat16の利点、INT4量子化の可能性と課題についても詳述しています。量子化済みモデルの保存・ロード方法も紹介し、コンシューマーGPUでの大規模モデルの利用促進を目指します。

## 重要ポイント
*   **メモリ要件の課題**: Transformerベースの拡散モデルは高性能だが、モデルの大型化に伴いGPUメモリ要件が増大し、コンシューマーGPUでの利用を困難にしている。
*   **Quantoによる量子化**: PyTorchベースの量子化ツールキットQuantoをDiffusersと連携させることで、品質劣化をほとんど伴わずにモデルのメモリ効率を大幅に改善できる。
*   **Text Encoderの量子化効果**: 拡散バックボーンだけでなく、Text Encoderも量子化することで、メモリ削減効果がさらに顕著になる。PixArt-Sigmaでは約53.6%のメモリ削減を達成。
*   **Stable Diffusion 3の特殊性**: SD3では3つのText Encoderのうち、Text Encoder 2の量子化は推奨されず、Text Encoder 1と3の組み合わせが効果的。
*   **データ型とパフォーマンス**:
    *   **bfloat16**: H100 GPUなどの対応アーキテクチャでは、bfloat16がFP16よりも高速な推論を可能にする。
    *   **qint8**: qfloat8よりも推論レイテンシが改善する傾向があり、QKVプロジェクションの水平融合でさらに加速される。
    *   **qint4**: メモリ消費をさらに削減できるが、ハードウェアサポートがないためレイテンシが大幅に増加し、品質劣化のリスクが高まる。最終層の量子化除外や量子化対応学習 (QAT) が推奨される。
*   **モデルの保存とロード**: 量子化されたDiffusersモデルは簡単に保存・ロードでき、チェックポイントサイズも大幅に削減される（例: PixArt-Sigmaで2.44GBから587MB）。

## 詳細レポート
### What happened
Hugging Faceは、Transformerベースの拡散モデルのメモリ効率を向上させるため、QuantoとDiffusersライブラリの統合を実証しました。これにより、大規模なテキスト-画像生成モデルをより多くのユーザーが利用できるようになります。具体的な手順とパフォーマンス結果が示され、様々な量子化戦略（FP8, INT8, INT4）とその影響が分析されました。

### 背景
近年、高解像度のテキスト-画像生成において、UNetベースのモデルに代わりTransformerベースの拡散バックボーン（Diffusion Transformers, DiT）が台頭しています。これらのモデルはスケーラビリティに優れる一方で、0.6Bから8Bパラメータに及ぶ大型モデルではGPUメモリ要件が非常に高くなります。例えば、Stable Diffusion 3 (SD3) はFP16精度で18.765GBのGPUメモリを必要とし、複数のText Encoderを使用するため、この問題はさらに深刻です。この高いメモリ要件が、コンシューマーGPUでの利用や実験を妨げる要因となっていました。QuantoはPyTorch上に構築された量子化ツールキットであり、LLM分野では普及していますが、拡散モデルへの適用はまだ限定的でした。

### 影響
QuantoとDiffusersの統合により、Transformerベースの拡散モデルのメモリ消費を大幅に削減できることが示されました。これにより、より少ないGPUメモリで大規模モデルの推論が可能になり、コンシューマーGPUでの利用が促進されます。メモリ削減は推論レイテンシのわずかな増加を伴う場合がありますが、多くの場合、そのトレードオフは許容範囲内です。特にText Encoderの量子化がメモリ削減に大きく貢献し、モデル全体のメモリフットプリントを劇的に改善します。

**ベンチマーク環境:**
*   GPU: NVIDIA H100
*   CUDA: 12.2
*   PyTorch: 2.4.0
*   Diffusers: 特定のコミットからインストール
*   Quanto: 特定のコミットからインストール
*   デフォルト精度: FP16 (VAEは量子化せず)
*   対象モデル: PixArt-Sigma, Stable Diffusion 3, Aura Flow (T2I), Latte (T2V)

**主要な実験結果:**

| モデル (バッチサイズ) | 量子化対象 | 量子化タイプ | メモリ (GB) | レイテンシ (秒) | 備考 |
| :-------------------- | :--------- | :----------- | :---------- | :-------------- | :--- |
| PixArt-Sigma (1)      | なし       | FP16         | 12.086      | 1.200           | ベースライン |
| PixArt-Sigma (1)      | Transformer | FP8          | 11.547      | 1.540           | 約4.5%メモリ減 |
| PixArt-Sigma (1)      | Transformer + TE | FP8          | 5.363       | 1.601           | 約53.6%メモリ減 |
| Stable Diffusion 3 (1) | なし       | FP16         | 16.403      | 2.118           | ベースライン |
| Stable Diffusion 3 (1) | Transformer + TE1 + TE3 | FP8          | 8.204       | 2.789           | 約50%メモリ減 |
| PixArt-Sigma (1)      | Transformer + TE | INT8         | 5.363       | 1.538           | QKV融合なし |
| PixArt-Sigma (1)      | Transformer + TE | INT8         | 5.536       | 1.504           | QKV融合あり (レイテンシ改善) |
| PixArt-Sigma (1)      | Transformer + TE | INT4 (BF16)  | 3.058       | 7.604           | メモリ大幅減、レイテンシ大幅増 |

**その他の発見:**
*   **bfloat16の優位性**: H100 GPUでは、FP16よりもbfloat16の方が推論が高速である。INT8/FP8量子化と組み合わせてもこの傾向は維持される。
*   **INT4の課題**: INT4はメモリをさらに削減するが、ハードウェアネイティブサポートがないためレイテンシが大幅に増加する。また、積極的な量子化により画像品質が低下する可能性があり、最終投影層 (`proj_out`) の量子化除外や量子化対応学習 (QAT) が推奨される。

### 関係者
*   **Hugging Face**: Diffusersライブラリ、Optimum、Quantoツールキットの開発元。本記事はHugging Faceのブログで公開され、Sayak Paul氏が執筆、Pedro Cuenca氏がレビューを担当。

## 引用（Notable quotes）
記事中に特筆すべき引用はありません。

## リスクと課題
*   **推論レイテンシの増加**: 量子化は一般的にメモリを削減するが、推論レイテンシがわずかに増加する可能性がある。特にハードウェアサポートのないINT4では大幅なレイテンシ増加が見られる。
*   **品質劣化のリスク**: INT4のような積極的な量子化では、モデルの出力品質が低下する可能性がある。これを軽減するためには、特定の層（例: `proj_out`）を量子化から除外したり、量子化対応学習 (QAT) を行ったりする必要がある。
*   **モデル固有の挙動**: Stable Diffusion 3のように複数のText Encoderを持つモデルでは、一部のText Encoderの量子化がうまく機能しない場合があるため、注意深い検証が必要。
*   **ハードウェアとデータ型の制限**: INT4などの一部の量子化設定は、特定のハードウェア（H100）とデータ型（bfloat16）の組み合わせでのみサポートされる。

## 今後の見通し/アクション
*   **APIの改善**: 将来的には、Diffusersパイプラインの初期化時に量子化済みTransformerモデルを直接渡せるようなAPIの改善が期待されます。
*   **モデルサポートの拡大**: Quantoで保存・ロードがサポートされるDiffusersモデルの数を増やすため、コミュニティからの要望（issueのオープン）が奨励されています。
*   **柔軟な量子化戦略**: ユーザーは、要件に応じて異なるパイプラインモジュールに異なる量子化タイプ（例: Text EncoderにFP8、拡散TransformerにINT8）を適用することが推奨されます。
*   **複合的な最適化**: 量子化とDiffusersの他のメモリ最適化技術（例: `enable_model_cpu_offload()`）を組み合わせることで、さらなる最適化が可能。
*   **品質回復のためのQAT**: 品質劣化が懸念される場合は、Quantoがサポートする量子化対応学習 (QAT) を検討することが推奨されます。

## Source URL
https://huggingface.co/blog/quanto-diffusers
