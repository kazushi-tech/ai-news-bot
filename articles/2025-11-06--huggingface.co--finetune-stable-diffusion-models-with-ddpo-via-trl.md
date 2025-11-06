---
title: "Finetune Stable Diffusion Models with DDPO via TRL"
title_ja: "TRLのDDPOでStable Diffusion微調整 人間好みに"
source_url: "https://huggingface.co/blog/trl-ddpo"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

HuggingFaceは、`trl`ライブラリにDenoising Diffusion Policy Optimization (DDPO) を統合し、Stable Diffusionモデルのファインチューニングを可能にしました。これにより、拡散モデルが人間の好みや意図（例：美的感覚）に沿った高品質な画像を、計算効率良く生成できるようになります。DDPOは、従来のRLHF（Reinforcement Learning from Human Feedback）手法を拡散モデルに適用し、デノイズプロセスを多段階マルコフ決定プロセスとして捉えることで、より正確な最適化を実現します。

## 重要ポイント

*   **アライメント問題の解決**: 拡散モデルの生成画像が人間の好みや意図に合致しない「アライメント問題」に対し、LLMで成功したRLHFのアプローチをDDPOが拡散モデルに適用します。
*   **DDPOの優位性**: 従来のReward-weighted regression (RWR) と比較して、DDPOはデノイズプロセスを多段階MDPとして扱い、各ステップの正確な尤度を用いるため、計算効率が高く、より複雑な目的関数に対応できます。
*   **`trl`ライブラリへの統合**: HuggingFaceの`trl`ライブラリに`DDPOTrainer`が実装され、Stable DiffusionモデルのDDPOによるファインチューニングが容易になりました。
*   **高い汎化性能**: 最小限のトレーニングプロンプトサイズでも、美的感覚を報酬とする目的関数において、幅広いプロンプトに対して良好な汎化結果が得られました。
*   **LoRAとフルファインチューニング**: LoRA（Low-Rank Adaptation）が推奨されますが、フルファインチューニング（非LoRA）はより複雑な画像を生成する可能性があり、ただし安定した実行のためのハイパーパラメータ調整がより困難です。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
HuggingFaceは、`trl`ライブラリにDenoising Diffusion Policy Optimization (DDPO) の実装である`DDPOTrainer`を統合し、Stable Diffusionモデルのファインチューニングを可能にしました。これにより、ユーザーは拡散モデルを特定の目的関数（例：美的感覚）に基づいて効率的に調整できるようになります。

**背景:**
DALL-E 2やStable Diffusionのような拡散モデルは写実的な画像生成に優れていますが、生成される画像が常に人間の好みや意図（「品質」や「表現しにくい意図」など）に合致するとは限りません。この「アライメント問題」は、LLM（大規模言語モデル）分野でRLHF（Reinforcement Learning from Human Feedback）によって効果的に解決されてきました（ChatGPTの成功例）。DDPOは、Black et al.によって提案された手法で、デノイズプロセスを多段階マルコフ決定プロセス（MDP）として捉え、PPO（Proximal Policy Optimization）ベースのポリシー勾配法を用いて拡散モデルをRLでファインチューニングします。これにより、従来のReward-weighted regression (RWR) のような近似的な最適化ではなく、各デノイズステップの正確な尤度を計算して最適化することが可能になります。

**影響:**
DDPOを用いたStable Diffusionモデルのファインチューニングにより、モデルは人間が知覚する美的感覚や、その他の明確に定義された目的関数に沿った画像を生成できるようになります。これにより、生成画像の品質とユーザーの意図との間のギャップが埋まり、より実用的で満足度の高い画像生成が可能になります。特に、`trl`ライブラリを通じてこの技術が広く利用可能になることで、コミュニティ全体での拡散モデルの応用範囲が拡大することが期待されます。

**関係者:**
*   **HuggingFace**: `trl`ライブラリの開発とDDPOの統合。
*   **Black et al.**: DDPOアルゴリズムの提案者。
*   **RunwayML**: デフォルトの事前学習済みStable Diffusionモデルの提供元。

**データ:**
*   **ハードウェア要件**: 少なくともNVIDIA A100 GPUが必要。それ以下のGPUではメモリ不足の問題が発生する可能性が高い。
*   **インストール**:
    ```bash
    pip install trl[diffusers]
    pip install wandb torchvision # または tensorboard
    ```
*   **学習設定**:
    *   事前学習済みStable Diffusionモデルから開始。
    *   美的感覚予測モデル（AVAデータセットで学習したCLIPモデルに回帰ヘッドを追加）を報酬シグナルとして使用。
    *   デフォルトのプロンプトデータセットは動物名のリスト。
*   **推奨ハイパーパラメータ（単一GPU学習時）**:

| Parameter                          | Description                                                                                                                                  | Recommended value for single GPU training (as of now) |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| `num_epochs`                       | The number of epochs to train for                                                                                                            | 200                                                   |
| `train_batch_size`                 | The batch size to use for training                                                                                                           | 3                                                     |
| `sample_batch_size`                | The batch size to use for sampling                                                                                                           | 6                                                     |
| `gradient_accumulation_steps`      | The number of accelerator based gradient accumulation steps to use                                                                           | 1                                                     |
| `sample_num_steps`                 | The number of steps to sample for                                                                                                            | 50                                                    |
| `sample_num_batches_per_epoch`     | The number of batches to sample per epoch                                                                                                    | 4                                                     |
| `per_prompt_stat_tracking`         | Whether to track stats per prompt. If false, advantages will be calculated using the mean and std of the entire batch as opposed to tracking per prompt | True                                                  |
| `per_prompt_stat_tracking_buffer_size` | The size of the buffer to use for tracking stats per prompt                                                                                  | 32                                                    |
| `mixed_precision`                  | Mixed precision training                                                                                                                     | True                                                  |
| `train_learning_rate`              | Learning rate                                                                                                                                | 3e-4                                                  |

## 引用（Notable quotes）

「DDPOは、任意の報酬関数で拡散モデルをアライメントするための有望な技術であり、TRLでのリリースにより、コミュニティへのアクセスをより容易にできることを願っています！」

## リスクと課題

*   **モデルの制限**: 現在、`trl`の`DDPOTrainer`はバニラのStable Diffusionモデルのファインチューニングに限定されています。
*   **非LoRA設定の難しさ**: フルファインチューニング（非LoRA）はより高品質な画像を生成する可能性がありますが、安定した学習のための適切なハイパーパラメータを見つけることが非常に困難です。推奨される非LoRA設定は、学習率を約1e-5に低く設定し、`mixed_precision`を`None`にすることです。
*   **汎化の収束速度**: 明示的な汎化のためにトレーニングプロンプトのサイズを増やしたり、プロンプトを多様化したりする試みは、収束速度を遅らせるだけで、汎化の改善はほとんど見られませんでした。

## 今後の見通し/アクション

*   **幅広い応用**: DDPOは任意の報酬関数で拡散モデルをアライメントできるため、美的感覚だけでなく、JPEG圧縮性や視覚-テキストアライメントなど、様々な目的関数を統合してモデルをファインチューニングすることが可能です。
*   **コミュニティによる活用**: `trl`ライブラリを通じてDDPOがよりアクセスしやすくなったことで、研究者や開発者が拡散モデルのファインチューニングにDDPOを広く活用し、新たな応用や改善が生まれることが期待されます。
*   **さらなる研究**: 非LoRA設定のハイパーパラメータ調整の難しさや、明示的な汎化の課題は、今後の研究で解決すべき点として挙げられます。

## Source URL（必須）
https://huggingface.co/blog/trl-ddpo
