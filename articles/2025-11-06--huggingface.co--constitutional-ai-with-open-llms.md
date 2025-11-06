---
title: "Constitutional AI with Open LLMs"
title_ja: "オープンLLMでConstitutional AIを開発 自己調整の仕組み"
source_url: "https://huggingface.co/blog/constitutional_ai"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、オープンな大規模言語モデル（LLM）にConstitutional AI（CAI）を実装するためのエンドツーエンドのレシピを公開しました。この取り組みには、Slurmクラスター上でスケーラブルな合成データ生成を可能にする新ツール「llm-swarm」の開発も含まれます。CAIモデルは、有用性を損なうことなく、プロンプトインジェクション攻撃（例：DANプロンプト）に対して高い耐性を示し、カスタマイズ可能な憲法（原則）を通じて多様な安全スタイルを実現できることが実証されました。

## 重要ポイント
*   **オープンLLM向けCAIレシピの提供**: AnthropicのConstitutional AI手法をオープンモデル（Mistral 7B Instructベース）に適用する具体的な手順とリソースを公開。
*   **スケーラブルな合成データ生成ツール「llm-swarm」**: Slurmクラスター上で効率的なLLM推論とデータ生成を可能にするツールを開発・リリース。
*   **安全性と有用性の両立**: CAIモデルは、プロンプトインジェクション（DAN攻撃など）に対して高い耐性を示し、MT Benchスコアで評価される有用性も維持または向上。
*   **カスタマイズ可能な安全スタイル**: 憲法（原則）を調整することで、Anthropicの安全原則に加え、xAIのGrokのような皮肉な応答スタイルなど、多様なAIパーソナリティを実現可能。
*   **関連リソースの公開**: llm-swarmツール、CAIデータセット、訓練済みCAIモデル、デモ、ソースコードがHugging Face HubおよびGitHubで利用可能。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、Anthropicが提唱するConstitutional AI (CAI) の手法をオープンな大規模言語モデル（LLM）に適用する包括的なレシピを公開しました。このレシピでは、Mistral 7B Instructモデルをベースに、CAIデータセットを生成し、Supervised Fine-Tuning (SFT) とDirect Preference Optimization (DPO) を用いてモデルを訓練します。特に、大規模な合成データ生成を効率化するため、Slurmクラスター上で動作するスケーラブルなテキスト生成ツール「llm-swarm」を開発・リリースしました。また、Anthropicの憲法に加え、xAIのGrokのような皮肉な応答スタイルを模倣するカスタム憲法も試行し、CAIの柔軟性を示しました。

### 背景
2022年のChatGPT登場以来、LLMは目覚ましい進歩を遂げましたが、コンシューマー向けアプリケーションに展開する際には、有害なコンテンツや不適切な応答の生成を防ぐためのガードレール（安全性）が不可欠です。従来の人間によるフィードバック（RLHFなど）は、データ収集に多大なコストがかかるという課題がありました。AnthropicのConstitutional AIは、モデル自身に一連の原則（憲法）に基づいて出力を自己批判・改善させることで、この課題を解決し、より効率的なアライメントを可能にする手法として注目されています。

### 影響
*   **オープンソースコミュニティへの貢献**: オープンソースLLMの安全性とアライメントに関する具体的な手法とリソースを提供し、コミュニティが独自の価値観に基づいたモデルを構築する道を拓きました。
*   **LLMの安全性向上**: CAIモデルは、従来の安全性システムプロンプトやDANプロンプトのようなプロンプトインジェクション攻撃に対して、大幅に高い耐性を示すことが実証されました。
*   **有用性の維持**: CAIトレーニングはモデルの有用性（MT Benchスコアで評価）を損なうことなく、むしろ向上させるケースがあることを示し、「アライメント税」の懸念を払拭しました。
*   **研究開発の加速**: 「llm-swarm」ツールにより、大規模な合成データ生成が効率化され、LLMのアライメント研究開発が加速されることが期待されます。
*   **多様なAIパーソナリティの実現**: 憲法をカスタマイズすることで、単なる安全性だけでなく、特定の個性やスタイル（例：Grokのような皮肉な応答）を持つAIの開発が可能になることを示唆しました。

