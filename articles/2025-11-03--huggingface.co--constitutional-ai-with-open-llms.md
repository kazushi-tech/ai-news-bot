---
title: "Constitutional AI with Open LLMs"
title_ja: "オープンLLMで「憲法AI」 自己規律AIの実現へ新手法"
source_url: "https://huggingface.co/blog/constitutional_ai"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、オープンな大規模言語モデル（LLM）でConstitutional AI (CAI) を実装するためのエンドツーエンドのレシピとツール「llm-swarm」を公開しました。CAIは、モデルが自身の出力を自己批判し、定義された原則（憲法）に基づいて自己改善することで、高価な人間によるフィードバックなしにモデルをアラインメントさせる手法です。本研究では、CAIモデルが有害な出力（プロンプトインジェクションを含む）に対して高い耐性を示しつつ、モデルのヘルプフルネスを損なわないことを実証しました。

## 重要ポイント

*   **Constitutional AI (CAI) レシピの公開**: オープンLLM（Mistral 7B Instruct）を用いてCAIを実装する包括的な手順とコードが提供されました。
*   **llm-swarmツールの開発**: Slurmクラスター上でTGIとvLLMを活用し、スケーラブルな合成データ生成を可能にするツールがリリースされました。これにより、大規模なCAIデータセットの効率的な作成が実現します。
*   **安全性とヘルプフルネスの両立**: CAIモデルは、有害なプロンプト（DAN攻撃など）に対する耐性が高く、同時にMT Benchスコアで評価されるヘルプフルネスも維持または向上させることが示されました。
*   **カスタマイズ可能なアラインメント**: Anthropicの憲法だけでなく、xAIのGrokのような特定のパーソナリティ（例：皮肉な応答スタイル）を持つ憲法も作成可能であり、CAIの柔軟性が示されました。
*   **豊富な公開リソース**: llm-swarmツール、CAIデータセット、CAIモデル、デモ、レシピのソースコードがHugging Face上で公開され、コミュニティでの利用が促進されます。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging FaceのH4チームは、オープンな大規模言語モデル（LLM）にConstitutional AI (CAI) を適用するための包括的なレシピと、スケーラブルな合成データ生成ツール「llm-swarm」を公開しました。これにより、開発者は高価な人間によるフィードバックなしに、LLMを特定の価値観や安全原則に沿ってアラインメントできるようになります。

**背景:**
2022年のChatGPT登場以来、LLMは目覚ましい進歩を遂げましたが、消費者向けアプリケーションに展開する際には、有害な応答や不適切な内容の生成を防ぐ「ガードレール」の必要性が課題となっていました。Anthropicが提唱したConstitutional AI (CAI) は、モデル自身に自身の出力を批判させ、定義された原則に基づいて自己改善させることで、この課題を解決する有望なアプローチとして注目されていました。本研究は、このCAI手法をオープンモデルで実現し、その有効性を検証することを目的としています。

**影響:**
*   オープンモデルコミュニティが、独自の価値観や安全原則に基づいてLLMをアラインメントするための強力なツールと手法を手に入れることができます。
*   LLMの安全性、特にプロンプトインジェクション攻撃（例：DANプロンプト）に対する堅牢性が大幅に向上します。
*   アラインメントの過程でモデルのヘルプフルネスが損なわれる「アラインメント税」を支払うことなく、安全なモデルを構築できる可能性が示されました。
*   特定のパーソナリティ（例：Grokのような皮肉な応答スタイル）を持つモデルを、憲法を調整するだけで生成できる柔軟性を提供します。

**関係者:**
*   **Hugging Face (H4チーム)**: 本研究の実施者であり、CAIレシピとllm-swarmツールの開発・公開を行いました。
*   **Anthropic**: Constitutional AIの概念を提唱し、その憲法（原則リスト）が本研究のベースとなりました。
*   **Mistral AI**: ベースモデルとして「Mistral 7B Instruct v0.1」が使用され、その高い性能と命令追従能力がCAIの出発点となりました。
*   **xAI**: Grokのようなパーソナリティを持つモデルの例として言及され、CAIのカスタマイズ性を示すためにそのスタイルが模倣されました。

**データ:**
*   **Anthropic HH preference dataset**: CAIプロセスで望ましくない応答を引き出すためのレッドチーミングプロンプトの収集に使用されました。
*   **Ultrachat dataset**: モデルのヘルプフルネスを維持するためのSFT（Supervised Fine-Tuning）データセットとして使用されました。
*   **HuggingFaceH4/cai-conversation-harmless**: Anthropicの憲法に基づいて生成されたCAIデータセット。
*   **HuggingFaceH4/grok-conversation-harmless**: xAIのGrokスタイルを模倣した憲法に基づいて生成されたCAIデータセット。

