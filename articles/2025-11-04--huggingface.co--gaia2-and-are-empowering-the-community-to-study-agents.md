---
title: "Gaia2 and ARE: Empowering the community to study agents"
title_ja: "**Gaia2とARE エージェント研究と評価を強力支援**"
source_url: "https://huggingface.co/blog/gaia2"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、AIエージェントの評価ベンチマーク「Gaia2」と、その実行・デバッグ・評価のためのフレームワーク「Meta Agents Research Environments (ARE)」をリリースしました。Gaia2は、従来のGAIAベンチマークを大幅に拡張し、より複雑で現実世界に近いインタラクティブなタスクに焦点を当てています。AREは、エージェントの行動をシミュレートし、詳細なトレースを記録することで、開発者がエージェントを容易にデバッグし、その能力を深く理解できるように設計されています。これにより、コミュニティがより信頼性が高く、適応性のあるAIエージェントを構築できるよう支援することを目指しています。

## 重要ポイント
*   **Gaia2ベンチマーク**: 従来のGAIAの後継で、読み書き可能、インタラクティブな行動、複雑性管理に重点を置いた新しいAIエージェント評価ベンチマーク。
*   **現実世界に近い条件**: 曖昧な指示、時間制約、ノイズの多い環境、ツール/APIの失敗などをシミュレートし、エージェントの適応性を評価。
*   **多様なタスクグループ**: 実行、検索、曖昧性処理、適応性、時間/時間的推論、エージェント間コラボレーション、ノイズ耐性など、1000の新規シナリオを含む。
*   **AREフレームワーク**: Gaia2を実行するためのオープンソース環境。エージェントの実行、デバッグ、評価をサポートし、スマートフォンを模したシミュレーション環境を提供。
*   **詳細なトレース機能**: エージェントの全インタラクション（ツール呼び出し、API応答、思考、タイミングなど）を構造化されたJSON形式で自動記録し、デバッグと分析を容易にする。
*   **評価結果**: 2025年9月時点でGPT-5（高推論モード）が総合最高スコア、Kimi K2がオープンソースモデルで最高。曖昧性、適応性、ノイズ耐性、時間処理が依然として全モデルにとって大きな課題。
*   **コスト効率の考慮**: 単純な正答率だけでなく、LLM呼び出し回数や出力トークン数といったコストも評価指標に含め、コストパフォーマンスを重視。
*   **コミュニティへの開放**: Gaia2データセットはCC by 4.0、AREはMITライセンスで公開され、開発者が自身のモデルを評価し、リーダーボードに参加可能。

## 詳細レポート（What happened/背景/影響/関係者/データ）
**What happened:**
Hugging Faceは、AIエージェントの能力を評価するための新しいベンチマーク「Gaia2」と、エージェントの実行、デバッグ、評価を可能にするフレームワーク「Meta Agents Research Environments (ARE)」を発表しました。これらは、より現実世界に近い複雑なシナリオでエージェントの行動を研究し、改善することを目的としています。

**背景:**
理想的なAIエージェントは、曖昧な指示を管理し、計画を立て、リソースを特定し、実行し、予期せぬ事態に適応し、正確性を保ち、ハルシネーションを避けることが求められます。しかし、既存の評価環境はタスクと密結合しており、現実世界の柔軟性に欠け、シミュレーションが「ごちゃごちゃした」現実を反映していませんでした。また、エージェントのデバッグは非常に困難でした。2023年に発表されたGAIAベンチマークも、簡単なレベルがすでに容易になり、より難しく、インタラクティブな評価が必要とされていました。

**影響:**
Gaia2とAREのリリースにより、AIエージェント開発者は、より現実世界に近い条件でエージェントの能力を評価し、その動作を詳細にデバッグできるようになります。これにより、エージェントの信頼性、適応性、堅牢性の向上に貢献し、AIエージェント研究コミュニティ全体の進歩を加速させることが期待されます。また、コスト効率を考慮した評価指標の導入は、実用的なエージェント開発を促進します。

**関係者:**
*   **Hugging Face**: Gaia2とAREの発表およびコミュニティへの提供。
*   **Meta**: AREフレームワークの開発元。
*   **AIエージェント開発コミュニティ**: Gaia2とAREを利用して、自身のAIエージェントを評価、デバッグ、研究するユーザー。

