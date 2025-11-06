---
title: "Text-Generation Pipeline on Intel® Gaudi® 2 AI Accelerator"
title_ja: "Intel Gaudi 2 AIアクセラレーター、テキスト生成パイプラインで効率化"
source_url: "https://huggingface.co/blog/textgen-pipe-gaudi"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Intel Gaudi 2 AIアクセラレータ上でLlama 2モデル（7b, 13b, 70b）を用いたテキスト生成を簡素化するカスタムパイプラインクラスを発表しました。このパイプラインはOptimum Habanaを利用し、数行のコードでエンドツーエンドのテキスト生成を可能にし、コマンドライン、Pythonスクリプト、LangChainとの高い互換性を提供します。

## 重要ポイント
*   **Intel Gaudi 2に最適化**: Intel Gaudi 2 AIアクセラレータ上でLlama 2モデルのテキスト生成を効率的に実行。
*   **Llama 2モデル対応**: Llama 2の7b、13b、70bの各モデルサイズに対応。
*   **高レベル抽象化**: 前処理から後処理までを含むエンドツーエンドのテキスト生成を自動化。
*   **柔軟な利用方法**: コマンドラインスクリプト、Pythonスクリプトへの組み込み、LangChainとの連携が可能。
*   **分散推論サポート**: 大規模モデル（例: Llama-2-70b）向けにDeepSpeedを用いた分散推論に対応。
*   **容易なセットアップ**: Optimum HabanaのインストールとLlama 2モデルへのアクセス設定で利用開始可能。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Faceは、Intel Gaudi 2 AIアクセラレータ上でLlama 2ファミリーのモデル（7b, 13b, 70b）を使用してテキスト生成を行うためのカスタムパイプラインクラスを公開しました。このパイプラインは、Optimum Habanaライブラリの一部として提供され、高い柔軟性と使いやすさを特徴としています。

**背景:**
生成AIの急速な発展とLlama 2のようなオープンソースのTransformerモデルの普及により、開発者はこれらのモデルを自身のアプリケーションに組み込むことを求めています。本パイプラインは、Intel Gaudi 2の高性能を最大限に活用しつつ、テキスト生成プロセス（前処理、モデル推論、後処理）を簡素化することで、開発者の負担を軽減することを目的としています。

**影響:**
*   **開発効率の向上**: ユーザーは複雑な設定なしに、数行のコードでLlama 2モデルによるテキスト生成を実行できます。
*   **幅広いモデル対応**: 小規模から大規模なLlama 2モデルまで、様々なサイズのモデルをGaudi 2上で効率的に利用できます。
*   **多様な利用シナリオ**: コマンドラインからの簡単なテスト、既存のPythonアプリケーションへの組み込み、LangChainを用いた高度なAIアプリケーション構築など、幅広い用途に対応します。
*   **パフォーマンス最適化**: `use_hpu_graphs`や`use_kv_cache`などのオプションにより、Gaudi 2の性能を最大限に引き出すことが可能です。

**関係者:**
*   **Hugging Face**: Optimum Habanaライブラリとカスタムパイプラインの提供元。
*   **Intel**: Gaudi 2 AIアクセラレータの開発元。
*   **Meta**: Llama 2モデルの開発元。
*   **Habana Labs**: DeepSpeedとの連携（SynapseAI）を通じて分散推論をサポート。

**データ:**
*   **Llama 2モデル**: 7b, 13b, 70bの各サイズがサポートされています。
*   **Optimum Habanaバージョン**: `1.10.4`が推奨されています。
*   **DeepSpeedバージョン**: SynapseAI `1.14.0`に対応するDeepSpeedバージョンが使用されています。
*   **LangChainバージョン**: `0.0.191`での互換性が検証されています。

## 引用（Notable quotes）
「数行のコードでLlama 2ファミリーのモデル（7b, 13b, 70b）を使ってテキスト生成がいかに簡単かを示すものです。」

## リスクと課題
*   **Llama 2モデルへのアクセス制限**: Llama 2モデルはゲート付きリポジトリであり、Metaウェブサイトでの利用規約同意とHugging Faceでのアクセス申請の両方が必要です。
*   **Hugging Faceアカウントと認証**: モデル利用にはHugging Faceアカウントへのログインとアクセストークンの設定が必須です。
*   **ライセンス準拠**: Llama 2モデルの利用は「Llama 2 Community License Agreement」を含むサードパーティライセンスへの準拠がユーザーの責任となります。
*   **LangChainバージョン互換性**: パイプラインはLangChainバージョン0.0.191で検証されており、他のバージョンでは動作しない可能性があります。

## 今後の見通し/アクション
1.  **Llama 2モデルへのアクセス取得**: Metaウェブサイトで利用規約に同意し、Hugging FaceでLlama 2モデルへのアクセスを申請します。
2.  **Hugging Face CLIログイン**: `huggingface-cli login`コマンドを実行し、アクセストークンでログインします。
3.  **Optimum Habanaのインストール**: `pip install optimum-habana==1.10.4`でライブラリをインストールし、リポジトリをクローンします。
4.  **DeepSpeedのインストール (オプション)**: 分散推論を行う場合は、SynapseAIのバージョンに合わせてDeepSpeedをインストールします。
5.  **テキスト生成の開始**: 提供される`run_pipeline.py`スクリプト、またはPythonスクリプト内で`GaudiTextGenerationPipeline`クラスを使用して、Intel Gaudi 2上でLlama 2によるテキスト生成を開始します。
6.  **LangChainとの連携**: LangChainバージョン0.0.191をインストールし、パイプラインをLangChainオブジェクトに組み込むことで、より複雑な生成AIアプリケーションを構築します。

## Source URL（必須）
https://huggingface.co/blog/textgen-pipe-gaudi
