---
title: "The AI tools for Art Newsletter - Issue 1"
title_ja: "AIアートツール最前線 創刊号 2024年の進化と未来を展望"
source_url: "https://huggingface.co/blog/ai-art-newsletter-jan-25"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
2024年はAIアート分野で画像生成、動画生成、音声生成において目覚ましい進歩を遂げた年でした。特に画像生成ではDiffusion Transformer (DiT) アーキテクチャとFlow Matchingへのパラダイムシフト、そしてFlux.1によるSOTA達成が注目されます。動画生成はOpenAI Soraが期待値を高め、オープンソースモデルも急速に進化。音声生成もテキストから音声、音楽生成へと大きく発展しました。2025年はオープンソースの動画・音声モデルがさらにキャッチアップし、新たなモダリティへの注力が期待されています。Hugging Faceはこれらの進展を月刊ニュースレターで発信していきます。

## 重要ポイント
*   **画像生成のパラダイムシフト**: 2024年は画像生成モデルがUnetベースからDiTアーキテクチャとFlow Matchingへと移行し、Flux.1がMidjourney v6.0やDALL·E 3を超えるSOTAを達成しました。
*   **パーソナライゼーションとゼロショット技術**: Textual InversionやDreamBoothに加え、IP adapter FaceID、InstantID、Photomakerなどのゼロショット技術により、最適化なしで高品質なポートレート生成が可能になりました。
*   **動画生成の急速な進展**: OpenAI Soraが動画モデルの可能性を大きく広げ、CogVideoX、Mochiなどのオープンソースモデルも急速に発展しましたが、計算資源の制約が課題です。
*   **音声・音楽生成のブレイクスルー**: 音声生成は複雑な信号処理とデータ不足の課題を乗り越え、テキストから音声、さらにはYuEのようなフル楽曲生成モデルが登場し、2025年にはさらなる発展が期待されます。
*   **オープンソースコミュニティの貢献**: 多様なクリエイティブAIツール（Flux fine-tuning、Face to All、TRELLISなど）がコミュニティの協力によって開発され、AIアートのアクセシビリティを向上させました。
*   **2025年の展望**: オープンソースの動画・音声モデルが画像生成モデルの成熟に続き、効率的な計算と量子化の進歩により大きな飛躍を遂げると予測されています。

## 詳細レポート
### What happened/背景
AIアートの分野は過去数年で劇的に進化し、特にオープンソースモデルとツールがクリエイティブ表現をかつてないほど身近なものにしました。2024年は、画像生成、動画生成、音声生成といった主要なモダリティで技術的なブレイクスルーが相次ぎ、その進展は驚異的でした。本レポートは、2024年の主要なマイルストーンとツールを振り返り、2025年の展望を提示するものです。

### 画像生成
*   **Text-to-image生成**:
    *   **アーキテクチャのシフト**: 従来のUnetベースからDiffusion Transformer (DiT) アーキテクチャへのパラダイムシフトが起こり、目的関数もFlow Matchingへと移行しました。
    *   **主要モデル**: Stability AIのStable Diffusion 3がこのシフトを最初に発表し、HunyuanDiTが初のオープンソースDiTモデルとなりました。その後、AuraFlow、Flux.1、Stable Diffusion 3.5が続きました。
    *   **SOTA達成**: Flux.1は、Midjourney v6.0やDALL·E 3 (HD)といったクローズドソースモデルをベンチマークで上回り、新たなState-of-the-Art (SOTA) を達成しました。
*   **パーソナライゼーションとスタイル化**:
    *   **基盤技術**: Textual InversionやDreamBooth、LoRAなどの技術がテキストから画像生成モデルへの新しい概念の導入を可能にしました。
    *   **SDXLの重要性**: Stable Diffusion XL (SDXL) は、パーソナライゼーションにおける重要な基盤モデルとなり、多くの人気技術やモデルがSDXLをベースにしています。
    *   **ゼロショット技術の台頭**: 2024年は、IP adapter FaceID、InstantID、Photomakerなど、単一の参照画像と最適化なしで高品質なポートレートを生成できるゼロショット技術が登場しました。
    *   **画像編集と制御生成**: Canny/Depth/Poseなどの制約を用いた画像生成も、基盤モデルの品質向上とセマンティックな役割の理解深化により進歩しました（Instant Style、B-LoRA）。
    *   **今後の課題**: DiTベースモデルにおけるセマンティックな役割の理解がまだ不十分であり、2025年にはこの理解が進むことで、次世代画像生成モデルの可能性がさらに広がると期待されています。

