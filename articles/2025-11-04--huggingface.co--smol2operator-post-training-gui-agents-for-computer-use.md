---
title: 'Smol2Operator: Post-Training GUI Agents for Computer Use'
title_ja: Smol2Operator、訓練済みAIがGUI操作エージェントに進化
source_url: 'https://huggingface.co/blog/smol2operator'
date: '2025-11-04'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '# Smol2Operator: GUIエージェントのための訓練アプローチ'
key_points:
  - '- ## 概要 (TL;DR)'
  - >-
    - 本研究は、軽量なVision-Language Model (VLM)
    がGUIに根ざしたスキルを習得し、エージェント的なGUIコーダーへと進化する過程を示しています。完全な再現性とさらなる研究を促進するため、全ての訓練レシピ、データ処理ツ
  - '- ## 重要ポイント'
  - >-
    - *   **GUI自動化のブレークスルー**: 軽量VLM (SmolVLM2-2.2B-Instruct)
    をGUIエージェントに進化させるための包括的な2段階訓練アプローチ「Smol2Operator」を提示。
  - >-
    - *   **統一されたアクション空間**:
    複数のGUI自動化データセットに存在するアクション表現の不統一を解消するため、データ変換パイプラインを構築し、統一されたアクション空間を作成。
---
# Smol2Operator: GUIエージェントのための訓練アプローチ

## 概要 (TL;DR)
本研究は、軽量なVision-Language Model (VLM) がGUIに根ざしたスキルを習得し、エージェント的なGUIコーダーへと進化する過程を示しています。完全な再現性とさらなる研究を促進するため、全ての訓練レシピ、データ処理ツール、結果モデル、デモ、データセットを公開しています。

## 重要ポイント
*   **GUI自動化のブレークスルー**: 軽量VLM (SmolVLM2-2.2B-Instruct) をGUIエージェントに進化させるための包括的な2段階訓練アプローチ「Smol2Operator」を提示。
*   **統一されたアクション空間**: 複数のGUI自動化データセットに存在するアクション表現の不統一を解消するため、データ変換パイプラインを構築し、統一されたアクション空間を作成。
*   **2段階訓練プロセス**:
    *   **Phase 1 (Perception)**: GUI要素の認識と位置特定能力をモデルに付与。ScreenSpot-v2ベンチマークでベースラインから41%以上の改善を達成。
    *   **Phase 2 (Cognition)**: エージェント的推論能力（行動前の熟考と計画）を強化。ScreenSpot-v2ベンチマークでさらに61%以上まで性能を向上。
*   **オープンソース化**: 全ての訓練コード、データ処理パイプライン、データセット、訓練済みモデルをオープンソースとして公開し、研究コミュニティの貢献を促進。
*   **データ品質の重要性**: 高品質で推論指向のデータが、小型VLMであってもGUI認識能力を大幅に向上させることを実証。

## 詳細レポート（What happened/背景/影響/関係者/データ）
### What happened
Hugging Faceは、軽量なVision-Language Model (VLM) であるSmolVLM2-2.2B-InstructをGUIエージェントに進化させるための包括的な訓練アプローチ「Smol2Operator」を発表しました。このアプローチは、データセットのアクション表現を統一するパイプラインと、GUI要素の認識（Perception）およびエージェント的推論（Cognition）能力を段階的に付与する2フェーズの訓練戦略から構成されます。最終的な訓練済みモデル、訓練レシピ、データ処理ツール、およびデータセットは全てオープンソースとして公開されています。

### 背景
GUI自動化はコンピュータビジョン分野における最も困難な課題の一つであり、AIエージェントがモバイル、デスクトップ、ウェブプラットフォームを操作できるようにすることは、デジタルインタラクションの未来を再構築する可能性を秘めています。しかし、既存のGUI自動化データセットはアクション表現が標準化されておらず、異なるデータソース間で統一されたモデルを訓練することが困難でした。本研究は、この課題を解決し、GUI認識能力を持たないモデルをエージェント的なGUIコーダーへと変革するプロセスを示すことを目的としています。

### 影響
この研究は、GUI自動化の分野に新たな道を開き、AIエージェントがより複雑で多段階のデジタルインタラクションを実行できるようになる可能性を示しています。全ての成果物をオープンソースとして公開することで、研究コミュニティ全体の進歩を加速し、GUIエージェントのさらなる発展に貢献します。

### 関係者
*   **Hugging Face**: 本研究の実施およびブログ記事の公開元。
*   **SmolVLM2-2.2B-Instruct**: ベースラインとして使用された軽量Vision-Language Model。
*   **AGUVIS**: 本研究のプロセスにインスピレーションを与え、データセットの基盤を提供した先行研究。
*   **xlangai/aguvis-stage1, xlangai/aguvis-stage2**: データ変換の元となったオープンソースデータセット。
*   **smolagents/aguvis-stage-1, smolagents/aguvis-stage-2**: 変換・統一されたアクション空間を持つ公開データセット。
*   **smolagents/SmolVLM2-2.2B-Instruct-Agentic-GUI**: 訓練レシピを適用して生成された最終モデル。
*   **A-Mahla/Smol2Operator**: モデルの推論能力を試せる公開デモスペース。

### データ
#### 1. データ変換と統一アクション空間
*   **課題**: 複数のGUI自動化データセットにおけるアクション表現（関数名、パラメータ、タクソノミー）の不統一。
*   **アプローチ**: AGUVISのオープンソースデータセットを基に、関数解析とアクション変換システムを開発。
    *   関数名の正規化、パラメータの標準化、不要なアクションの削除を実施。
    *   座標は生ピクセル値ではなく、画像サイズに依存しない正規化座標（0-1範囲）を使用。