**手法:**
1.  **Constitutional AI (CAI) プロセス**:
    *   モデルに望ましくない質問を投げかけます。
    *   モデルに、定義された憲法（原則リスト）に基づいて自身の出力を自己批判させます。
    *   モデルに、憲法に反する内容を削除・修正するよう応答を改訂させます。
2.  **データセット生成**: 上記CAIプロセスから、SFTデータセット（改訂後の出力でファインチューニング）と選好データセット（改訂後を「選好」、元の出力を「拒否」としてペア化）を生成します。
3.  **モデル学習**: Mistral 7B Instruct v0.1をベースに、UltrachatとCAIデータセットでSFTを行い、その後DPO（Direct Preference Optimization）を適用してモデルを学習させます。
4.  **llm-swarm**: Slurmクラスター上でTGI (Text Generation Inference) とvLLMを活用し、LLMからの合成データ生成をスケーラブルに行うためのツールです。推論エンドポイントの自動管理、ロードバランシング（nginx使用）、効率的なGPU利用が特徴です。
5.  **評価**:
    *   **ヘルプフルネス**: MT Benchを用いて評価されました。CAIデータセットでの学習がMT Benchスコアを向上させ、ヘルプフルネスが維持されることが示されました。
    *   **安全性**: 10個のレッドチーミングプロンプトと、DAN (Do Anything Now) プロンプトのようなプロンプトインジェクション手法を用いて評価されました。

**安全性評価結果（Anthropic憲法に基づくCAIモデル）:**

| Method / prompt methods | No Prompt | Safety System Prompt | DAN Prompt | Safety System Prompt + DAN Prompt |
| :---------------------- | :-------- | :------------------- | :--------- | :-------------------------------- |
| CAI (SFT + DPO)         | 10/10     | 10/10                | 5/10       | 7/10                              |
| CAI (SFT only)          | 10/10     | 10/10                | 5/10       | 7/10                              |
| Baseline (SFT + DPO)    | 5/10      | 4/10                 | 1/10       | 1/10                              |

**安全性評価結果（GrokスタイルCAIモデル）:**

| Method / prompt methods | No Prompt | Safety System Prompt | DAN Prompt | Safety System Prompt + DAN Prompt |
| :---------------------- | :-------- | :------------------- | :--------- | :-------------------------------- |
| Grok-style CAI (SFT only) | 9/10      | 10/10                | 7/10       | 8/10                              |
| Grok-style CAI (SFT + DPO) | 10/10     | 10/10                | 9/10       | 10/10                             |
| Baseline (SFT + DPO)    | 5/10      | 4/10                 | 1/10       | 1/10                              |

これらの結果は、CAIモデルがベースラインモデルと比較して、有害な出力に対する耐性が大幅に向上し、特にDANプロンプトのようなプロンプトインジェクション攻撃に対してもより堅牢であることを示しています。

## 引用（Notable quotes）

*   「Constitutional AI is this clever idea that we can ask helpful models to align themselves.」（Constitutional AIは、ヘルプフルなモデルに自己アラインメントを求めるという賢いアイデアです。）
*   「This is exciting because the practitioners only need to define the principles instead of having to collect expensive human feedback to improve the model.」（これは、実践者がモデルを改善するために高価な人間のフィードバックを収集する代わりに、原則を定義するだけで済むため、非常に魅力的です。）
*   「We found training on the CAI dataset does not necessarily reduce helpfulness (i.e., paying the alignment tax).」（CAIデータセットでの学習が必ずしもヘルプフルネスを低下させない（すなわち、アラインメント税を支払わない）ことがわかりました。）
*   「Our CAI model exhibits a strong resistance to undesirable outputs. Even under the influence of the DAN prompt.」（我々のCAIモデルは、DANプロンプトの影響下でも、望ましくない出力に対して強い耐性を示します。）

## リスクと課題

*   **自己批判の不完全性**: モデルの自己批判プロセスは常に完璧に機能するわけではなく、憲法原則に反する応答を検出できない場合があります。特に小規模なモデルでは、この傾向が顕著です。
*   **プロンプトエンジニアリングの必要性**: 良いシステムプロンプトの作成、応答の後処理、few-shot promptingの使用が、特に小規模モデルにおいて、CAIの有効性を高めるために必要となります。
*   **過学習の可能性**: DPOモデルが特定のスタイル（例：Grokスタイル）に過度に学習し、意図しないほど皮肉な応答を生成する場合があります。このため、場合によってはSFTモデルの使用が推奨されることもあります。

## 今後の見通し/アクション

Hugging Faceは、コミュニティが多様な「憲法」を開発し、オープンモデルのアラインメントをさらに推進することに期待を寄せています。公開されたレシピとツールを活用することで、開発者は独自の価値観や目的に合わせてLLMを安全かつ効果的にカスタマイズできるようになるでしょう。

## Source URL
https://huggingface.co/blog/constitutional_ai
