---
title: "Text-Generation Pipeline on Intel® Gaudi® 2 AI Accelerator"
title_ja: "Intel Gaudi 2 AIアクセラレーターでLlama 2テキスト生成パイプライン"
source_url: "https://huggingface.co/blog/textgen-pipe-gaudi"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Intel Gaudi 2 AIアクセラレータ上でLlama 2モデル（7b, 13b, 70b）を用いたテキスト生成パイプラインの利用方法を公開しました。Optimum Habanaとカスタムパイプラインクラスを組み合わせることで、数行のコードで容易にエンドツーエンドのテキスト生成が可能となり、Pythonスクリプトへの組み込みやLangChainとの互換性も提供されます。

## 重要ポイント
*   **Intel Gaudi 2に最適化**: Llama 2モデルのテキスト生成をIntel Gaudi 2 AIアクセラレータ上で効率的に実行。
*   **容易な利用**: 数行のコードでLlama 2モデル（7b, 13b, 70b）によるテキスト生成が可能。
*   **カスタムパイプライン**: 前処理・後処理を含むエンドツーエンドのテキスト生成を抽象化し、高い柔軟性と使いやすさを提供。
*   **多様な利用方法**: 提供されるスクリプトを直接実行、Pythonスクリプトにクラスを組み込み、LangChain（v0.0.191）との連携が可能。
*   **大規模モデル対応**: DeepSpeedを活用することで、Llama-2-70bのような大規模モデルの分散推論もサポート。
*   **パラメータ制御**: `temperature`や`top_p`などの生成品質パラメータを調整可能。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、Intel Gaudi 2 AIアクセラレータ上でLlama 2ファミリーモデル（7b, 13b, 70b）を用いたテキスト生成パイプラインの利用方法を詳細に解説しました。これは、Hugging FaceのOptimum Habanaライブラリと、前処理・後処理を内包する専用のカスタムパイプラインクラス「GaudiTextGenerationPipeline」を組み合わせることで実現されます。

**背景:**
生成AI（GenAI）の急速な発展に伴い、Llama 2のようなオープンソースのTransformerモデルは、開発者やAI愛好家にとって魅力的なツールとなっています。これらのモデルの生成能力を、Intel Gaudi 2のような高性能AIアクセラレータ上で効率的かつ容易に活用したいというニーズが高まっていました。

**影響:**
このパイプラインの提供により、開発者はIntel Gaudi 2上でLlama 2モデルを非常に少ないコードで簡単に利用できるようになりました。エンドツーエンドのテキスト生成プロセスが抽象化され、Pythonスクリプトへの組み込みや、LangChainのような人気のあるフレームワークとの連携も容易になったことで、Gaudi 2エコシステムにおけるGenAIアプリケーション開発が加速されると期待されます。

**関係者:**
*   **Hugging Face**: Optimum Habanaライブラリの開発、本パイプラインの提供、ブログ記事の公開。
*   **Intel / Habana Labs**: Gaudi 2 AIアクセラレータの開発、Optimum Habanaの共同開発。
*   **Meta**: Llama 2モデルの開発元。
*   **開発者**: Llama 2モデルとGaudi 2アクセラレータを活用してテキスト生成アプリケーションを構築するユーザー。

**データ/技術スタック:**
*   **AIアクセラレータ**: Intel® Gaudi® 2
*   **モデル**: Llama 2ファミリー（`meta-llama/Llama-2-7b-hf`, `meta-llama/Llama-2-13b-hf`, `meta-llama/Llama-2-70b-hf`）
*   **主要ライブラリ**:
    *   `optimum-habana==1.10.4`
    *   DeepSpeed (SynapseAI 1.14.0に対応)
    *   `langchain==0.0.191`
*   **利用方法の例**:
    *   **CLIからの実行**:
        ```bash
        python run_pipeline.py --model_name_or_path meta-llama/Llama-2-7b-hf --use_hpu_graphs --use_kv_cache --max_new_tokens 100 --do_sample --prompt "Here is my prompt"
        ```
    *   **Pythonスクリプトでの利用**:
        ```python
        from pipeline import GaudiTextGenerationPipeline
        # ... (args設定)
        pipe = GaudiTextGenerationPipeline(args, logger)
        prompts = ["He is working on", "Once upon a time"]
        for prompt in prompts:
            output = pipe(prompt)
            print(f"Generated Text: {repr(output)}")
        ```
    *   **LangChainとの連携**:
        ```python
        from langchain.llms import HuggingFacePipeline
        from pipeline import GaudiTextGenerationPipeline
        # ... (args設定)
        pipe = GaudiTextGenerationPipeline(args, logger, use_with_langchain=True)
        llm = HuggingFacePipeline(pipeline=pipe)
        # ... (PromptTemplateとLLMChainの構築、実行)
        ```

## 引用（Notable quotes）
*   「AI enthusiasts as well as developers are looking to leverage the generative abilities of such models for their own use cases and applications.」
*   「This article shows how easy it is to generate text with the Llama 2 family of models (7b, 13b and 70b) using Optimum Habana and a custom pipeline class – you'll be able to run the models with just a few lines of code!」
*   「This custom pipeline class has been designed to offer great flexibility and ease of use. Moreover, it provides a high level of abstraction and performs end-to-end text-generation which involves pre-processing and post-processing.」

## リスクと課題
*   **Llama 2モデルのアクセス制限**: Llama 2はゲート付きモデルであり、Metaのウェブサイトで利用規約に同意し、Hugging Faceでも同じメールアドレスでアクセスを申請し、許可を得る必要がある。
*   **ライセンスへの準拠**: Llama 2の利用は「Llama 2 Community License Agreement」を含む第三者ライセンスに準拠する必要があり、ユーザーがその責任を負う。
*   **Hugging Face認証**: Hugging Faceアカウントを持ち、CLIでログイン（アクセストークン使用）する必要がある。
*   **LangChainのバージョン互換性**: パイプラインはLangChainバージョン0.0.191で検証されており、他のバージョンでは動作しない可能性がある。
*   **DeepSpeedのバージョン依存**: 分散推論のためのDeepSpeedインストールは、使用するSynapseAIのバージョンに依存する。

## 今後の見通し/アクション
*   **開発者への利用促進**: Intel Gaudi 2上でLlama 2モデルを活用した生成AIアプリケーション開発がさらに加速されることが期待される。
*   **エコシステムの拡大**: Hugging FaceとIntelの連携により、オープンソースモデルと高性能アクセラレータの組み合わせがより容易になり、GenAIエコシステムの発展に貢献する。
*   **継続的な最適化**: Optimum Habanaライブラリの進化により、Gaudi 2上でのさらなる性能最適化や新機能の追加が期待される。

## Source URL（必須）
https://huggingface.co/blog/textgen-pipe-gaudi