### 関係者
*   **Hugging Face**: 本研究の実施者、レシピ、ツール、データセット、モデルの公開元。
*   **Anthropic**: Constitutional AI (CAI) 手法の提唱者、HH preference datasetの提供元。
*   **Mistral AI**: ベースモデル「Mistral-7B-Instruct-v0.1」の提供元。
*   **xAI**: Grokの応答スタイルがCAIのカスタマイズ例として言及。

### データ
*   **ベースモデル**: `mistralai/Mistral-7B-Instruct-v0.1` (SFT用)、`mistralai/Mistral-7B-v0.1` (DPO用)
*   **プロンプト収集元**: `Anthropic/hh-rlhf` (red-teaming prompts)
*   **SFTデータセット**: `HuggingFaceH4/ultrachat_200k` および生成されたCAIデータセット
*   **生成されたCAIデータセット**:
    *   `HuggingFaceH4/cai-conversation-harmless` (Anthropic憲法に基づく)
    *   `HuggingFaceH4/grok-conversation-harmless` (Grok憲法に基づく)
*   **評価データ**: MT Bench (有用性評価)、CAIデータセットの`test_sft`スプリットからの10のred teamingプロンプト (安全性評価)。

**安全性評価結果（Anthropic憲法に基づくCAIモデル）**

| Method / prompt methods | No Prompt | Safety System Prompt | DAN Prompt | Safety System Prompt + DAN Prompt |
| :---------------------- | :-------- | :------------------- | :--------- | :-------------------------------- |
| CAI (SFT + DPO)         | 10/10     | 10/10                | 5/10       | 7/10                              |
| CAI (SFT only)          | 10/10     | 10/10                | 5/10       | 7/10                              |
| Baseline (SFT + DPO)    | 5/10      | 4/10                 | 1/10       | 1/10                              |

**安全性評価結果（GrokスタイルCAIモデル）**

| Method / prompt methods | No Prompt | Safety System Prompt | DAN Prompt | Safety System Prompt + DAN Prompt |
| :---------------------- | :-------- | :------------------- | :--------- | :-------------------------------- |
| Grok-style CAI (SFT only) | 9/10      | 10/10                | 7/10       | 8/10                              |
| Grok-style CAI (SFT + DPO) | 10/10     | 10/10                | 9/10       | 10/10                             |
| Baseline (SFT + DPO)    | 5/10      | 4/10                 | 1/10       | 1/10                              |

## 引用（Notable quotes）
*   「Constitutional AI is this clever idea that we can ask helpful models to align themselves.」（Constitutional AIとは、有用なモデルに自らをアライメントさせるという賢いアイデアである。）
*   「The practitioners only need to define the principles instead of having to collect expensive human feedback to improve the model.」（実践者は、モデルを改善するために高価な人間フィードバックを収集する代わりに、原則を定義するだけでよい。）
*   「We found training on the CAI dataset does not necessarily reduce helpfulness (i.e., paying the alignment tax).」（CAIデータセットでの訓練が必ずしも有用性を低下させない（すなわち、アライメント税を払う必要がない）ことを発見した。）
*   「CAI systems are more robust, also more resilient to DAN.」（CAIシステムはより堅牢であり、DAN（Do Anything Now）プロンプトに対してもより回復力がある。）

## リスクと課題
*   **自己批判の不完全性**: モデルの自己批判プロセスは常に完璧ではなく、憲法原則に反する応答を検出できない場合がある。
*   **実装上の工夫の必要性**: 特に小規模モデルの場合、効果的なシステムプロンプトの作成、応答の後処理、few-shotプロンプティングが実践的に必要となる。
*   **過学習のリスク**: DPOモデルが特定のスタイル（例：Grok風の皮肉）に過学習し、望ましくないほど強くなる場合があり、その場合はSFTモデルの使用が推奨されることもある。

## 今後の見通し/アクション
Hugging Faceは、コミュニティが公開されたレシピ、ツール、データセット、モデルを活用し、多様な「憲法」を開発し、オープンソースモデルのアライメントに貢献することを期待しています。これにより、LLMの安全性と有用性の両立、そして多様なAIパーソナリティの実現がさらに進むでしょう。

## Source URL（必須）
https://huggingface.co/blog/constitutional_ai
