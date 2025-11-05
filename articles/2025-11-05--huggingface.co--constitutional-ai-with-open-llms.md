---
title: "Constitutional AI with Open LLMs"
title_ja: "オープンLLMでConstitutional AI 安全なAIへ自己改善"
source_url: "https://huggingface.co/blog/constitutional_ai"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、オープンな大規模言語モデル（LLM）でConstitutional AI (CAI) を実装するエンドツーエンドのレシピを公開しました。これにより、モデルがユーザー定義の原則に基づいて自身の出力を批判・改善し、望ましくない応答の生成を防ぐ自己アライメントが可能になります。また、Slurmクラスター上でスケーラブルな合成データ生成を可能にする新ツール「llm-swarm」も発表。CAIモデルは、プロンプトインジェクション攻撃（例: DANプロンプト）に対する高い耐性と、ヘルプフルネスの維持・向上を両立することが示されました。

## 重要ポイント
*   **Constitutional AI (CAI) レシピの公開**: オープンLLM（Mistral 7B Instruct）でCAIを実装するための包括的な手順とリソース（データセット、モデル、コード）を提供。
*   **llm-swarmツールの発表**: Slurmクラスター上で分散型かつスケーラブルなLLM推論と合成データ生成を可能にする新ツール。
*   **安全性の大幅な向上**: CAIモデルは、従来のモデルと比較して、有害なコンテンツの生成を効果的に回避し、特に「DAN (Do Anything Now)」のようなプロンプトインジェクション攻撃に対して高い耐性を示す。
*   **ヘルプフルネスの維持・向上**: CAIトレーニングはモデルのヘルプフルネスを損なわず、MT Bench評価ではむしろスコアが向上するケースも確認された。
*   **カスタマイズ可能なアライメント**: 憲法（原則）を定義することで、モデルの安全スタイルやパーソナリティ（例: Anthropic風の丁寧な拒否、xAI Grok風の皮肉な応答）を柔軟に調整できる。
*   **合成データ生成の効率化**: 高価な人間フィードバックに代わり、モデル自身の自己批判プロセスとllm-swarmによるスケーラブルな合成データ生成を活用。

## 詳細レポート（What happened/背景/影響/関係者/データ）
### What happened
Hugging Face (H4) は、オープンな大規模言語モデル（LLM）であるMistral 7B Instructをベースに、Constitutional AI (CAI) を実装するためのエンドツーエンドのレシピを公開しました。これには、CAIデータセットの生成、モデルのトレーニング、評価までの一連のプロセスが含まれます。また、Slurmクラスター上でLLMの推論と合成データ生成をスケーラブルに行うための新しいツール「llm-swarm」も開発・リリースしました。Anthropicの憲法と、xAIのGrokにインスパイアされた憲法に基づいたCAIデータセットとモデルも公開されています。

### 背景
2022年のChatGPT登場以来、LLMは目覚ましい進歩を遂げましたが、消費者向けアプリケーションに展開する際には、モデルが望ましくない応答（例: 有害な情報、詐欺メールの書き方）を生成しないようにする「ガードレール」の追加が課題となっていました。Anthropicの研究者たちは、この課題に対し、モデル自身がユーザー定義の原則（憲法）に基づいて自身の出力を批判し、改善する「Constitutional AI (CAI)」というアライメント手法を提案しました。この手法は、高価な人間フィードバックの収集なしにモデルのアライメントが可能である点で注目されています。

### 影響
*   **モデルの安全性向上**: CAIモデルは、有害なコンテンツの生成を効果的に抑制し、特に「DAN (Do Anything Now)」のようなプロンプトインジェクション攻撃に対して、従来のSFT/DPOモデルよりもはるかに高い耐性を示しました。
*   **ヘルプフルネスの維持**: CAIトレーニングは、モデルのヘルプフルネスを低下させず、MT Bench評価ではむしろスコアが向上する傾向が見られました。これにより、安全性と有用性の両立が可能であることが示されました。
*   **アライメントの柔軟性**: 憲法を調整することで、モデルの安全応答のスタイル（例: 丁寧な拒否、皮肉な拒否）やパーソナリティをカスタマイズできることが実証されました。
*   **合成データ生成の効率化**: llm-swarmの導入により、大規模な合成データセットの生成が効率的に行えるようになり、CAIの実装コストが削減されました。