**データ:**
*   **Gaia2データセット**: CC by 4.0ライセンスで公開。1000の人間が作成した新規シナリオを含む。
*   **AREフレームワーク**: MITライセンスで公開。
*   **評価対象モデル**: Llama 3.3-70B Instruct, Llama-4-Maverick, GPT-4o, Qwen3-235B-MoE, Grok-4, Kimi K2, Gemini 2.5 Pro, Claude 4 Sonnet, GPT-5。
*   **評価方法**: ReActループ、温度0.5、16Kトークン生成制限。モデル・アズ・ア・ジャッジ（Llama 3.3 Instruct 70B）と厳密一致評価の組み合わせ。101のツールと環境説明はシステムプロンプトで提供。
*   **評価結果**: 2025年9月時点でGPT-5（高推論モード）が総合最高スコア、Kimi K2がオープンソースモデルで最高。単純なツール呼び出しや指示実行、全体的な検索は改善が見られるが、曖昧性処理、適応性、ノイズ耐性、時間処理は依然として全モデルにとって困難な課題。特に時間処理が最も難しい。

## 引用（Notable quotes）
*   "In an ideal world, AI agents would be reliable assistants."
*   "However, developing agents and testing these behaviors is no small feat: if you have ever tried to debug your own agent, you’ve probably observed how tedious and frustrating this can be."
*   "Existing evaluation environments are tightly coupled with the tasks they evaluate, lack real-world flexibility, and do not reflect the messy reality of open-world agents."
*   "Where GAIA was read-only, Gaia2 is now a read-and-write benchmark, focusing on interactive behavior and complexity management."
*   "We want to test how agents manage tools or APIs that sometimes do not work, plan successions of actions with very specific time frames, and adapt to new events - a whole new range of complexity!"
*   "However, we believe it’s important to push reporting beyond raw scores: if the model is correct but took several thousand tokens to reach the correct solution, or ran for several hours, it is “not as good” as a model which succeeded orders of magnitude faster."
*   "Gaia2 and ARE are new research tools that we hope will empower anyone to easily build more reliable and adaptable AI agents."

## リスクと課題
*   **AIエージェントの未熟な能力**: 曖昧性処理、環境への適応性、ノイズ耐性、特に時間制約のあるアクションの正確な処理は、現在の最先端モデルにとっても依然として大きな課題です。
*   **評価の複雑性**: 単純な正答率だけでなく、LLM呼び出し回数や出力トークン数といったコストも考慮した評価は、より現実的である一方で、評価指標の設計と解釈を複雑にします。
*   **外部アプリ接続のリスク**: AREを外部のアプリケーション（例: MCPs）に接続する際、エージェントが不適切な権限でマシンを操作する可能性があるため、セキュリティ上の注意が必要です。
*   **シミュレーションの限界**: AREは現実世界に近い条件をシミュレートしますが、完全に現実世界の「ごちゃごちゃした」状況を再現することは依然として困難であり、シミュレーションと現実のギャップは常に存在します。

## 今後の見通し/アクション
*   **コミュニティによる活用**: Gaia2とAREは、より信頼性が高く適応性のあるAIエージェントを構築するための研究ツールとして、AIエージェント開発コミュニティに広く利用されることが期待されます。
*   **モデル評価とリーダーボードへの参加**: 開発者は自身のモデルをGaia2で評価し、結果をHugging Face Hubにアップロードしてリーダーボードに参加することで、モデルの性能を公開し、比較できます。
*   **エージェント研究の深化**: AREの柔軟な環境と詳細なトレース機能により、ベンチマークシナリオ以外でもエージェントの行動を深く研究したり、独自のツールやシナリオを接続してカスタマイズしたりすることが可能になります。
*   **デバッグと理解の促進**: AREの自動記録される構造化されたトレースは、エージェントの内部動作を深く理解し、デバッグプロセスを大幅に効率化します。
*   **新しいユースケースの創出**: コミュニティがAREを使って、ロボットアームとの連携デモのような創造的なユースケースを開発し、エージェントの可能性を広げることが期待されます。

## Source URL（必須）
https://huggingface.co/blog/gaia2
