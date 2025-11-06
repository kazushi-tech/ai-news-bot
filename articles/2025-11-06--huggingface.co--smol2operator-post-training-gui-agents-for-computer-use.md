---
title: "Smol2Operator: Post-Training GUI Agents for Computer Use"
title_ja: "Smol2Operator、GUIエージェントでPC自動操作"
source_url: "https://huggingface.co/blog/smol2operator"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、軽量なビジョン言語モデル(SmolVLM2-2.2B-Instruct)をGUIエージェントに進化させるための包括的なトレーニング手法「Smol2Operator」を発表しました。この手法は、不均一なGUIアクションを統一するデータ変換パイプラインと、知覚・認知の2段階トレーニング戦略を通じて、モデルにGUIグラウンディング能力とエージェント的推論能力を付与します。全てのトレーニングレシピ、データ処理ツール、学習済みモデル、デモ、データセットはオープンソースとして公開され、再現性とさらなる研究を促進します。

## 重要ポイント
*   **統一されたアクション空間**: 複数のGUI自動化データセットの不均一なアクション表現を、標準化された関数名と引数構造を持つ統一フォーマットに変換するパイプラインを開発。
*   **2段階トレーニング戦略**:
    *   **Phase 1 (知覚)**: SmolVLM2にGUI要素の理解と位置特定能力（グラウンディング）を付与。ScreenSpot-v2ベンチマークでベースライン0%から41.27%へ大幅改善。
    *   **Phase 2 (認知)**: エージェント的推論能力を強化し、複雑な多段階インタラクションを計画・実行できるようにする。ScreenSpot-v2ベンチマークでさらに61.71%まで性能向上。
*   **最適化された設定**: 1152pxの画像解像度と正規化された座標（0-1範囲）がSmolVLM2に最適であることを確認。
*   **オープンソース化**: 全てのトレーニングコード、データ処理パイプライン、変換済みデータセット、学習済みモデルが公開され、再現性とコミュニティによる発展を支援。
*   **小規模VLMでの有効性**: 460MパラメータのnanoVLMでも同様のトレーニング戦略で約58%のScreenSpot-v2スコアを達成し、戦略のスケーラビリティを実証。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、GUI自動化のためのビジョン言語モデル「Smol2Operator」の開発プロセスを公開しました。このプロジェクトでは、GUIグラウンディング能力がゼロの軽量VLM (SmolVLM2-2.2B-Instruct) をベースモデルとして採用。まず、異なるデータセットのアクション表現を統一するデータ変換パイプラインを構築しました。次に、この統一されたデータを用いて、Phase 1でモデルにGUI要素の知覚・位置特定能力を、Phase 2でエージェント的推論能力をそれぞれ教師ありファインチューニング(SFT)によって付与しました。最終的に、モデルはGUIを理解し、複雑なタスクを実行できるエージェント的コーダーへと進化しました。

### 背景
GUI自動化はコンピュータビジョンにおける最も困難な分野の一つであり、AIエージェントがモバイル、デスクトップ、ウェブプラットフォームをナビゲートできるようにすることで、デジタルインタラクションの未来を再構築する可能性を秘めています。しかし、既存のGUI自動化データセットはアクション表現が標準化されておらず、異なる関数シグネチャ、パラメータ命名規則、アクション分類法が混在しているため、統一されたモデルのトレーニングが困難でした。SmolVLM2-2.2B-Instructは、GUIタスクに対するグラウンディング能力が全くなかったため、このトレーニング手法の有効性を実証する理想的なベースモデルとして選ばれました。

### 影響
この研究は、高品質で推論指向のデータが、小規模なVLMであってもGUIグラウンディング能力を大幅に向上させることを示しました。ScreenSpot-v2ベンチマークにおいて、ベースラインの0%からPhase 1で41.27%、Phase 2で61.71%へと劇的な性能改善を達成しました。これにより、GUIグラウンディング能力がデータの品質に大きく左右されることが強調され、GUIエージェント開発におけるデータキュレーションの重要性が示されました。また、全ての成果物（トレーニングコード、データ処理パイプライン、データセット、学習済みモデル）をオープンソースとして公開することで、研究コミュニティがこの分野をさらに発展させるための基盤を提供しています。

### 関係者
*   **Hugging Face**: 本ブログ記事の公開元であり、ベースモデルであるSmolVLM2-2.2B-Instructの開発元。Smol2Operatorプロジェクトを主導。
*   **AGUVIS (xlangai)**: 本研究のインスピレーション源となった論文であり、トレーニングに使用された元のデータセット (xlangai/aguvis-stage1, xlangai/aguvis-stage2) の提供元。
*   **smolagents**: 変換され、公開された統一アクション空間データセット (smolagents/aguvis-stage-1, smolagents/aguvis-stage-2) のホスティング元。

