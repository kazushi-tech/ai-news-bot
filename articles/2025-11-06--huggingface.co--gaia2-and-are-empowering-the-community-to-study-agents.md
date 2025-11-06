---
title: "Gaia2 and ARE: Empowering the community to study agents"
title_ja: "Gaia2とARE、AIエージェントの評価・研究を支援する新環境"
source_url: "https://huggingface.co/blog/gaia2"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、より複雑で現実世界に近いAIエージェントの評価ベンチマーク「Gaia2」と、その実行・デバッグ・評価を可能にするオープンフレームワーク「Meta Agents Research Environments (ARE)」を発表しました。Gaia2は、従来のベンチマークGAIAを大幅に超え、インタラクティブな行動や現実世界のノイズへの対応能力を評価します。AREは、エージェント開発者が現実の課題に対応できる信頼性の高いエージェントを構築・研究できるよう、カスタマイズ可能なシミュレーション環境と詳細なトレース分析機能を提供します。

## 重要ポイント

*   **Gaia2ベンチマーク**: 従来のGAIAを大幅に強化した、より複雑で現実世界に近いAIエージェント評価ベンチマーク。読み書き可能でインタラクティブな行動、ノイズ耐性、時間制約、適応性などを評価します。
*   **AREフレームワーク**: Gaia2を実行・デバッグ・評価するためのオープンソース環境。スマートフォンモックアップをシミュレートし、エージェントの全インタラクションを構造化されたトレースとして記録・分析できます。
*   **評価結果**: 複数の大規模言語モデルを評価し、GPT-5（高推論モード）が最高スコア、オープンソースモデルではKimi K2が最高でした。時間処理タスクが最も困難であることが判明しています。
*   **コミュニティへの開放**: Gaia2データセット（CC by 4.0）とAREフレームワーク（MITライセンス）は公開されており、誰でも自身のモデルを評価し、結果をHugging Face Hubのリーダーボードで共有できます。
*   **カスタマイズ性**: AREは、独自のツール接続やカスタムシナリオの実装を通じて、エージェントの多様な行動を研究するための柔軟な環境を提供します。

## 詳細レポート（What happened/背景/影響/関係者/データ）

*   **What happened**:
    Hugging Faceは、AIエージェントの能力をより深く、現実世界に近い条件で評価するための新しいベンチマーク「Gaia2」と、その実行・デバッグ・評価を可能にするオープンフレームワーク「Meta Agents Research Environments (ARE)」を発表しました。Gaia2データセットはCC by 4.0、AREはMITライセンスで公開されています。
*   **背景**:
    従来のAIエージェント評価環境は、タスクと密接に結合し、現実世界の柔軟性に欠け、シミュレーションが現実の「混沌」を十分に反映していませんでした。また、2023年に発表されたGAIAベンチマークの簡単なレベルは既にモデルにとって容易になり、より難しく、インタラクティブな行動を評価できる新しいベンチマークが必要とされていました。
*   **影響**:
    Gaia2とAREは、エージェントが曖昧な指示の管理、計画の構築、リソースの特定、計画の実行、予期せぬイベントへの適応といった複雑な行動を、現実世界に近いノイズの多い環境で評価・デバッグすることを可能にします。これにより、より信頼性が高く、適応性の高いAIエージェントの開発が促進されます。
*   **関係者**:
    Hugging Face (本発表の主体)、Meta (AREフレームワークの開発元)、AIエージェント研究コミュニティ (Gaia2とAREの主要な利用者)。
*   **データ**:

    | 項目 | 詳細 |
    | :--- | :--- |
    | **Gaia2データセット** | CC by 4.0ライセンス。1000の人間作成シナリオ。 |
    | **AREフレームワーク** | MITライセンス。 |
    | **評価モデル** | Llama 3.3-70B Instruct, Llama-4-Maverick, GPT-4o, Qwen3-235B-MoE, Grok-4, Kimi K2, Gemini 2.5 Pro, Claude 4 Sonnet, GPT-5。 |
    | **最高スコアモデル** | GPT-5 (高推論モード) |
    | **最高オープンソースモデル** | Kimi K2 |
    | **評価設定** | ReActループ、温度0.5、16Kトークン制限。モデル・アズ・ア・ジャッジと厳密一致評価の組み合わせ。 |
    | **考慮されるコスト** | LLM呼び出し数、出力トークン数。 |

    **Gaia2のタスクグループと評価結果**:
    *   **タスクグループ**: Execution (実行), Search (検索), Ambiguity Handling (曖昧さ処理), Adaptability (適応性), Time/temporal Reasoning (時間/時系列推論), Agent-to-Agent Collaboration (エージェント間コラボレーション), Noise Tolerance (ノイズ耐性)。
    *   **最も困難なタスク**: 時間/時系列推論 (Time/temporal Reasoning)。
    *   **依然として困難なタスク**: 曖昧さ処理 (Ambiguity Handling)、適応性 (Adaptability)、ノイズ耐性 (Noise Tolerance)。
    *   **比較的解決済みのタスク**: 実行 (Execution)、検索 (Search)。

## 引用（Notable quotes）

*   "In an ideal world, AI agents would be reliable assistants." (理想の世界では、AIエージェントは信頼できるアシスタントとなるだろう。)
*   "However, developing agents and testing these behaviors is no small feat: if you have ever tried to debug your own agent, you’ve probably observed how tedious and frustrating this can be." (しかし、エージェントを開発し、これらの振る舞いをテストすることは容易なことではない。自分のエージェントをデバッグしようとしたことがあるなら、それがどれほど退屈でイライラするものか、おそらく経験しているだろう。)
*   "Gaia2 and ARE are new research tools that we hope will empower anyone to easily build more reliable and adaptable AI agents - by allowing easy experiments, making real-world evaluation accessible to anyone, as well as improving trust through transparent, reproducible benchmarks and debuggable traces." (Gaia2とAREは、簡単な実験を可能にし、現実世界での評価を誰にでもアクセス可能にし、透明で再現性のあるベンチマークとデバッグ可能なトレースを通じて信頼性を向上させることで、誰もがより信頼性が高く適応性の高いAIエージェントを簡単に構築できるようになることを願う新しい研究ツールである。)

## リスクと課題

*   AIエージェントの開発とデバッグは依然として困難であり、既存の評価環境は現実世界の複雑さを十分に反映していませんでした。
*   モデルは時間制約のあるアクションの処理（時間/時系列推論）を苦手としており、これは現在のところ最も困難な課題です。
*   モデルの性能評価においては、単なる正答率だけでなく、コスト（LLM呼び出し数、出力トークン数）や実行時間も考慮する必要があります。
*   AREに外部アプリや信頼できないMCP (Multi-Agent Communication Protocol) を接続する場合、セキュリティ上のリスクに注意が必要です。

## 今後の見通し/アクション

*   コミュニティは、Gaia2とAREを活用して自身のAIエージェントを評価し、その結果をHugging Face Hubのリーダーボードで共有することが推奨されます。
*   AREは、ベンチマークシナリオを超えて、独自のツール接続やカスタムシナリオの実装を通じて、エージェントの多様な行動を研究するための柔軟な環境を提供します。
*   Hugging Faceは、コミュニティがAREを使って創造的な研究や開発を行い、より信頼性が高く適応性の高いAIエージェントの構築を進めることを期待しています。

## Source URL

https://huggingface.co/blog/gaia2
