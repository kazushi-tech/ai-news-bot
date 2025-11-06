---
title: "Stable Diffusion XL on Mac with Advanced Core ML Quantization"
title_ja: "SDXL、Macで快適動作 Core ML高度量子化"
source_url: "https://huggingface.co/blog/stable-diffusion-xl-coreml"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
AppleとHugging Faceは協力し、Stable Diffusion XL (SDXL) をCore MLに移植し、Mac上での実行を最適化しました。特に「混合ビットパレタイゼーション」という先進的な量子化技術を導入することで、モデルサイズを最大71%削減（4.8GBから1.4GBへ）しつつ、高品質な画像生成を維持し、Apple Silicon Macでの高速なローカル推論を可能にしました。関連するツール、モデル、スクリプトは全てオープンソースで提供されています。

## 重要ポイント
*   **Stable Diffusion XLのCore MLへの移植**: 高品質なSDXLモデルがApple Silicon Macでネイティブに動作するようになりました。
*   **混合ビットパレタイゼーションの導入**: レイヤーごとに最適なビット深度を適用する先進的な量子化技術により、モデルサイズを大幅に削減（最大71%）し、品質劣化を最小限に抑えます。
*   **パフォーマンス向上とサイズ削減**: 4.5ビット相当の圧縮により、UNetモデルのサイズを4.8GBから1.4GBに削減。MacBook Pro (M2 Max) で37秒、Mac Studio (M2 Ultra) で20秒のエンドツーエンド推論速度を達成。
*   **オープンソースでの提供**: Core ML変換・推論ライブラリ、デモアプリ、Core ML版SDXLモデル、混合ビットパレタイゼーションレシピ、関連スクリプトが全て公開されています。
*   **ファインチューンモデルへの適用**: ユーザーは自身のファインチューンモデルにも混合ビットパレタイゼーションを適用できます。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
AppleとHugging Faceは共同で、最新の画像生成モデルStable Diffusion XL (SDXL) をAppleの機械学習フレームワークCore MLに移植し、最適化しました。この取り組みの核となるのは、モデルのサイズとパフォーマンスを大幅に改善する「混合ビットパレタイゼーション」という先進的な量子化技術です。これにより、SDXLはApple Siliconを搭載したMac上で、高品質を維持しつつ、より高速かつ効率的に実行できるようになりました。

### 背景
Stable Diffusion XLは、1024x1024の高解像度画像生成、プロンプト追従性の向上、ノイズスケジューラの改善など、多くの点で進化を遂げた強力なモデルです。しかし、その高性能化に伴いモデルサイズも増大し、従来のコンシューマー向けハードウェア（特にGPU RAMが16GB未満の環境）での実行が困難になっていました。プライバシー、利便性、実験のしやすさ、無制限の使用といった理由から、MLモデルをローカルで実行したいという強い需要が存在していました。

### 影響
*   **Mac上でのSDXL実行の実現**: Apple Silicon Macユーザーが、高性能なSDXLモデルをローカルで実行できるようになりました。
*   **モデルサイズの大幅削減**: 混合ビットパレタイゼーションにより、UNetモデルのサイズが4.8GBから1.4GBへと71%削減され、ストレージとメモリのフットプリントが大幅に減少しました。
*   **品質とパフォーマンスのバランス**: 圧縮後も画像生成品質は高く維持され、Macデバイス上での推論速度も実用的なレベルに向上しました。
*   **開発者エコシステムの強化**: SwiftネイティブアプリでのSDXL利用が可能になり、開発者はCore MLを活用して独自のアプリケーションを構築できます。
*   **オープンソースコミュニティへの貢献**: 変換ツール、最適化済みモデル、レシピ、スクリプトが公開され、コミュニティがさらに発展させる基盤が提供されました。

### 関係者
*   **Apple**: Core MLフレームワークの開発、SDXLのCore ML変換・推論ライブラリ (`apple/ml-stable-diffusion`) の提供。
*   **Hugging Face**: MLモデルハブの運営、Core ML版SDXLモデルの公開、デモアプリ (`huggingface/swift-coreml-diffusers`) の提供。
*   **Stability AI**: Stable Diffusion XLモデルの開発元。

### データ
**混合ビットパレタイゼーションによるモデルサイズ削減と品質比較:**
| レシピ | 平均ビット数/パラメータ | モデルサイズ削減 | PSNR (dB) |
| :------------------------------ | :-------------------- | :------------- | :-------- |
| オリジナル (float16)            | 16                    | 0%             | 82.2      |
| 線形8ビット量子化               | 8                     | -              | 66.025    |
| 混合ビットパレタイゼーション    | 6.55                  | -              | 79.9      |
| 混合ビットパレタイゼーション    | 4.50                  | 71%            | 75.8      |
| 混合ビットパレタイゼーション    | 3.41                  | -              | 71.7      |

**Apple Silicon MacでのSDXLパフォーマンス:**
| Device             | --compute-unit | --attention-implementation | End-to-End Latency (s) | Diffusion Speed (iter/s) |
| :----------------- | :------------- | :------------------------- | :--------------------- | :----------------------- |
| MacBook Pro (M1 Max) | CPU_AND_GPU    | ORIGINAL                   | 46                     | 0.46                     |
| MacBook Pro (M2 Max) | CPU_AND_GPU    | ORIGINAL                   | 37                     | 0.57                     |
| Mac Studio (M1 Ultra) | CPU_AND_GPU    | ORIGINAL                   | 25                     | 0.89                     |
| Mac Studio (M2 Ultra) | CPU_AND_GPU    | ORIGINAL                   | 20                     | 1.11                     |

## 引用（Notable quotes）
「Mixed-bit palettization, an advanced compression technique that achieves important size reductions while minimizing and controlling the quality loss you incur.」
（混合ビットパレタイゼーションは、重要なサイズ削減を達成しつつ、発生する品質損失を最小限に抑え、制御する高度な圧縮技術です。）

## リスクと課題
*   **macOS 14 Public Betaの要件**: 現在、SDXLのCore ML版はmacOS 14のパブリックベータ版でのみ動作します。
*   **リファイナー未移植**: SDXLのリファイナー段階は、まだCore MLに移植されていません。
*   **分析フェーズの時間とリソース**: 混合ビットパレタイゼーションの分析フェーズは、GPUを必要とし、完了までに時間がかかります。
*   **高圧縮時の品質劣化**: 非常に高い圧縮率（例：3.41ビット相当）では、PSNR値は維持されても、プロンプトへの忠実度や画像の詳細が損なわれる可能性があります（例：サーフボードが消える）。

## 今後の見通し/アクション
*   **コミュニティによるファインチューンモデルの展開**: コミュニティがSDXLのファインチューンモデルを開発し、Core MLに変換して公開することが期待されます。
*   **ユーザーによるカスタマイズ**: ユーザーは提供されたスクリプト (`mixed_bit_compression_pre_analysis.py`, `mixed_bit_compression_apply.py`) を使用して、自身のStable DiffusionまたはStable Diffusion XL Core MLモデルに混合ビットパレタイゼーションを適用し、品質とサイズのトレードオフを調整できます。
*   **Core ML版SDXLの利用**: Hugging Face HubからCore ML版SDXLモデル（ベースモデルおよび混合ビットパレタイゼーション適用済みモデル）をダウンロードし、AppleのSwiftコマンドライン推論アプリやHugging Faceのデモアプリで利用できます。
*   **リファイナーの移植**: 今後、リファイナー段階のCore MLへの移植が進む可能性があります。

## Source URL（必須）
https://huggingface.co/blog/stable-diffusion-xl-coreml