### データ
*   **元のデータセット**: xlangai/aguvis-stage1, xlangai/aguvis-stage2 (AGUVISプロジェクト由来)
*   **データ変換**:
    *   **目的**: 複数のデータセットにわたる不均一なGUIアクションフォーマットを、単一の統一フォーマットに変換。
    *   **方法**: `Function Parser`、`Action Conversion System`、`Action Space Converter`といったツール群を開発。モバイルおよびPyAutoGUIデスクトップアクションを標準化されたAPIフォーマットに変換し、座標の正規化（0-1範囲）を実施。正規化座標は、異なる画像解像度でもデータの一貫性を保つために重要。
*   **変換後のデータセット**: smolagents/aguvis-stage-1, smolagents/aguvis-stage-2
*   **トレーニングデータ**:
    *   **Phase 1**: `smolagents/aguvis-stage-1`を使用。低レベルの指示と実行可能なコード形式のアクション（例: "click on more button" -> "click(x=0.8875, y=0.2281)"）をペアリングし、GUIグラウンディングを学習。
    *   **Phase 2**: `smolagents/aguvis-stage-2`を使用。エージェント的シナリオ（例: 明示的な推論、多段階のインタラクション、高レベルの指示から低レベルのアクションへの変換）を導入し、認知能力を強化。

### 性能比較 (ScreenSpot-v2)

| 設定 (座標 / 画像サイズ) | ScreenSpot-v2 (%) (ベースライン) | ScreenSpot-v2 (%) (Phase 1) | ScreenSpot-v2 (%) (Phase 2) |
| :----------------------- | :------------------------------: | :-------------------------: | :-------------------------: |
| ベース / –               | 0.47 (正規化) / 0.55 (ピクセル)  | –                           | –                           |
| 384px (正規化)           | 31.28                            | –                           | –                           |
| 764px (正規化)           | 32.32                            | –                           | –                           |
| 1152px (正規化)          | 33.72                            | 41.27                       | 61.71                       |
| 384px (ピクセル)         | 1.17                             | –                           | –                           |
| 764px (ピクセル)         | 2.67                             | –                           | –                           |
| 1152px (ピクセル)        | 4.32                             | –                           | –                           |

*注: ベースラインはSmolVLM2-2.2B-Instructの初期性能。Phase 1は`smolagents/aguvis-stage-1`で2エポック学習後。Phase 2はPhase 1のチェックポイントから`smolagents/aguvis-stage-2`で2エポック学習後。*

## 引用（Notable quotes）
*   "This work shows how a lightweight vision–language model can acquire GUI-grounded skills and evolve into an agentic GUI coder."
*   "Rather than aiming for a SOTA model, our goal is to demonstrate the entire process, from data processing to model training, and, in doing so, show how to unlock GUI-grounding capabilities in VLMs."
*   "This dramatic improvement demonstrates that our Phase 1 training successfully instilled fundamental grounding capabilities in the model, enabling it to understand and locate visual elements within screenshots."
*   "Our experiments demonstrate that high-quality, reasoning-oriented data can substantially improve GUI grounding, even for small VLMs, using only supervised fine-tuning (SFT)."

## リスクと課題
*   **データセットの不均一性**: 複数のGUI自動化データセット間でのアクション表現の標準化の欠如は、モデルトレーニングの主要な課題であり、Smol2Operatorはこれを解決するためのパイプラインを提供したが、新しいデータセットが登場するたびに適応が必要となる。
*   **SOTAモデルとの比較**: 本研究の目標はSOTAモデルの達成ではなく、GUIグラウンディング能力を解放するプロセスを示すことにあるため、絶対的な性能では他の大規模モデルに劣る可能性がある。
*   **推論能力の限界**: 教師ありファインチューニング(SFT)は、静的なデータセットに依存するため、リアルタイムの適応やより高度な推論能力の開発には限界がある。

## 今後の見通し/アクション
*   **高度な推論能力の開発**: 今後は、強化学習(RL)や直接選好最適化(DPO)といった新興の手法を活用し、より強力な推論能力とリアルタイム適応能力を持つGUIエージェントの開発を目指す。
*   **コミュニティによる発展**: 全てのトレーニングコード、データ処理パイプライン、データセット、学習済みモデルがオープンソースとして公開されており、研究コミュニティがこれを基盤として、異なるモデルやアーキテクチャでの実験、新しいドメインへの適応、さらなる性能向上を推進することが期待される。
*   **GUIエージェントの普及**: この研究は、AIエージェントがモバイル、デスクトップ、ウェブプラットフォームをナビゲートし、デジタルインタラクションの未来を再構築する可能性を示唆している。

## Source URL（必須）
https://huggingface.co/blog/smol2operator
