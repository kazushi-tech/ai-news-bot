---
title: "Smol2Operator: Post-Training GUI Agents for Computer Use"
title_ja: "Smol2Operator、訓練済みGUIエージェントがPC操作を自動化"
source_url: "https://huggingface.co/blog/smol2operator"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
本研究は、軽量なVision-Language Model (VLM) がGUIに特化したスキルを習得し、エージェント的なGUIコーダーへと進化するプロセスを示しています。GUIグラウンディング能力を解放するためのデータ処理からモデル訓練までの包括的なアプローチを提示し、全ての訓練レシピ、データ処理ツール、結果モデル、デモ、データセットをオープンソースとして公開し、再現性とさらなる研究を促進します。

## 重要ポイント
*   **GUIグラウンディング能力の解放**: 軽量VLM「SmolVLM2-2.2B-Instruct」が、GUI要素の理解と正確な位置特定能力を習得。
*   **2段階訓練戦略**:
    1.  **Phase 1 (知覚)**: 統一されたアクション空間データセットでGUIグラウンディング能力を付与。
    2.  **Phase 2 (認知)**: エージェント的推論データセットで、複雑な多段階インタラクションを実行する能力を強化。
*   **データ変換パイプライン**: 複数のGUIデータセットに存在するアクション表現の不統一を解消するため、統一されたアクション空間と正規化された座標システムを導入。
*   **オープンソース化**: 全ての訓練コード、データ処理パイプライン、データセット、訓練済みモデルが公開され、研究コミュニティによる再現と発展を支援。
*   **性能向上**: ScreenSpot-v2ベンチマークで、ベースラインの0%からPhase 1で41.27%、Phase 2で61.71%へと大幅な性能向上を達成。

## 詳細レポート
### What happened
Hugging Faceは、軽量なVision-Language Model (VLM) であるSmolVLM2-2.2B-Instructをベースに、GUI（Graphical User Interface）の自動化とインタラクションを可能にする「Smol2Operator」というエージェントを開発しました。これは、GUIグラウンディング能力がゼロの状態から、GUIを理解し操作できるエージェント的なコーダーへと進化させるための包括的な訓練アプローチを提示しています。全ての訓練レシピ、データ処理ツール、モデル、デモ、およびデータセットがオープンソースとして公開されています。

### 背景
GUI自動化はコンピュータビジョンにおける最も困難な分野の一つであり、AIエージェントがモバイル、デスクトップ、ウェブプラットフォームをナビゲートできるようにすることは、デジタルインタラクションの未来を再構築する可能性を秘めています。しかし、既存のGUI自動化データセットはアクション表現が不統一であり、統一されたモデルの訓練を妨げていました。本プロジェクトは、この課題を克服し、VLMにGUIグラウンディング能力を付与するプロセスを実証することを目的としています。

### 影響
Smol2Operatorの成功は、高品質で推論指向のデータが、小規模なVLMであってもGUIグラウンディング能力を大幅に向上させ得ることを示しました。また、全ての成果物をオープンソースとして公開することで、研究コミュニティがGUIエージェントの開発を加速し、再現性のある研究を促進するための基盤を提供します。これにより、AIエージェントがより複雑なデジタルタスクを自律的に実行できるようになる道が開かれます。

### 関係者
*   **Hugging Face**: 本ブログ記事の公開元であり、Smol2Operatorプロジェクトの開発とオープンソース化を主導。
*   **SmolVLM2-2.2B-Instruct**: ベースラインとして使用された軽量なVision-Language Model。
*   **AGUVIS**: データセットのキュレーションと研究のインスピレーション元となった論文。そのデータセット(xlangai/aguvis-stage1, xlangai/aguvis-stage2)が本プロジェクトのデータ変換の基礎として使用されました。

### データ
プロジェクトでは、AGUVISのオープンソースデータセットを基に、以下の2段階の訓練データセットを構築しました。

