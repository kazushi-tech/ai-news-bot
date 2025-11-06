---
title: "Welcome Fireworks.ai on the Hub 🎆"
title_ja: "HF HubにFireworks.aiが新登場！高速推論サービス開始"
source_url: "https://huggingface.co/blog/fireworks-ai"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Face Hubは、高速なサーバーレス推論を提供するFireworks.aiを新たな公式推論プロバイダーとして統合しました。これにより、ユーザーはHugging Faceのモデルページやエコシステム全体で、主要な大規模言語モデル（LLM）の推論をより手軽かつ高速に実行できるようになります。

## 重要ポイント
*   **Fireworks.aiの統合**: Hugging Face HubがFireworks.aiを公式推論プロバイダーとしてサポート開始。
*   **高速サーバーレス推論**: Fireworks.aiは、モデルページやHugging Faceのエコシステム全体で、非常に高速なサーバーレス推論を提供。
*   **多様な利用方法**: ウェブUI、Python/JavaScript SDK、HTTP APIコールを通じて推論を実行可能。
*   **主要モデルのサポート**: DeepSeek、Mistral、Qwen、Llamaなどの人気モデルがFireworks.ai経由で利用可能。
*   **課金体系**: Fireworksキー使用時はFireworksアカウントから直接課金。Hugging Face Hub経由認証時は標準のFireworks APIレートが適用され、Hugging Faceによる追加マークアップなし。
*   **PROユーザー特典**: Hugging Face PROユーザーは毎月2ドルの推論クレジットを獲得し、複数のプロバイダーで利用可能。

## 詳細レポート
### What happened
Hugging Faceは、最近発表した「Inference Providers on the Hub」の一環として、Fireworks.aiを新たな公式推論プロバイダーとしてHugging Face Hubに統合しました。これにより、ユーザーはHugging Faceのプラットフォーム上で、Fireworks.aiが提供する高速なサーバーレス推論サービスを直接利用できるようになりました。

### 背景
Hugging Faceは、AIモデルの利用をより容易にし、開発者が多様なモデルを効率的に活用できるエコシステムを構築することを目指しています。今回のFireworks.aiの統合は、その目標達成に向けた重要なステップであり、ユーザーに高性能な推論オプションを提供することで、モデルの活用をさらに加速させる狙いがあります。

### 影響
*   **ユーザー**: お気に入りのモデルで、より高速かつ手軽に推論を実行できるようになります。特に、サーバーレス環境での推論は、インフラ管理の手間を省き、開発効率を向上させます。
*   **開発者**: 既存のHugging Faceライブラリやツール（`huggingface_hub`、`@huggingface/inference`など）を通じて、シームレスにFireworks.aiの推論サービスを呼び出すことが可能になります。
*   **エコシステム**: Hugging Face Hubは、多様な推論プロバイダーを統合することで、プラットフォームとしての価値と利便性を高め、AI開発のハブとしての地位を強化します。

### 関係者
*   **Hugging Face**: AIモデルとデータセットのプラットフォーム運営者。
*   **Fireworks.ai**: 高速サーバーレス推論サービスプロバイダー。

### データ
Fireworks.ai経由でサーバーレス推論が可能な主要モデルの例：

| モデル名                               | 提供元      |
| :------------------------------------- | :---------- |
| deepseek-ai/DeepSeek-R1                | deepseek-ai |
| deepseek-ai/DeepSeek-V3                | deepseek-ai |
| mistralai/Mistral-Small-24B-Instruct-2501 | mistralai   |
| Qwen/Qwen2.5-Coder-32B-Instruct        | Qwen        |
| meta-llama/Llama-3.2-90B-Vision-Instruct | meta-llama  |
| (その他多数)                           |             |

## 引用（Notable quotes）
「Fireworks.ai delivers blazing-fast serverless inference directly on model pages, as well as throughout the whole HF ecosystem of libraries and tools, making it easier than ever to run inference on your favorite models.」
（Fireworks.aiは、モデルページ上およびHFエコシステム全体のライブラリやツールを通じて、超高速なサーバーレス推論を提供し、お気に入りのモデルでの推論をこれまで以上に容易にします。）

## リスクと課題
*   **課金体系の理解**: 直接課金とHugging Face経由の課金で異なるため、ユーザーは自身の利用状況に応じた課金体系を正確に理解する必要がある。
*   **APIキー管理**: 複数のプロバイダーを利用する場合、APIキーの適切な管理が求められる。
*   **将来の収益分配**: 将来的にはHugging Faceとプロバイダー間で収益分配契約が確立される可能性があり、その際の料金体系の変更が考えられる。

## 今後の見通し/アクション
*   **即時利用可能**: ユーザーはHugging Face Hubのモデルページや既存のHFツールを通じて、Fireworks.aiの高速推論をすぐに利用開始できます。
*   **PROプランの活用**: Hugging Face PROユーザーは、毎月付与される推論クレジットを活用することで、コストを抑えつつFireworks.aiを含む複数のプロバイダーのサービスを利用できます。
*   **エコシステムの拡大**: Hugging Faceは今後も、さらなる推論プロバイダーとの連携を強化し、AIモデル利用の選択肢と利便性を拡大していくと予想されます。

## Source URL
https://huggingface.co/blog/fireworks-ai