*   **ツール**: `utils/function_parser.py` (関数解析)、`preprocessing/action_conversion.py` (アクション変換)、`utils/action_space_converter.py` (カスタムアクション空間適応)。
*   **公開データセット**: `smolagents/aguvis-stage-1`、`smolagents/aguvis-stage-2`。

#### 2. Phase 1: From Zero to Perception (認識能力の獲得)
*   **目的**: モデルにGUI要素の認識と位置特定能力を付与。
*   **訓練データ**: `smolagents/aguvis-stage-1`（低レベル命令と実行可能アクションのペア）。
*   **最適化実験**: 異なる画像解像度（384px, 768px, 1152px）と座標システム（ピクセル vs. 正規化）を比較。
*   **主要な発見**: 1152px解像度と正規化座標（0-1範囲）がSmolVLM2に最も効果的。
*   **結果**: ScreenSpot-v2ベンチマークでベースラインの0%から41.27%へ大幅改善。

**表1: Baseline on HuggingFaceTB/SmolVLM2-2.2B-Instruct (400k samples, aguvis-stage-1)**

| Configuration (coords / image size) | Screenspot-v2 (%) |
| :---------------------------------- | :----------------- |
| Normalized coordinates / Base       | 0.47               |
| Normalized coordinates / 384        | 31.28              |
| Normalized coordinates / 764        | 32.32              |
| Normalized coordinates / 1152       | 33.72              |
| Pixel coordinates / Base            | 0.55               |
| Pixel coordinates / 384             | 1.17               |
| Pixel coordinates / 764             | 2.67               |
| Pixel coordinates / 1152            | 4.32               |

**表2: Baseline on HuggingFaceTB/SmolVLM2-2.2B-Instruct (2 epochs, aguvis-stage-1)**

| Configuration (coords / image size) | Screenspot-v2 (%) |
| :---------------------------------- | :----------------- |
| Normalized coordinates / 1152       | 41.27              |

#### 3. Phase 2: From Perception to Cognition (推論能力の強化)
*   **目的**: モデルにエージェント的推論能力（行動前の熟考と計画）を付与。
*   **訓練データ**: `smolagents/aguvis-stage-2`（明示的な推論、複数ステップのコンテキスト、高レベル命令を低レベルアクションに変換するシナリオ）。
*   **結果**: ScreenSpot-v2ベンチマークでPhase 1の41.27%から61.71%へ向上。推論能力の導入がGUI認識性能をさらに改善することを示唆。
*   **補足**: より小型のnanoVLM-460Mでも約58%を達成し、訓練戦略の有効性とスケーラビリティを実証。

**表3: Baseline on HuggingFaceTB/SmolVLM2-2.2B-Instruct after Phase 1 finetuning (2 epochs, aguvis-stage-1)**

| Configuration (coords / image size) | Screenspot-v2 (%) |
| :---------------------------------- | :----------------- |
| Normalized coordinates / 1152       | 61.71              |

## 引用（Notable quotes）
*   "This work shows how a lightweight vision–language model can acquire GUI-grounded skills and evolve into an agentic GUI coder."
*   "Rather than aiming for a SOTA model, our goal is to demonstrate the entire process, from data processing to model training, and, in doing so, show how to unlock GUI-grounding capabilities in VLMs."
*   "This dramatic improvement demonstrates that our Phase 1 training successfully instilled fundamental grounding capabilities in the model, enabling it to understand and locate visual elements within screenshots."
*   "The accuracy on ScreenSpot-v2 increased from 41% to 61%, indicating that explicit reasoning improves GUI grounding performance."
*   "Our experiments demonstrate that high-quality, reasoning-oriented data can substantially improve GUI grounding, even for small VLMs, using only supervised fine-tuning (SFT)."

## リスクと課題
*   **GUI自動化の複雑性**: GUI自動化はコンピュータビジョンにおける最も困難なフロンティアであり、多様なUI要素、動的な変化、ユーザーの意図の解釈など、多くの複雑な課題が存在します。
*   **データセットの不統一**: 異なるGUI自動化データセット間でのアクション表現の標準化の欠如は、統一されたモデル訓練を妨げる主要な課題でした。本研究ではこれを解決しましたが、新たなデータセットが登場するたびに同様の課題が生じる可能性があります。
*   **SFTの限界**: 現在のSupervised Fine-Tuning (SFT) ベースのアプローチは、静的データセットに依存しているため、リアルタイムでの適応性や、より高度で自律的な推論能力には限界がある可能性があります。

## 今後の見通し/アクション
*   **次世代GUIエージェントの開発**: Reinforcement Learning (RL) や Direct Preference Optimization (DPO) などの新しい手法を活用し、より強力な推論能力とリアルタイム適応性を備えたGUIエージェントを開発します。これにより、静的データセットにのみ依存するのではなく、インタラクションを通じて学習し改善するエージェントの実現を目指します。
*   **オープンソースコミュニティとの協業**: 公開された訓練レシピ、データ処理パイプライン、データセット、モデルを活用し、研究コミュニティがGUIエージェントの未来を共に構築することを奨励します。異なるモデルやアーキテクチャでの実験、新しいドメインへのアプローチの適応などが期待されます。

## Source URL
https://huggingface.co/blog/smol2operator
