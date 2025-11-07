---
title: >-
  Building Cost-Efficient Enterprise RAG applications with Intel Gaudi 2 and
  Intel Xeon
title_ja: ''
source_url: 'https://huggingface.co/blog/cost-efficient-rag-applications-with-intel'
date: '2025-11-03'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/cost-efficient-rag-applications-with-intel'
summarized_at: '2025-11-05T11:00:28.277Z'
tldr: >-
  # Building Cost-Efficient Enterprise RAG applications with Intel Gaudi 2 and
  Intel Xeon
key_points:
  - '- ## TL;DR'
  - >-
    - - Intel Gaudi 2 AIアクセラレータとIntel Xeon
    CPUの組み合わせにより、費用対効果の高いエンタープライズRAGアプリケーションが構築可能。
  - >-
    - - RAGアプリケーションはOpen Platform for Enterprise AI
    (OPEA)の一部としてLangChainとHugging Face TGIを利用して開発・展開される。
  - >-
    - - Intel Granite Rapids CPUは埋め込みモデルとベクトルデータベースを、Intel Gaudi
    2はLLMの高性能推論をそれぞれ担当。
  - '- - Llama2-70Bモデルのベンチマークで、Gaudi 2システムはNvidia H100システムに対し、性能/ドルで2倍以上の優位性を示した。'
---
# Building Cost-Efficient Enterprise RAG applications with Intel Gaudi 2 and Intel Xeon

## TL;DR
- Intel Gaudi 2 AIアクセラレータとIntel Xeon CPUの組み合わせにより、費用対効果の高いエンタープライズRAGアプリケーションが構築可能。
- RAGアプリケーションはOpen Platform for Enterprise AI (OPEA)の一部としてLangChainとHugging Face TGIを利用して開発・展開される。
- Intel Granite Rapids CPUは埋め込みモデルとベクトルデータベースを、Intel Gaudi 2はLLMの高性能推論をそれぞれ担当。
- Llama2-70Bモデルのベンチマークで、Gaudi 2システムはNvidia H100システムに対し、性能/ドルで2倍以上の優位性を示した。

## 重要ポイント
- RAG（Retrieval-augmented generation）は、外部の最新ドメイン知識を統合することでLLMのテキスト生成能力と精度を向上させる。
- Intelは、OPEA（Open Platform for Enterprise AI）の一環として、Gaudi 2とXeon CPUを活用したRAGアプリケーションの開発・展開を支援している。
- アプリケーションはLangChainフレームワークを使用し、Intel Granite Rapids CPUで埋め込みモデル（BAAI/bge-base-en-v1.5）とRedisベクトルデータベースを、Intel Gaudi 2アクセラレータでLLM推論（Hugging Face TGIサーバー経由）を実行する。
- Gaudi 2でのLLM推論はデフォルトでBF16データ型を使用するが、FP8量子化によりスループットを最大1.8倍向上させることが可能。
- Llama2-70Bモデルを用いたベンチマーク結果は、Gaudi 2システムがH100システムと比較して性能/ドルで大幅に優れており、エンタープライズAIアプリケーションの総所有コスト（TCO）削減に貢献することを示している。

## 概要
この記事では、Intel Gaudi 2 AIアクセラレータとIntel Xeon CPUを活用し、費用対効果の高いエンタープライズRAG（Retrieval-augmented generation）アプリケーションを構築する方法を解説しています。LangChainフレームワークとHugging Faceのツールを組み合わせ、Intel Granite Rapids CPUを埋め込みモデルとベクトルデータベースに、Intel Gaudi 2をLLMの高性能推論に最適化して利用。Llama2-70Bモデルを用いたベンチマークでは、Gaudi 2システムがNvidia H100システムと比較し、性能/ドルで2倍以上の優位性を示し、総所有コスト（TCO）の削減に大きく貢献することを実証しました。IntelはOPEAを通じて、こうしたGenAI開発を強力に支援しています。