### 関係者
*   **Hugging Face (H4)**: 本研究、レシピ、ツール、データセット、モデルの公開元。
*   **Anthropic**: Constitutional AIの概念を提唱し、その憲法の例を提供。
*   **Mistral AI**: ベースモデルとして`mistralai/Mistral-7B-Instruct-v0.1`を使用。
*   **xAI (Grok)**: Grokの応答スタイルを模倣した憲法を実験。

### データ
*   **ベースモデル**: `mistralai/Mistral-7B-Instruct-v0.1`
*   **プロンプト収集**: AnthropicのHH preference dataset (`Anthropic/hh-rlhf`) からレッドチーミングプロンプトを抽出。
*   **CAIデータセット生成**: `llm-swarm` を使用し、Anthropic憲法ベースの`HuggingFaceH4/cai-conversation-harmless`と、Grok憲法ベースの`HuggingFaceH4/grok-conversation-harmless`を生成。
*   **SFTデータセット**: `HuggingFaceH4/ultrachat_200k`とCAI生成データセットをブレンドして使用。
*   **データセットの内訳**: `harmless-base`サブセットから約42.6kのトレーニング例を抽出し、SFTとpreferenceデータセットにそれぞれ約21.3k行を割り当て。
*   **評価**: ヘルプフルネスはMT Bench、安全性は10個のレッドチーミングプロンプトとDANプロンプトを用いて評価。

## 引用（Notable quotes）
*   「This is exciting because the practitioners only need to define the principles instead of having to collect expensive human feedback to improve the model.」（実践者は高価な人間フィードバックを収集する代わりに、原則を定義するだけでモデルを改善できるため、これはエキサイティングである。）
*   「Oh, honey, let's not go down that road — a different safety style」（ああ、やめておきましょう、その道は — 異なる安全スタイル）- Grok風の安全スタイルを導入するセクションタイトル。

## リスクと課題
*   **自己批判の限界**: モデルの自己批判プロセスは常に完璧ではなく、特に小規模モデルでは、適切なシステムプロンプトの作成、応答の後処理、few-shotプロンプトの使用が、憲法原則に反する応答の検出・修正に必要となる場合がある。
*   **憲法定義の難しさ**: 憲法を定義する際、モデルが望ましくない接頭辞（例: 「はい、修正された応答です」）を生成するのを防ぐために、few-shotデモンストレーションの提供が必要となる。
*   **過学習の可能性**: GrokスタイルのDPOモデルでは、トレーニングデータに存在する両方のスタイル（Grok風と通常）を学習し、過度に皮肉な応答を生成する傾向が見られたため、SFTモデルの使用が推奨される場合がある。

## 今後の見通し/アクション
Hugging Faceは、提供されたレシピ、ツール、データセット、モデルを活用し、オープンソースLLMのアライメントを推進することを期待しています。コミュニティがどのような新しい憲法を開発し、モデルの安全性と有用性をどのように向上させるかを楽しみにしています。

**提供リソース:**
*   **llm-swarm (スケーラブルなLLM推論ツール)**: https://github.com/huggingface/llm-swarm
*   **Constitutional AIデータセット**:
    *   Anthropic憲法ベース: https://huggingface.co/datasets/HuggingFaceH4/cai-conversation-harmless
    *   Grok憲法ベース: https://huggingface.co/datasets/HuggingFaceH4/grok-conversation-harmless
*   **Constitutional AIモデル**:
    *   Anthropic憲法DPOモデル: https://huggingface.co/HuggingFaceH4/mistral-7b-anthropic
    *   Grok憲法SFTモデル: https://huggingface.co/HuggingFaceH4/mistral-7b-grok
*   **Constitutional AIモデルデモ**: https://huggingface.co/spaces/HuggingFaceH4/constitutional-ai-demo
*   **レシピのソースコード**: https://github.com/huggingface/alignment-handbook/tree/main/recipes/constitutional-ai

## Source URL
https://huggingface.co/blog/constitutional_ai