**データ変換と統一アクション空間:**
異なるデータセットのアクション表現の不統一を解消するため、関数解析と正規化、アクション空間の統一（不要なアクションの削除、パラメータ命名規則の標準化）を行うパイプラインを開発しました。特に、座標は画像サイズに依存しない正規化された範囲（0-1）に変換されました。

*   **変換前（例）**:
    *   `mobile.open_app(app_name='drupe')`
    *   `pyautogui.click(x=0.8102, y=0.9463)`
*   **変換後（統一フォーマット例）**:
    *   `open_app(app_name='drupe')`
    *   `click(x=0.8102, y=0.9463)`

この変換プロセスにより、`smolagents/aguvis-stage-1`と`smolagents/aguvis-stage-2`という2つの新しいデータセットが生成・公開されました。

**訓練データと結果:**
訓練は2つのフェーズに分けて行われ、ScreenSpot-v2ベンチマークで評価されました。

| フェーズ | 訓練データセット | 目的 | 最適設定 (画像解像度 / 座標システム) | ScreenSpot-v2 (%) |
| :------- | :--------------- | :--- | :---------------------------------- | :---------------- |
| ベースライン | - | - | - | 0.47 (正規化) / 0.55 (ピクセル) |
| Phase 1 | `smolagents/aguvis-stage-1` | GUIグラウンディング（知覚） | 1152px / 正規化 (0-1) | 41.27 |
| Phase 2 | `smolagents/aguvis-stage-2` | エージェント的推論（認知） | 1152px / 正規化 (0-1) | 61.71 |
| (参考) nanoVLM-460M | `smolagents/aguvis-stage-1`, `smolagents/aguvis-stage-2` | - | - | ~58 |

Phase 1では、低レベルの指示と実行可能なアクションのペアを用いて、モデルにGUI要素の理解と位置特定能力を付与しました。最適な設定は1152pxの画像解像度と正規化された座標でした。
Phase 2では、エージェント的なシナリオ（明示的な推論、複数ステップのコンテキスト）を含むデータを用いて、モデルの推論能力を強化しました。これにより、ScreenSpot-v2の精度がさらに向上しました。

## 引用（Notable quotes）
*   "This work shows how a lightweight vision–language model can acquire GUI-grounded skills and evolve into an agentic GUI coder."
*   "Rather than aiming for a SOTA model, our goal is to demonstrate the entire process, from data processing to model training, and, in doing so, show how to unlock GUI-grounding capabilities in VLMs."
*   "This dramatic improvement demonstrates that our Phase 1 training successfully instilled fundamental grounding capabilities in the model, enabling it to understand and locate visual elements within screenshots."
*   "Our experiments demonstrate that high-quality, reasoning-oriented data can substantially improve GUI grounding, even for small VLMs, using only supervised fine-tuning (SFT)."

## リスクと課題
*   **SFTの限界**: 現在のSupervised Fine-Tuning (SFT) は静的なデータセットに依存しており、リアルタイムでの適応や、より複雑で未知のシナリオへの対応には限界があります。
*   **データセットの網羅性**: GUI環境は多様であり、全ての可能なインタラクションやUI要素を網羅するデータセットを構築することは依然として大きな課題です。
*   **モデルの頑健性**: 異なるOS、デバイス、アプリケーション、UIデザインに対するモデルの汎用性と頑健性を確保する必要があります。
*   **計算リソース**: 高解像度画像での訓練は、特に大規模モデルの場合、依然として高い計算リソースを要求します。

## 今後の見通し/アクション
*   **強化学習 (RL) や直接選好最適化 (DPO) の導入**: SFTの限界を克服し、より強力な推論能力とリアルタイム適応性を開発するために、RLやDPOなどの新興手法の活用が検討されています。
*   **インタラクションを通じた学習**: 静的なデータセットにのみ依存するのではなく、エージェントが実際のインタラクションを通じて学習し、改善する次世代のGUIエージェントの開発を目指します。
*   **コミュニティとの連携**: オープンソース化されたツールとデータセットを活用し、研究コミュニティがGUIエージェントのフロンティアをさらに押し広げることを期待しています。

## Source URL
https://huggingface.co/blog/smol2operator
