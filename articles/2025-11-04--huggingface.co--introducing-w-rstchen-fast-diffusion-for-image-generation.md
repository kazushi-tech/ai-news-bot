---
title: "Introducing Würstchen: Fast Diffusion for Image Generation"
title_ja: ""
source_url: "https://huggingface.co/blog/wuerstchen"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Würstchenは、極めて高い潜在空間圧縮（42倍）と独自の2段階デコーダー、3段階の学習プロセスを特徴とする新しい拡散モデルです。これにより、Stable Diffusion XLと比較して、より高速な画像生成と大幅なメモリ使用量削減を実現し、トレーニングコストも最大16分の1に削減されます。Diffusersライブラリに完全に統合されており、PyTorch 2.0のSDPAや`torch.compile`などの最適化が自動的に適用されます。

## 重要ポイント

*   **超高空間圧縮**: 従来の限界（16倍）を大きく超える42倍の空間圧縮を達成し、トレーニングと推論の計算コストを大幅に削減。
*   **高速かつ効率的**: Stable Diffusion XLよりも高速な画像生成と少ないメモリ使用量で動作。
*   **低トレーニングコスト**: Würstchen v1はStable Diffusion 1.4の約16分の1、Würstchen v2は6分の1のGPU時間でトレーニング可能。
*   **Diffusers統合**: Hugging FaceのDiffusersライブラリに完全統合され、PyTorch 2.0のSDPA (Flash Attention) や`torch.compile`などの最適化が容易に利用可能。
*   **アクセス性**: 低コストで高性能なモデルを提供することで、より多くの研究者や組織が画像生成モデルを開発・利用できる機会を拡大。

## 詳細レポート

Würstchenは、テキストから画像を生成する新しい拡散モデルとして発表されました。既存の拡散モデルが高解像度画像生成において高い計算コストとメモリ要件を持つ中、より高速かつ効率的なモデルが求められていた背景があります。

**技術詳細:**
Würstchenは、テキスト条件付けコンポーネントが非常に圧縮された潜在空間で動作する点が特徴です。
*   **モデル構造**: Stage A (VQGAN) と Stage B (Diffusion Autoencoder) からなる「Decoder」と、高度に圧縮された潜在空間で学習される「Stage C (Prior)」の3つのモデルで構成されます。
*   **圧縮率**: 従来の一般的な空間圧縮率（4倍〜8倍、最大16倍）を大きく上回る42倍の空間圧縮を実現し、詳細な画像再構築を可能にしました。
*   **性能比較（トレーニングコスト）**:
    | モデル | 解像度 | GPU時間 | SD1.4比 |
    | :---------------- | :------- | :-------- | :-------- |
    | Würstchen v1 | 512x512 | 9,000 | 16倍削減 |
    | Würstchen v2 | 1536x1536 | 24,602 | 6倍削減 |
    | Stable Diffusion 1.4 | 512x512 | 150,000 | 基準 |
*   **推論速度**: Stable Diffusion XLと比較して、より高速な推論と少ないメモリ使用量を実現します。
*   **対応画像サイズ**: 1024x1024から1536x1536の解像度でトレーニングされており、1024x2048のような解像度でも良好な出力が期待できます。Prior (Stage C) は新しい解像度への適応が速く、ファインチューニングが安価です。

**関係者:**
*   **Hugging Face**: モデルの発表、Diffusersライブラリへの統合、デモ提供。
*   **Stability AI**: モデルトレーニングに必要な計算リソースを提供。

**利用方法:**
Hugging Face Hubのデモを通じて試用できるほか、Diffusersライブラリに完全に統合されているため、Pythonコードを通じて簡単に利用できます。

**最適化技術:**
*   **Flash Attention**: PyTorch 2.0以降の`torch.nn.functional.scaled_dot_product_attention` (SDPA) を自動的に利用し、高性能かつメモリ効率の高いAttentionメカニズムを提供します。PyTorch 1.xユーザー向けにはxFormersライブラリもサポート。
*   **Torch Compile**: `torch.compile`をPriorとDecoderのメインモデルに適用することで、初回コンパイル後に推論速度を大幅に向上させることができます。
*   **Diffusers統合によるその他の機能**: モデルオフロード、シーケンシャルCPUオフロードによるメモリ節約、Compelライブラリによるプロンプト重み付け、Apple Silicon (mpsデバイス) サポートなどが含まれます。

## 引用（Notable quotes）

*   「Compressing data can reduce computational costs for both training and inference by orders of magnitude.」
*   「Through its novel design, it achieves a 42x spatial compression! This had never been seen before, because common methods fail to faithfully reconstruct detailed images after 16x spatial compression.」
*   「Würstchen’s biggest benefits come from the fact that it can generate images much faster than models like Stable Diffusion XL, while using a lot less memory!」

## リスクと課題

*   `torch.compile`を使用する場合、初回推論時にモデルのコンパイルに最大2分程度の時間がかかる可能性があります。ただし、これは一度限りの処理であり、以降の推論は高速化されます。
*   記事中には、モデルの利用や開発におけるその他の具体的なリスクや課題は明記されていません。

## 今後の見通し/アクション

*   Würstchenの登場により、より多くの研究者や組織が、従来の高性能モデルよりもはるかに低いコストで、高品質な画像生成モデルの研究開発や利用を進めることが可能になります。
*   ユーザーはHugging Face Hubで提供されているチェックポイントやデモ、またはDiffusersライブラリを通じてモデルを試用し、その性能を体験できます。
*   モデルのドキュメント、Discordコミュニティ、GitHubリポジトリを通じて、さらなる情報収集やプロジェクトへの貢献が推奨されています。

## Source URL
https://huggingface.co/blog/wuerstchen
