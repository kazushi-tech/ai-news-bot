---
title: "Introducing Würstchen: Fast Diffusion for Image Generation"
title_ja: "Würstchen、高速画像生成の新モデル発表 低コストも両立"
source_url: "https://huggingface.co/blog/wuerstchen"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Würstchenは、画像生成のための新しい拡散モデルであり、従来のモデルと比較して大幅な高速化と効率化を実現しています。特に、画像を42倍という極めて高い空間圧縮率で潜在空間に表現する独自のアプローチを採用しており、これによりトレーニングと推論の計算コストを劇的に削減します。Stable Diffusion 1.4と比較してトレーニングコストを最大16倍削減し、より少ないメモリで高速な画像生成を可能にすることで、高性能なGPUを持たないユーザーや研究者にも高度なテキスト・トゥ・イメージモデルへのアクセスを広げます。

## 重要ポイント
*   **超高圧縮率**: 独自の2段階圧縮（Stage A: VQGAN, Stage B: Diffusion Autoencoder）により、画像を42倍の空間圧縮率で潜在空間に表現。
*   **高速かつ低コスト**: Stable Diffusion XLと比較して高速な画像生成が可能で、メモリ使用量も少ない。
*   **トレーニングコストの大幅削減**: Würstchen v1はSD1.4の16分の1、v2は6分の1のGPU時間でトレーニング可能。
*   **アクセシビリティ向上**: 低コスト化により、より多くの組織や個人がモデルのトレーニングや利用が可能に。
*   **Diffusers統合**: Hugging Face Diffusersライブラリに完全に統合されており、PyTorch 2 SDPAや`torch.compile`などの最適化が自動適用される。
*   **高解像度対応**: 1024x1024から1536x1536の画像解像度で訓練され、それ以上の解像度へのファインチューニングも安価。

## 詳細レポート
### What happened
Hugging Faceは、画像生成のための新しい拡散モデル「Würstchen」を発表しました。このモデルは、画像を極めて高い圧縮率で潜在空間に表現する革新的な設計を特徴とし、これによりトレーニングと推論の計算コストを大幅に削減します。

### 背景
従来のテキスト・トゥ・イメージモデルは、高解像度画像の生成において膨大な計算リソースと時間を必要としていました。特に、16倍を超える空間圧縮では詳細な画像再構築が困難とされていました。Würstchenは、この課題を克服し、より高速かつ効率的な画像生成モデルを提供することを目指して開発されました。

### 影響
*   **計算コストの削減**: トレーニングに必要なGPU時間を大幅に削減し、研究開発のコストと時間を低減します。
*   **アクセシビリティの向上**: 高価なA100 GPUのような高性能ハードウェアを持たないユーザーでも、高速な画像生成を利用できるようになります。
*   **研究の加速**: より多くの組織や研究者が、最先端のテキスト・トゥ・イメージモデルをトレーニングし、実験を行う機会を得られます。

### 関係者
*   **開発者**: Hugging Face
*   **計算リソース提供**: Stability AI (モデルトレーニングに貢献)

### データ
Würstchenの効率性は、以下のトレーニングコスト比較に明確に示されています。

| モデル名 | 解像度 | トレーニングGPU時間 | コスト削減率 (対SD1.4) |
| :------- | :----- | :------------------ | :---------------------- |
| Würstchen v1 | 512x512 | 9,000 | 16倍 |
| Würstchen v2 | 最大1536x1536 | 24,602 | 6倍 |
| Stable Diffusion 1.4 | 512x512 | 150,000 | - |

Würstchenは、画像を42倍の空間圧縮率で潜在空間にエンコードする独自の2段階圧縮（Stage A: VQGAN、Stage B: Diffusion Autoencoder）を採用しています。これにより、Stage C（Prior）が動作する潜在空間のサイズを大幅に縮小し、計算効率を高めています。

## 引用（Notable quotes）
*   「Compressing data can reduce computational costs for both training and inference by orders of magnitude.」（データの圧縮は、トレーニングと推論の両方で計算コストを桁違いに削減できる。）
*   「Through its novel design, it achieves a 42x spatial compression! This had never been seen before, because common methods fail to faithfully reconstruct detailed images after 16x spatial compression.」（その斬新な設計により、42倍の空間圧縮を実現しています！これはこれまで前例のないことで、一般的な手法では16倍の空間圧縮後には詳細な画像を忠実に再構築できませんでした。）
*   「Würstchen’s biggest benefits come from the fact that it can generate images much faster than models like Stable Diffusion XL, while using a lot less memory!」（Würstchenの最大の利点は、Stable Diffusion XLのようなモデルよりもはるかに高速に画像を生成でき、しかもはるかに少ないメモリを使用することです！）

## リスクと課題
*   **初期コンパイル時間**: `torch.compile`を使用する場合、初回推論時にモデルのコンパイルに最大2分程度の時間がかかる可能性があります。
*   **高圧縮の限界**: 過去のモデルでは16倍を超える空間圧縮で詳細な画像再構築が困難であったように、極端な圧縮率が特定の画像品質や詳細度に影響を与える可能性は常に考慮する必要があります。

## 今後の見通し/アクション
*   **利用の促進**: Hugging Face Diffusersライブラリを通じて、既存のユーザーは容易にWürstchenを利用できます。デモも提供されており、手軽に試すことが可能です。
*   **最適化の活用**: PyTorch 2.0以降のSDPAや`torch.compile`などの最適化技術を活用することで、さらなる性能向上が期待されます。
*   **コミュニティへの貢献**: Hugging Face Hubには複数のチェックポイントが公開されており、ユーザーはこれらを活用して実験やファインチューニングを行うことができます。DiscordコミュニティやGitHubリポジトリを通じて、今後のプロジェクトへの参加やアイデアの貢献が奨励されています。
*   **高解像度対応の進化**: Prior (Stage C) が新しい解像度への適応が速いため、2048x2048などの高解像度へのファインチューニングが計算コストを抑えて可能になる見込みです。

## Source URL
https://huggingface.co/blog/wuerstchen
