---
title: "Stable Diffusion XL on Mac with Advanced Core ML Quantization"
title_ja: "Stable Diffusion XL、MacでCore ML高度量子化を実現"
source_url: "https://huggingface.co/blog/stable-diffusion-xl-coreml"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceとAppleは協力し、Stable Diffusion XL (SDXL) をApple Silicon MacでCore MLを介して実行可能にしました。特に、モデルサイズを大幅に削減しつつ品質劣化を最小限に抑える「Mixed-Bit Palettization」という高度な量子化技術を導入。これにより、SDXLモデルをローカルでより効率的に、かつプライバシーを保護しながら実行できるようになりました。Core MLへの移植、変換ツール、デモアプリ、および事前計算された量子化レシピがオープンソースで提供されています。

## 重要ポイント
*   **SDXLのCore ML移植とApple Silicon対応**: 高品質なSDXLモデルがApple Silicon MacでCore MLを介して動作するようになりました。
*   **Mixed-Bit Palettizationによる大幅なモデル圧縮**: レイヤーごとに最適なビット数を適用することで、モデルサイズを最大71%削減（例: 4.8GBから1.4GBへ、実効4.5ビット相当）しつつ、画像生成品質を高く維持します。
*   **ローカル実行の最適化**: モデルサイズの削減とパフォーマンス向上により、プライバシー、利便性、実験のしやすさといったローカル実行のメリットを享受できます。
*   **オープンソースリソースの提供**: 変換ツール、デモアプリ、事前計算された量子化レシピ、およびCore ML版SDXLモデルが公開され、開発者やユーザーがすぐに利用・実験できます。

## 詳細レポート
### What happened
Stable Diffusion XL (SDXL) がCore MLに移植され、Apple Silicon Macで実行可能になりました。この取り組みの一環として、モデルサイズを大幅に削減する「Mixed-Bit Palettization」という新しい高度な量子化技術が導入されました。これにより、SDXLの大型化によるコンシューマーハードウェアでの実行困難という課題が解決され、ローカルでの効率的な画像生成が可能になります。

### 背景
SDXLは高解像度・高品質な画像を生成できる一方で、モデルサイズが大きく、従来のコンシューマーハードウェアでの実行が困難でした。しかし、プライバシー、利便性、実験のしやすさ、無制限利用といった理由から、機械学習モデルをローカルで実行したいという強い需要がありました。これに応えるため、AppleとHugging Faceが協力し、Apple Silicon上でのSDXLの最適化に取り組みました。

### 影響
*   **Apple Siliconユーザー**: SDXLをMac上でより高速かつ効率的にローカル実行できるようになります。
*   **開発者**: SwiftネイティブアプリにSDXLを統合しやすくなります。
*   **モデルのアクセシビリティ**: 大規模モデルのローカル実行が容易になり、より多くのユーザーが高度な画像生成技術を利用できるようになります。
*   **モデルの柔軟性**: ファインチューンされたSDXLモデルもCore MLに変換し、Mixed-Bit Palettizationを適用できます。

### 関係者
*   **Apple**: Core MLフレームワークの開発、変換・推論リポジトリの更新。
*   **Hugging Face**: SDXLモデルの提供、デモアプリの更新、Mixed-Bit Palettization技術の探求と実装。
*   **Stability AI**: Stable Diffusion XLモデルの開発元。

### データ
*   **モデルサイズ削減**:
    *   量子化なしのSDXL Core MLモデル: 4.8 GB
    *   Mixed-Bit Palettization適用モデル (実効4.5ビット相当): 1.4 GB (71%削減)
*   **品質指標 (PSNR)**:
    *   オリジナル (float16): 82.2 dB
    *   線形8ビット量子化: 66.025 dB
    *   混合ビットパレタイゼーション (平均6.55ビット): 79.9 dB
    *   混合ビットパレタイゼーション (平均4.50ビット): 75.8 dB
    *   混合ビットパレタイゼーション (平均3.41ビット): 71.7 dB
*   **Apple Siliconデバイスでのパフォーマンス (macOS 14 public beta, ORIGINAL attention)**:

| Device           | --compute-unit | --attention-implementation | End-to-End Latency (s) | Diffusion Speed (iter/s) |
| :--------------- | :------------- | :------------------------- | :--------------------- | :----------------------- |
| MacBook Pro (M1 Max) | CPU_AND_GPU    | ORIGINAL                   | 46                     | 0.46                     |
| MacBook Pro (M2 Max) | CPU_AND_GPU    | ORIGINAL                   | 37                     | 0.57                     |
| Mac Studio (M1 Ultra) | CPU_AND_GPU    | ORIGINAL                   | 25                     | 0.89                     |
| Mac Studio (M2 Ultra) | CPU_AND_GPU    | ORIGINAL                   | 20                     | 1.11                     |

## 引用（Notable quotes）
*   「quality is still great.」 (4.5ビット相当の圧縮モデルについて)
*   「This technique is great for Stable Diffusion XL because we can keep about the same UNet size even though the number of parameters tripled with respect to the previous version.」

## リスクと課題
*   **リファイナー段階の未移植**: 現在、SDXLのリファイナー段階はCore MLに移植されていません。
*   **分析フェーズの計算コスト**: Mixed-Bit Palettizationの分析フェーズはGPUを必要とし、複数回の推論実行が必要なため時間がかかります。
*   **品質劣化の可能性**: 積極的な圧縮（例: 平均3.41ビット）では、PSNRは維持されても、プロンプトへの忠実度や画像内の特定の詳細が失われる可能性があります（例: サーフィン犬のボードがなくなる）。使用ケースに応じた評価が必要です。
*   **OS要件**: Apple Silicon Macで動作させるには、macOS 14のパブリックベータ版が必要です。

## 今後の見通し/アクション
*   **コミュニティによるファインチューンモデルの変換**: コミュニティが様々なドメイン向けのファインチューンモデルをCore MLに変換し、Hugging Face Hubで共有することが期待されます。
*   **ユーザーによるMixed-Bit Palettizationの適用**: 提供されたスクリプトと事前計算されたレシピを利用して、ユーザーは自身のStable DiffusionまたはStable Diffusion XLモデルに混合ビットパレタイゼーションを適用し、実験できます。
*   **継続的な研究開発**: AppleとHugging Faceは、今後もMLモデルのローカル実行における最適化と圧縮技術の探求を続けるでしょう。

## Source URL
https://huggingface.co/blog/stable-diffusion-xl-coreml