### 動画生成
*   **急速な進展**: 1年前と比較して大きく進歩しましたが、画像生成にはまだ及ばない点があります。
*   **Soraの影響**: OpenAIのSoraは、動画モデルの能力に対する期待値を劇的に変え、その可能性を広く認識させました。
*   **オープンソースの進展**: CogVideoX、Mochi、Allegro、LTX Video、HunyuanVideoなどのオープンソース動画生成モデルが多数登場しました。
*   **課題**: 動画生成はモーションの品質、一貫性、整合性が必要なため、画像生成よりも本質的に困難です。また、膨大な計算資源とメモリを必要とし、高い生成レイテンシがローカルでの利用を妨げています。

### 音声生成
*   **飛躍的進歩**: 過去1年間で、単純な音から歌詞付きの完全な楽曲まで生成できるようになりました。
*   **課題と克服**: 音声信号は複雑で多面的であり、高度な数学的モデルと希少なトレーニングデータが必要ですが、これらの課題を乗り越えて進歩しました。
*   **主要リリース**: 2024年には、テキストから音声生成モデルとしてOuteTTS、IndicParlerTTS、音声認識モデルとしてOpenAIのWhisper large v3 turboがオープンソースでリリースされました。
*   **2025年の展望**: 2025年1月だけでも、Kokoro、LLasa TTS、OuteTTS 0.3といったテキストから音声モデル、JASCO、YuEといった音楽モデルが多数リリースされており、年間を通じてさらなる発展が期待されます。

### クリエイティブツール
オープンソースコミュニティの共同作業により、多くの革新的なクリエイティブAIツールが誕生しました。

| ツール名 | カテゴリ | 特徴 |
|---|---|---|
| **Flux fine-tuning** | 画像生成 | ostrisのAI-toolkitによるFluxモデルのファインチューニング |
| **Face to All** | 画像生成 | Instant IDとControlNet、SDXL LoRAを組み合わせた高品質なゼロショットポートレート生成 |
| **Flux style shaping** | 画像生成 | ComfyUIワークフローに基づき、Flux [dev] ReduxとDepthを組み合わせたスタイル転送・錯視作成 |
| **Outpainting with diffusers** | 画像編集 | Diffusers Stable Diffusion XL Fill PipelineとSDXL union controlnetによるシームレスな画像拡張 |
| **Live portrait, Face Poke** | 動画生成 | 静止画に表情や動きを加えるツール |
| **TRELLIS** | 3D生成 | 多用途で高品質な3Dアセット作成モデル |
| **IC Light** | 画像編集 | 「Imposing Consistent Light」を意味し、前景条件付きの再ライティングツール |

### 2025年1月のオープンソースリリース
2025年の幕開けから、以下の注目すべきオープンソースモデルがリリースされました。

| カテゴリ | モデル/ツール | 特徴 |
|---|---|---|
| **音楽生成** | YuE | フル楽曲生成のためのオープンソース基盤モデル。Apache 2.0ライセンスでSunoに匹敵する結果。 |
| **3D生成** | Hunyuan 3D-2, SPAR3D, DiffSplat | TRELLISに続く、3Dランドスケープを席巻する3D生成モデル。 |
| **画像生成** | Lumina-Image 2.0 | 2Bパラメータで12BのFlux.1 [dev]に匹敵する性能を持つテキストから画像生成モデル。Apache 2.0ライセンス。 |
| **開発ツール** | ComfyUI-to-Gradio | 複雑なComfyUIワークフローをGradioアプリケーションに変換し、Hugging Face Spaces ZeroGPUで無料デプロイする方法を解説。 |

