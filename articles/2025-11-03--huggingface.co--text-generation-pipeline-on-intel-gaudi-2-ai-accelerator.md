---
title: "Text-Generation Pipeline on Intel® Gaudi® 2 AI Accelerator"
title_ja: "Intel® Gaudi® 2 AIアクセラレーター テキスト生成パイプラインでLlama 2を高速化・簡素化"
source_url: "https://huggingface.co/blog/textgen-pipe-gaudi"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Intel Gaudi 2 AIアクセラレータ上でLlama 2モデル（7b, 13b, 70b）を用いたテキスト生成を容易にするカスタムパイプラインを発表しました。Optimum Habanaライブラリを通じて提供されるこのパイプラインは、高い柔軟性と使いやすさを持ち、前処理・後処理を含むエンドツーエンドのテキスト生成を数行のコードで実現します。Pythonスクリプトへの組み込みやLangChainとの互換性も特徴です。

## 重要ポイント
*   **Intel Gaudi 2上でのLlama 2テキスト生成**: Intel Gaudi 2 AIアクセラレータ上で、Llama 2モデル（7b, 13b, 70b）ファミリーを用いたテキスト生成が可能です。
*   **カスタムパイプラインの提供**: Optimum Habanaライブラリに、柔軟性と使いやすさを追求したカスタムテキスト生成パイプラインクラスが導入されました。
*   **エンドツーエンドの簡素化**: このパイプラインは、前処理から後処理までを含むテキスト生成プロセス全体を抽象化し、数行のコードで実行できるようにします。
*   **多様な利用方法**: コマンドラインスクリプト、独自のPythonスクリプトへの組み込み、LangChainフレームワークとの連携が可能です。
*   **柔軟な設定**: 単一または複数のプロンプトに対応し、モデルサイズ、生成パラメータ（例: `temperature`, `top_p`）を調整できます。
*   **Llama 2モデルのアクセス要件**: Llama 2モデルはゲート付きリポジトリであり、MetaおよびHugging Faceでのアクセス許可と、関連するライセンス（Llama 2 Community License Agreement）への準拠が必要です。

## 詳細レポート（What happened/背景/影響/関係者/データ）

*   **What happened**: Hugging Faceは、Intel Gaudi 2 AIアクセラレータ上でLlama 2モデル（7b, 13b, 70b）を利用したテキスト生成を簡素化するためのカスタムパイプラインクラスを公開しました。これはOptimum Habanaライブラリの一部として提供され、開発者が容易に生成AIアプリケーションを構築できるように設計されています。
*   **背景**: 生成AIの急速な進化に伴い、Llama 2のようなオープンソースのTransformerモデルを活用したいという開発者のニーズが高まっています。Intel Gaudi 2はAIワークロードに最適化されたアクセラレータであり、その上でこれらの大規模モデルを効率的に実行するためのツールが求められていました。
*   **影響**: このパイプラインにより、Intel Gaudi 2環境を利用する開発者は、Llama 2モデルを使ったテキスト生成機能を、より少ないコードと労力でアプリケーションに統合できるようになります。これにより、開発効率が向上し、より多様な生成AIアプリケーションの創出が促進されると期待されます。
*   **関係者**:
    *   **Hugging Face**: Optimum Habanaライブラリとカスタムテキスト生成パイプラインの開発・提供。
    *   **Intel**: Gaudi 2 AIアクセラレータの提供。
    *   **Meta**: Llama 2モデルの提供。
    *   **Habana Labs**: Intelの子会社であり、GaudiアクセラレータとSynapseAIソフトウェアスタックを開発。
*   **データ**:
    *   **サポートモデル**: Llama 2 7b, Llama 2 13b, Llama 2 70b。
    *   **利用方法の概要**:

| 利用方法 | 説明 | コマンド例/コードスニペットの主要部分 |
| :------- | :--- | :------------------------------------ |
| コマンドラインスクリプト | `optimum-habana`リポジトリ内の`run_pipeline.py`スクリプトを直接実行。単一または複数のプロンプト、DeepSpeedによる大規模モデル（70b）の分散推論に対応。 | `python run_pipeline.py --model_name_or_path meta-llama/Llama-2-7b-hf --prompt "Here is my prompt"`<br>`python ../../gaudi_spawn.py --use_deepspeed --world_size 8 run_pipeline.py --model_name_or_path meta-llama/Llama-2-70b-hf --prompt "Hello world"` |
| Pythonスクリプトへの組み込み | `GaudiTextGenerationPipeline`クラスをインポートし、独自のPythonコード内でインスタンス化して利用。 | `from pipeline import GaudiTextGenerationPipeline`<br>`pipe = GaudiTextGenerationPipeline(args, logger)`<br>`output = pipe(prompt)` |
| LangChainとの互換性 | `GaudiTextGenerationPipeline`を`use_with_langchain=True`で初期化し、LangChainの`HuggingFacePipeline`に渡して利用。 | `from langchain.llms import HuggingFacePipeline`<br>`pipe = GaudiTextGenerationPipeline(args, logger, use_with_langchain=True)`<br>`llm = HuggingFacePipeline(pipeline=pipe)` |

## 引用（Notable quotes）
*   "This article shows how easy it is to generate text with the Llama 2 family of models (7b, 13b and 70b) using Optimum Habana and a custom pipeline class – you'll be able to run the models with just a few lines of code!"
*   "This custom pipeline class has been designed to offer great flexibility and ease of use. Moreover, it provides a high level of abstraction and performs end-to-end text-generation which involves pre-processing and post-processing."

## リスクと課題
*   **Llama 2モデルへのアクセス**: Llama 2モデルはゲート付きリポジトリであり、Metaのウェブサイトで利用規約に同意し、Hugging Faceでも同じメールアドレスでアクセスを申請する必要があります。
*   **ライセンス遵守の責任**: Llama 2モデルの利用は「Llama 2 Community License Agreement」を含む第三者ライセンスに準拠する必要があり、その遵守の責任はユーザー自身にあります。Habana Labsは、ユーザーの利用またはライセンス遵守に関して一切の責任を負いません。
*   **LangChainのバージョン互換性**: パイプラインクラスはLangChainバージョン0.0.191で検証されており、他のバージョンでは動作しない可能性があります。

## 今後の見通し/アクション
*   **開発者のアクション**: Intel Gaudi 2上でLlama 2モデルを利用してテキスト生成アプリケーションを開発する開発者は、Optimum Habanaのカスタムパイプラインを活用することで、開発プロセスを大幅に簡素化できます。
*   **Llama 2利用者のアクション**: Llama 2モデルを利用する際は、MetaおよびHugging Faceでのアクセス申請プロセスを完了し、関連するライセンス条項を十分に理解し遵守することが必須です。
*   **技術的なアクション**: 最新バージョンのOptimum Habanaと、分散推論を行う場合はSynapseAIのバージョンに応じたDeepSpeedをインストールする必要があります。

## Source URL
https://huggingface.co/blog/textgen-pipe-gaudi