### 関係者
*   **Hugging Face**: 本ニュースレターの発行元 (Poli & Linoy)。
*   **Stability AI**: Stable Diffusion 3をリリースし、DiTアーキテクチャへのシフトを主導。
*   **Google DeepMind**: Flow Matchingに関するブログ記事を推奨。
*   **OpenAI**: Soraをリリースし、動画生成の期待値を大幅に引き上げ。Whisper large v3 turboもリリース。
*   **コミュニティ開発者**: ostris (AI-toolkit), fofr (Face to Allの着想), Nathan Shipley (Flux style shapingのComfyUIワークフロー) など、多くの個人やグループがオープンソースツール開発に貢献。

### データ
*   Flux.1は、Midjourney v6.0、DALL·E 3 (HD)を様々なベンチマークで上回るSOTAを達成。
*   Lumina-Image 2.0は2Bパラメータモデルでありながら、12BのFlux.1 [dev]に匹敵する性能を持つ。

## 引用（Notable quotes）
*   "The AI space is moving so fast it’s hard to believe that a year ago we still struggled to generate people with the correct amount of fingers 😂." (AIの分野は非常に速く動いており、1年前にはまだ指の数が正しい人物を生成するのに苦労していたとは信じがたいほどです。)
*   "Flux [dev] achieved a new state-of-the-art, surpassing popular closed source models like Midjourney v6.0, DALL·E 3 (HD) on various benchmarks." (Flux [dev]は、様々なベンチマークでMidjourney v6.0、DALL·E 3 (HD)のような人気のあるクローズドソースモデルを上回り、新たな最先端を達成しました。)
*   "2024 was definitely the year when generating high quality portraits from reference photos was made possible with as little as a single reference image & without any optimization." (2024年は、たった1枚の参照画像と最適化なしで高品質なポートレートを生成することが可能になった年でした。)
*   "the credit for (some) of the significant leap in AI video generation goes to OpenAI’s sora for changing our expectations of video model capabilities quite radically." (AI動画生成における大きな飛躍の一部は、動画モデルの能力に対する私たちの期待を根本的に変えたOpenAIのSoraに帰するものです。)
*   "2025 is the year for open-source to catch up on video, movement, and audio models, making room for more modalities." (2025年は、オープンソースが動画、動き、音声モデルに追いつき、より多くのモダリティのための余地を作る年となるでしょう。)

## リスクと課題
*   **動画生成の計算資源制約**: 動画生成は、モーションの品質、一貫性、整合性を確保するために、画像生成よりもはるかに多くの計算資源とメモリを必要とします。これにより、高い生成レイテンシが発生し、多くのオープンソース動画モデルがコミュニティのハードウェアではアクセスしにくい状況です。
*   **DiTモデルの理解不足**: DiTアーキテクチャへの移行が進む中、Unetと比較してDiTの異なるコンポーネントが持つセマンティックな役割の理解がまだ不足しており、これがDiTベースモデルの品質向上を妨げる可能性があります。
*   **音声生成の複雑性とデータ希少性**: 音声信号は複雑で多面的なため、テキストや画像を生成するモデルよりも洗練された数学的モデルが必要です。また、トレーニングデータの希少性も課題となっています。

## 今後の見通し/アクション
*   **オープンソースの動画・音声モデルの進化**: 2025年は、オープンソースの動画、動き、音声モデルが大きくキャッチアップする年となるでしょう。効率的な計算と量子化の進歩により、これらの分野で顕著な飛躍が期待されます。
*   **新たなモダリティへの注力**: 画像生成モデルが「自然な」高原に達しつつあるため、今後は他のタスクやモダリティ（動画、音声、3Dなど）への焦点が移ると予想されます。
*   **DiTモデルの理解深化**: 2025年には、DiTモデルにおけるセマンティックな役割が特定され、次世代画像生成モデルの可能性がさらに開かれる可能性があります。
*   **Hugging Faceによる月刊ニュースレター**: Hugging Faceは、急速に進化するクリエイティブAIの世界の最新情報をまとめた月刊ニュースレターを開始し、AIツールのアクセシビリティ向上を目指します。

## Source URL
https://huggingface.co/blog/ai-art-newsletter-jan-25
